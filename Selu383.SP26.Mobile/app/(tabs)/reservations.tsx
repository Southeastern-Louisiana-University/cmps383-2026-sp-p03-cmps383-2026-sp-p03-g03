import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PageHeaderActions } from '@/components/page-header-actions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { CommonStyles, getColors } from '@/constants/styles';
import { styles } from '@/styles/screens/reservations.styles';
import {
  ApiError,
  getReservations,
  getLocationReservations,
  getReservationAvailability,
  createReservation,
  createStripeCheckoutSession,
  syncStripePaymentStatus,
  updateReservation,
  cancelReservation,
  getLocations,
  getTables,
  type ReservationDto,
  type LocationDto,
  type TableDto,
  type ReservationCoverChargeRequiredDto,
} from '@/services/api';
import { ReservationsMySection } from '../../components/reservations/reservations-my-section';
import { ReservationsBookSection } from '../../components/reservations/reservations-book-section';
import { ReservationsManageSection } from '../../components/reservations/reservations-manage-section';
import { getUserPermissions } from '@/utils/role-helpers';
import {
  buildReservationDateTime,
  buildReservationCreatePayload,
  formatLocalDateTime,
  isReservationTooSoon,
  resolveCoverChargeCheckoutUrl,
  retryReservationCreateAfterPayment,
} from '@/utils/checkout-utils';

type Tab = 'my' | 'book' | 'manage';

function cleanReservationErrorMessage(rawMessage: string | undefined) {
  const message = (rawMessage || '').replace(/^API Error:\s*\d+\s*-\s*/, '').trim();

  if (!message) {
    return 'Could not complete booking.';
  }

  if (message.toLowerCase().includes('between 6:00 am and 6:00 pm')) {
    return 'Reservations must be scheduled between 6:00 AM and 6:00 PM local time.';
  }

  return message;
}

export default function ReservationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const { user, isGuest } = useAuth();
  const { isPrivileged, isAdmin, isManager, isStaff } = getUserPermissions(user?.roles);
  const isStaffOrManager = isManager || isStaff;

  // NOTE: guests can view their own reservations by confirmation link, but can't book from here
  const [tab, setTab] = useState<Tab>(isStaffOrManager ? 'manage' : 'my');

  const [myRes, setMyRes] = useState<ReservationDto[]>([]);
  const [loadingRes, setLoadingRes] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resError, setResError] = useState<string | null>(null);

  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [tables, setTables] = useState<TableDto[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [reservationName, setReservationName] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [takenTableIds, setTakenTableIds] = useState<number[]>([]);
  const [locationReservations, setLocationReservations] = useState<ReservationDto[]>([]);
  const [loadingLocationReservations, setLoadingLocationReservations] = useState(false);
  const [manageError, setManageError] = useState<string | null>(null);
  const [managingReservationId, setManagingReservationId] = useState<number | null>(null);

  const reservationTabs: Tab[] = useMemo(() => {
    if (isStaffOrManager) return ['manage'];
    if (isGuest && !user) return ['my'];
    return ['my', 'book', ...(isPrivileged ? ['manage'] : [])] as Tab[];
  }, [isStaffOrManager, isPrivileged, isGuest, user]);

  useEffect(() => {
    if (!reservationTabs.includes(tab)) {
      setTab(reservationTabs[0]);
    }
  }, [reservationTabs, tab]);

  const loadReservations = useCallback(async (isRefresh = false) => {
    if (isGuest && !user) {
      setMyRes([]);
      setLoadingRes(false);
      return;
    }
    if (isRefresh) setRefreshing(true);
    else setLoadingRes(true);

    setResError(null);

    try {
      const all = await getReservations();
      const list = Array.isArray(all) ? all : [];
      setMyRes(
        list.sort((a, b) => {
          const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;

          if (aCreated !== bCreated) {
            return bCreated - aCreated;
          }

          return new Date(b.reservedFor).getTime() - new Date(a.reservedFor).getTime();
        }),
      );
    } catch (e: any) {
      setResError(e.message || 'Failed to load reservations.');
    } finally {
      setLoadingRes(false);
      setRefreshing(false);
    }
  }, [isGuest, user]);

  useEffect(() => {
    Promise.all([getLocations(), getTables()])
      .then(([locs, tbls]) => {
        const active = locs.filter((l) => l.isActive);
        setLocations(active);
        if (active.length) setSelectedLocationId(active[0].id);
        setTables(tbls);
      })
      .catch((e: any) => {
        setBookingError(e.message || 'Failed to load reservation options.');
      })
      .finally(() => setLoadingMeta(false));
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const managedLocations = useMemo(() => {
    if (isAdmin) return locations;
    if (isManager) return locations.filter((l) => l.managerId === user?.id);
    if (isStaff && user?.locationId) return locations.filter((l) => l.id === user.locationId);
    return locations;
  }, [isAdmin, isManager, isStaff, locations, user]);

  const eligibleTables = useMemo(
    () =>
      tables.filter(
        (t) =>
          t.locationId === selectedLocationId &&
          t.isActive &&
          !t.isBarSeat &&
          t.seats >= partySize,
      ),
    [tables, selectedLocationId, partySize],
  );

  useEffect(() => {
    setSelectedTableId(null);
  }, [selectedLocationId, partySize]);

  const loadLocationReservations = useCallback(async () => {
    if (!isPrivileged || !selectedLocationId) {
      setLocationReservations([]);
      return;
    }

    setLoadingLocationReservations(true);
    setManageError(null);

    try {
      const list = await getLocationReservations(selectedLocationId);
      setLocationReservations(
        list.sort(
          (a, b) => new Date(a.reservedFor).getTime() - new Date(b.reservedFor).getTime(),
        ),
      );
    } catch (e: any) {
      setManageError(e.message || 'Failed to load location reservations.');
    } finally {
      setLoadingLocationReservations(false);
    }
  }, [isPrivileged, selectedLocationId]);

  useEffect(() => {
    if (!selectedLocationId || !selectedDate || selectedHour === null) {
      setTakenTableIds([]);
      return;
    }

    const reservedFor = formatLocalDateTime(buildReservationDateTime(selectedDate, selectedHour));

    getReservationAvailability(selectedLocationId, reservedFor)
      .then((data) => {
        setTakenTableIds(Array.isArray(data?.takenTableIds) ? data.takenTableIds : []);
      })
      .catch(() => {
        setTakenTableIds([]);
      });
  }, [selectedLocationId, selectedDate, selectedHour]);

  useEffect(() => {
    if (tab === 'manage') {
      if (managedLocations.length && !managedLocations.some((l) => l.id === selectedLocationId)) {
        setSelectedLocationId(managedLocations[0].id);
      }
      void loadLocationReservations();
    }
  }, [tab, loadLocationReservations, managedLocations, selectedLocationId]);

  useEffect(() => {
    if (selectedTableId && takenTableIds.includes(selectedTableId)) {
      setSelectedTableId(null);
    }
  }, [selectedTableId, takenTableIds]);

  const doCancel = (id: number) => {
    setCancelError(null);
    setConfirmingId(null);
    setCancellingId(id);

    cancelReservation(id)
      .then(async () => {
        await loadReservations(true);
        await loadLocationReservations();
      })
      .catch((e: any) => {
        const msg: string = e?.message || 'Could not cancel reservation.';
        const clean = msg.replace(/^API Error: \d+ - "?|"?$/g, '').trim();
        setCancelError(clean || msg);
        setManageError(clean || msg);
      })
      .finally(() => setCancellingId(null));
  };

  const updateStatus = async (reservation: ReservationDto, status: string) => {
    try {
      setManagingReservationId(reservation.id);
      setManageError(null);
      await updateReservation(reservation.id, {
        locationId: reservation.locationId,
        tableId: reservation.tableId,
        reservedFor: reservation.reservedFor,
        partySize: reservation.partySize,
        specialRequests: reservation.specialRequests,
        status,
      });
      await loadLocationReservations();
      await loadReservations(true);
    } catch (e: any) {
      setManageError(e.message || 'Could not update the reservation.');
    } finally {
      setManagingReservationId(null);
    }
  };

  const bookReservation = async () => {
    if (booking) return;

    setBookingError(null);

    if (!selectedLocationId) {
      setBookingError('Select a location.');
      return;
    }

    if (!selectedDate) {
      setBookingError('Pick a date.');
      return;
    }

    if (selectedHour === null) {
      setBookingError('Pick a time slot.');
      return;
    }

    if (!selectedTableId) {
      setBookingError('Select a table.');
      return;
    }

    if (takenTableIds.includes(selectedTableId)) {
      setBookingError('That table has already been taken for the selected time. Please choose another table.');
      return;
    }

    if (!user) {
      setBookingError('You must be logged in.');
      return;
    }

    const reservedFor = buildReservationDateTime(selectedDate, selectedHour);
    const reservationPayload = buildReservationCreatePayload({
      locationId: selectedLocationId,
      tableId: selectedTableId,
      reservedForIso: formatLocalDateTime(reservedFor),
      partySize,
      specialRequests,
      customerName: reservationName,
    });

    if (isReservationTooSoon(reservedFor)) {
      setBookingError('Must be at least 2 hours from now.');
      return;
    }

    setBooking(true);

    try {
      const created = await createReservation(reservationPayload);

      setSelectedDate(null);
      setSelectedHour(null);
      setSelectedTableId(null);
      setSpecialRequests('');
      setReservationName('');
      setPartySize(2);

      // Optimistically prepend the new reservation so the user sees it instantly,
      // then switch tabs and show feedback. Refresh from server in the background.
      if (created) {
        setMyRes((prev) => {
          const without = prev.filter((r) => r.id !== created.id);
          return [created, ...without];
        });
      }
      setTab('my');
      Alert.alert('Reservation Placed', 'Your reservation request was created. Payment is received and staff will confirm it shortly.');
      void loadReservations(true);
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 402) {
        const paymentInfo = e.data as ReservationCoverChargeRequiredDto | undefined;
        const amount = paymentInfo?.coverChargeAmount;
        const coverChargeOrderId = paymentInfo?.coverChargeOrderId;
        const checkoutUrl = paymentInfo?.checkoutUrl;

        Alert.alert(
          'Cover Charge Required',
          amount
            ? `A $${amount.toFixed(2)} non-refundable cover charge is required to reserve this table and time unless you already have a paid food or drink order over $10 at this location today.`
            : 'A cover charge may be required unless you already have a qualifying order over $10 at this location today.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Pay Now',
              onPress: async () => {
                const urlToOpen = await resolveCoverChargeCheckoutUrl(
                  coverChargeOrderId,
                  checkoutUrl,
                  createStripeCheckoutSession,
                  Linking.createURL('/'),
                );

                if (urlToOpen) {
                  try {
                    await WebBrowser.openBrowserAsync(urlToOpen);
                    // Stripe webhook can lag a few seconds; try a couple times before giving up.
                    const created = await retryReservationCreateAfterPayment({
                      createReservation: () => createReservation(
                        buildReservationCreatePayload({
                          locationId: selectedLocationId!,
                          tableId: selectedTableId!,
                          reservedForIso: formatLocalDateTime(reservedFor),
                          partySize,
                          coverChargeOrderId,
                          specialRequests,
                          customerName: reservationName,
                        }),
                      ),
                      isPendingError: (error) => error instanceof ApiError && error.status === 402,
                      maxAttempts: 3,
                      retryDelayMs: 900,
                      onBeforeAttempt: async () => {
                        if (coverChargeOrderId) {
                          try {
                            await syncStripePaymentStatus(coverChargeOrderId);
                          } catch {
                            // best effort
                          }
                        }
                      },
                    });

                    setTab('my');
                    await loadReservations(true);

                    if (created) {
                      setSelectedDate(null);
                      setSelectedHour(null);
                      setSelectedTableId(null);
                      setSpecialRequests('');
                      setPartySize(2);
                      Alert.alert('Reservation Placed', 'Payment received. Your reservation request is now listed in My Reservations and is awaiting staff confirmation.');
                    } else {
                      Alert.alert('Payment Received', 'Cover charge payment was received. Pull to refresh and try booking once more if it does not appear yet.');
                    }
                  } catch (browserErr: any) {
                    Alert.alert(
                      'Checkout Error',
                      browserErr?.message || 'Could not open checkout.',
                    );
                  }
                } else {
                  Alert.alert(
                    'Payment Required',
                    'Checkout could not be opened automatically. Please try again.',
                  );
                }
              },
            },
          ],
        );
      } else {
        setBookingError(cleanReservationErrorMessage(e?.message));
      }
    } finally {
      setBooking(false);
    }
  };

  return (
    <SafeAreaView style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={CommonStyles.scrollContent}
        refreshControl={
          tab === 'my'
            ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadReservations(true)}
                tintColor={colors.primary}
              />
            )
            : undefined
        }
      >
        <ThemedView style={CommonStyles.container}>
          <PageHeaderActions showPortal />

          <View style={styles.titleRow}>
            <Image
              source={require('@/assets/images/ConceptLogo2-FpjOWRtT.png')}
              style={styles.titleLogo}
              resizeMode="contain"
            />
            <ThemedText style={CommonStyles.title}>Reservations</ThemedText>
          </View>

          <View style={[styles.tabRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            {reservationTabs.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tabBtn, tab === t && { backgroundColor: colors.primary }]}
                onPress={() => setTab(t)}
                activeOpacity={0.85}
              >
                <ThemedText style={[styles.tabLabel, { color: tab === t ? '#fff' : colors.textSecondary }]}>
                  {t === 'my' ? 'My Reservations' : t === 'book' ? 'Book a Table' : 'Manage'}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'my' && (
            <ReservationsMySection
              colors={colors}
              loadingRes={loadingRes}
              resError={resError}
              myRes={myRes}
              isGuest={isGuest}
              cancelError={cancelError}
              confirmingId={confirmingId}
              cancellingId={cancellingId}
              onRetry={() => loadReservations()}
              onGoToBook={() => setTab('book')}
              onDismissCancelError={() => setCancelError(null)}
              onConfirmCancel={setConfirmingId}
              onKeepReservation={() => setConfirmingId(null)}
              onCancelReservation={doCancel}
            />
          )}

          {tab === 'book' && (
            <ReservationsBookSection
              colors={colors}
              loadingMeta={loadingMeta}
              locations={locations}
              selectedLocationId={selectedLocationId}
              setSelectedLocationId={setSelectedLocationId}
              partySize={partySize}
              setPartySize={setPartySize}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedHour={selectedHour}
              setSelectedHour={setSelectedHour}
              eligibleTables={eligibleTables}
              takenTableIds={takenTableIds}
              selectedTableId={selectedTableId}
              setSelectedTableId={setSelectedTableId}
              specialRequests={specialRequests}
              setSpecialRequests={setSpecialRequests}
              reservationName={reservationName}
              setReservationName={setReservationName}
              bookingError={bookingError}
              booking={booking}
              onBook={bookReservation}
            />
          )}

          {tab === 'manage' && isPrivileged && (
            <ReservationsManageSection
              colors={colors}
              loadingMeta={loadingMeta}
              managedLocations={managedLocations}
              selectedLocationId={selectedLocationId}
              setSelectedLocationId={setSelectedLocationId}
              manageError={manageError}
              loadingLocationReservations={loadingLocationReservations}
              locationReservations={locationReservations}
              managingReservationId={managingReservationId}
              onConfirmReservation={(reservation) => updateStatus(reservation, 'Confirmed')}
              onCompleteReservation={(reservation) => updateStatus(reservation, 'Completed')}
              onCancelReservation={doCancel}
            />
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
