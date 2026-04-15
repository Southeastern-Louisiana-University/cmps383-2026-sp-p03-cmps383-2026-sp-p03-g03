import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as WebBrowser from 'expo-web-browser';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedButton } from '@/components/animated-button';
import { PageHeaderActions } from '@/components/page-header-actions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { CommonStyles, getColors } from '@/constants/styles';
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

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const HOUR_SLOTS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

function formatHour(h: number) {
  if (h === 12) return '12:00 PM';
  return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
}

function formatReservationDate(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) +
    ' - ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  );
}

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}

function CalendarPicker({
  selected,
  onSelect,
  colors,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
  colors: ReturnType<typeof getColors>;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const firstDay = startOfMonth(viewYear, viewMonth).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <View style={calStyles.wrap}>
      <View style={calStyles.navRow}>
        <TouchableOpacity onPress={prevMonth} style={calStyles.navBtn}>
          <MaterialIcons name="chevron-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={[calStyles.monthLabel, { color: colors.text }]}>
          {MONTHS[viewMonth]} {viewYear}
        </ThemedText>
        <TouchableOpacity onPress={nextMonth} style={calStyles.navBtn}>
          <MaterialIcons name="chevron-right" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={calStyles.row}>
        {DAYS.map((d) => (
          <ThemedText key={d} style={[calStyles.dayHeader, { color: colors.textSecondary }]}>
            {d}
          </ThemedText>
        ))}
      </View>

      <View style={calStyles.grid}>
        {cells.map((day, i) => {
          if (!day) return <View key={`e-${i}`} style={calStyles.cell} />;

          const date = new Date(viewYear, viewMonth, day);
          const isPast = date < minDate;
          const isSelected =
            selected &&
            selected.getFullYear() === viewYear &&
            selected.getMonth() === viewMonth &&
            selected.getDate() === day;

          return (
            <TouchableOpacity
              key={day}
              style={[
                calStyles.cell,
                isSelected && { backgroundColor: colors.primary, borderRadius: 8 },
                isPast && { opacity: 0.3 },
              ]}
              onPress={() => !isPast && onSelect(date)}
              activeOpacity={isPast ? 1 : 0.7}
            >
              <ThemedText
                style={[
                  calStyles.dayText,
                  { color: isSelected ? '#fff' : colors.text },
                ]}
              >
                {day}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const calStyles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navBtn: { padding: 6 },
  monthLabel: { fontFamily: 'Corben_700Bold', fontSize: 15 },
  row: { flexDirection: 'row', marginBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  dayHeader: { width: `${100 / 7}%`, textAlign: 'center', fontFamily: 'Corben_700Bold', fontSize: 12 },
  dayText: { fontFamily: 'Corben_400Regular', fontSize: 14 },
});

type Tab = 'my' | 'book' | 'manage';

export default function ReservationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const { user } = useAuth();
  const isPrivileged = !!user?.roles?.some((role) => ['admin', 'manager', 'staff'].includes(role.toLowerCase()));
  const isStaffOrManager = !!user?.roles?.some((role) => ['manager', 'staff'].includes(role.toLowerCase()));

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
    return ['my', 'book', ...(isPrivileged ? ['manage'] : [])] as Tab[];
  }, [isStaffOrManager, isPrivileged]);

  useEffect(() => {
    if (!reservationTabs.includes(tab)) {
      setTab(reservationTabs[0]);
    }
  }, [reservationTabs, tab]);

  const loadReservations = useCallback(async (isRefresh = false) => {
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
  }, []);

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

    const reservedFor = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedHour,
      0,
      0,
    ).toISOString();

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
      void loadLocationReservations();
    }
  }, [tab, loadLocationReservations]);

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

  const handleManageStatus = async (reservation: ReservationDto, status: string) => {
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

  const handleBook = async () => {
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

    const reservedFor = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedHour,
      0,
      0,
    );

    if (reservedFor.getTime() - Date.now() < 2 * 60 * 60 * 1000) {
      setBookingError('Must be at least 2 hours from now.');
      return;
    }

    setBooking(true);

    try {
      await createReservation({
        locationId: selectedLocationId,
        tableId: selectedTableId,
        reservedFor: reservedFor.toISOString(),
        partySize,
        specialRequests: specialRequests.trim() || undefined,
      });

      setSelectedDate(null);
      setSelectedHour(null);
      setSelectedTableId(null);
      setSpecialRequests('');
      setPartySize(2);
      setTab('my');
      await loadReservations(true);

      Alert.alert('Reservation Confirmed', 'Your reservation has been created.');
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
                let urlToOpen = checkoutUrl;

                if (!urlToOpen && coverChargeOrderId) {
                  try {
                    urlToOpen = await createStripeCheckoutSession(coverChargeOrderId);
                  } catch {
                    urlToOpen = null;
                  }
                }

                if (urlToOpen) {
                  try {
                    await WebBrowser.openBrowserAsync(urlToOpen);
                    // Payment updates can be delayed briefly; retry sync/create a few times.
                    let created = false;
                    for (let attempt = 0; attempt < 3; attempt++) {
                      if (coverChargeOrderId) {
                        try { await syncStripePaymentStatus(coverChargeOrderId); } catch { /* best effort */ }
                      }

                      try {
                        await createReservation({
                          locationId: selectedLocationId!,
                          tableId: selectedTableId!,
                          reservedFor: reservedFor.toISOString(),
                          partySize,
                          coverChargeOrderId,
                          specialRequests: specialRequests.trim() || undefined,
                        });
                        created = true;
                        break;
                      } catch (createErr: any) {
                        if (!(createErr instanceof ApiError) || createErr.status !== 402) {
                          throw createErr;
                        }
                        if (attempt < 2) {
                          await new Promise((resolve) => setTimeout(resolve, 900));
                        }
                      }
                    }

                    setTab('my');
                    await loadReservations(true);

                    if (created) {
                      setSelectedDate(null);
                      setSelectedHour(null);
                      setSelectedTableId(null);
                      setSpecialRequests('');
                      setPartySize(2);
                      Alert.alert('Reservation Completed', 'Payment received. Your reservation is confirmed and now listed in My Reservations.');
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
        setBookingError(e.message || 'Could not complete booking.');
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
            loadingRes ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
            ) : resError ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>{resError}</ThemedText>
                <TouchableOpacity onPress={() => loadReservations()} style={[styles.retryBtn, { borderColor: colors.primary }]}>
                  <ThemedText style={[styles.retryText, { color: colors.primary }]}>Retry</ThemedText>
                </TouchableOpacity>
              </View>
            ) : myRes.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <MaterialIcons name="event-seat" size={40} color={colors.textSecondary} style={{ marginBottom: 10 }} />
                <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>No reservations yet</ThemedText>
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Book your first table below.
                </ThemedText>
                <TouchableOpacity style={[styles.bookBtn, { backgroundColor: colors.primary }]} onPress={() => setTab('book')}>
                  <ThemedText style={styles.bookBtnText}>Book a Table</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {cancelError ? (
                  <View style={[styles.inlineError, { backgroundColor: '#ef444418', borderColor: '#ef4444' }]}>
                    <MaterialIcons name="error-outline" size={16} color="#ef4444" />
                    <ThemedText style={styles.inlineErrorText}>{cancelError}</ThemedText>
                    <TouchableOpacity onPress={() => setCancelError(null)}>
                      <MaterialIcons name="close" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ) : null}

                {myRes.map((res) => {
                  const isPast = new Date(
                    res.reservedFor.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(res.reservedFor)
                      ? res.reservedFor
                      : res.reservedFor + 'Z',
                  ) < new Date();

                  const isCancelled = res.status?.toLowerCase() === 'cancelled';
                  const isCompleted = res.status?.toLowerCase() === 'completed' || res.status?.toLowerCase() === 'noshow';
                  const statusColorMap: Record<string, string> = {
                    confirmed: '#10b981',
                    pending: '#10b981',
                    cancelled: '#ef4444',
                    completed: '#6b7280',
                    noshow: '#6b7280',
                  };
                  const statusColor = isPast && !isCancelled
                    ? '#6b7280'
                    : statusColorMap[res.status?.toLowerCase() ?? ''] ?? '#6b7280';
                  const statusLabel = isCancelled ? 'Cancelled' : isPast ? 'Past'
                    : (res.status?.toLowerCase() === 'pending' ? 'Confirmed' : res.status ?? 'Confirmed');

                  return (
                    <View
                      key={res.id}
                      style={[styles.resCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                    >
                      <View style={styles.resHeader}>
                        <View style={styles.resHeaderInfo}>
                          <ThemedText style={[styles.resDate, { color: colors.text }]}>
                            {formatReservationDate(res.reservedFor)}
                          </ThemedText>
                          <ThemedText style={[styles.resMeta, { color: colors.textSecondary }]}>
                            Party of {res.partySize} - Table #{res.tableId}
                          </ThemedText>
                        </View>

                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
                          <ThemedText style={[styles.statusText, { color: statusColor }]}>
                            {statusLabel}
                          </ThemedText>
                        </View>
                      </View>

                      {res.specialRequests ? (
                        <ThemedText style={[styles.specialReq, { color: colors.textSecondary }]}>
                          &quot;{res.specialRequests}&quot;
                        </ThemedText>
                      ) : null}

                      {!isCancelled && !isPast && !isCompleted && (
                        confirmingId === res.id ? (
                          <View style={styles.confirmRow}>
                            <ThemedText style={[styles.confirmText, { color: colors.textSecondary }]}>Sure?</ThemedText>
                            <TouchableOpacity
                              style={[styles.confirmYes, { backgroundColor: '#ef4444' }]}
                              onPress={() => doCancel(res.id)}
                              activeOpacity={0.8}
                            >
                              {cancellingId === res.id
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <ThemedText style={styles.confirmYesText}>Yes, cancel</ThemedText>}
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.confirmNo, { borderColor: colors.border }]}
                              onPress={() => setConfirmingId(null)}
                              activeOpacity={0.8}
                            >
                              <ThemedText style={[styles.confirmNoText, { color: colors.text }]}>Keep it</ThemedText>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={[styles.cancelBtn, { borderColor: '#ef4444', opacity: cancellingId === res.id ? 0.6 : 1 }]}
                            onPress={() => setConfirmingId(res.id)}
                            activeOpacity={0.8}
                            disabled={cancellingId !== null}
                          >
                            <ThemedText style={styles.cancelBtnText}>Cancel Reservation</ThemedText>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  );
                })}
              </>
            )
          )}

          {tab === 'book' && (
            loadingMeta ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
            ) : (
              <>
                <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Location</ThemedText>
                  {locations.map((loc) => (
                    <TouchableOpacity
                      key={loc.id}
                      style={[
                        styles.locationOption,
                        {
                          borderColor: selectedLocationId === loc.id ? colors.primary : colors.border,
                          backgroundColor: selectedLocationId === loc.id ? colors.primary + '18' : 'transparent',
                        },
                      ]}
                      onPress={() => setSelectedLocationId(loc.id)}
                      activeOpacity={0.85}
                    >
                      <MaterialIcons
                        name={selectedLocationId === loc.id ? 'radio-button-checked' : 'radio-button-unchecked'}
                        size={18}
                        color={selectedLocationId === loc.id ? colors.primary : colors.textSecondary}
                      />
                      <View style={{ flex: 1 }}>
                        <ThemedText style={[styles.locationName, { color: colors.text }]}>{loc.name}</ThemedText>
                        <ThemedText style={[styles.locationAddr, { color: colors.textSecondary }]}>
                          {loc.address}, {loc.city}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Party Size</ThemedText>
                  <View style={styles.partySizeRow}>
                    {[2, 3, 4, 5, 6].map((n) => (
                      <TouchableOpacity
                        key={n}
                        style={[
                          styles.sizeBtn,
                          {
                            borderColor: partySize === n ? colors.primary : colors.border,
                            backgroundColor: partySize === n ? colors.primary : 'transparent',
                          },
                        ]}
                        onPress={() => setPartySize(n)}
                      >
                        <ThemedText style={[styles.sizeBtnText, { color: partySize === n ? '#fff' : colors.text }]}>
                          {n}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Date</ThemedText>
                  <CalendarPicker
                    selected={selectedDate}
                    onSelect={(d) => {
                      setSelectedDate(d);
                      setSelectedHour(null);
                    }}
                    colors={colors}
                  />
                </View>

                {selectedDate && (
                  <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Time (6 AM - 6 PM)</ThemedText>
                    <View style={styles.timeGrid}>
                      {HOUR_SLOTS.map((h) => {
                        const slotDate = new Date(
                          selectedDate.getFullYear(),
                          selectedDate.getMonth(),
                          selectedDate.getDate(),
                          h,
                        );
                        const tooSoon = slotDate.getTime() - Date.now() < 2 * 60 * 60 * 1000;
                        const isSelected = selectedHour === h;

                        return (
                          <TouchableOpacity
                            key={h}
                            style={[
                              styles.timeBtn,
                              {
                                borderColor: isSelected ? colors.primary : colors.border,
                                backgroundColor: isSelected ? colors.primary : 'transparent',
                                opacity: tooSoon ? 0.35 : 1,
                              },
                            ]}
                            onPress={() => !tooSoon && setSelectedHour(h)}
                            activeOpacity={tooSoon ? 1 : 0.8}
                          >
                            <ThemedText style={[styles.timeBtnText, { color: isSelected ? '#fff' : colors.text }]}>
                              {formatHour(h)}
                            </ThemedText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {selectedDate && selectedHour !== null && (
                  <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Table</ThemedText>
                    {eligibleTables.length === 0 ? (
                      <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                        No tables available for party of {partySize} at this location.
                      </ThemedText>
                    ) : eligibleTables.map((t) => {
                      const isTaken = takenTableIds.includes(t.id);

                      return (
                        <TouchableOpacity
                          key={t.id}
                          style={[
                            styles.tableOption,
                            {
                              borderColor: selectedTableId === t.id ? colors.primary : colors.border,
                              backgroundColor: selectedTableId === t.id ? colors.primary + '18' : 'transparent',
                              opacity: isTaken ? 0.45 : 1,
                            },
                          ]}
                          onPress={() => !isTaken && setSelectedTableId(t.id)}
                          activeOpacity={isTaken ? 1 : 0.85}
                        >
                          <MaterialIcons
                            name={selectedTableId === t.id ? 'radio-button-checked' : 'radio-button-unchecked'}
                            size={18}
                            color={selectedTableId === t.id ? colors.primary : colors.textSecondary}
                          />
                          <ThemedText style={[styles.tableText, { color: colors.text }]}>
                            Table {t.tableNumber} - {t.seats} seats{isTaken ? ' - Taken' : ''}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Special Requests</ThemedText>
                  <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Allergies, occasion, seating preference... (optional)"
                      placeholderTextColor={colors.textSecondary}
                      value={specialRequests}
                      onChangeText={setSpecialRequests}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                {bookingError ? (
                  <ThemedText style={styles.errorText}>{bookingError}</ThemedText>
                ) : null}

                <AnimatedButton
                  style={[styles.bookSubmitBtn, { backgroundColor: booking ? colors.border : colors.primary }]}
                  onPress={handleBook}
                >
                  {booking
                    ? <ActivityIndicator color="#fff" />
                    : <ThemedText style={styles.bookSubmitText}>Confirm Reservation</ThemedText>}
                </AnimatedButton>
              </>
            )
          )}

          {tab === 'manage' && isPrivileged && (
            loadingMeta ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
            ) : (
              <>
                <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Manage by Location</ThemedText>
                  {locations.map((loc) => (
                    <TouchableOpacity
                      key={loc.id}
                      style={[
                        styles.locationOption,
                        {
                          borderColor: selectedLocationId === loc.id ? colors.primary : colors.border,
                          backgroundColor: selectedLocationId === loc.id ? colors.primary + '18' : 'transparent',
                        },
                      ]}
                      onPress={() => setSelectedLocationId(loc.id)}
                      activeOpacity={0.85}
                    >
                      <MaterialIcons
                        name={selectedLocationId === loc.id ? 'radio-button-checked' : 'radio-button-unchecked'}
                        size={18}
                        color={selectedLocationId === loc.id ? colors.primary : colors.textSecondary}
                      />
                      <View style={{ flex: 1 }}>
                        <ThemedText style={[styles.locationName, { color: colors.text }]}>{loc.name}</ThemedText>
                        <ThemedText style={[styles.locationAddr, { color: colors.textSecondary }]}>
                          {loc.address}, {loc.city}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {manageError ? (
                  <ThemedText style={styles.errorText}>{manageError}</ThemedText>
                ) : null}

                {loadingLocationReservations ? (
                  <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 16 }} />
                ) : locationReservations.length === 0 ? (
                  <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>No reservations for this location</ThemedText>
                    <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>Everything is open right now.</ThemedText>
                  </View>
                ) : (
                  locationReservations.map((res) => (
                    <View key={res.id} style={[styles.resCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                      <View style={styles.resHeader}>
                        <View style={styles.resHeaderInfo}>
                          <ThemedText style={[styles.resDate, { color: colors.text }]}>{formatReservationDate(res.reservedFor)}</ThemedText>
                          <ThemedText style={[styles.resMeta, { color: colors.textSecondary }]}>Party of {res.partySize} - Table #{res.tableId}</ThemedText>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: '#3b82f622', borderColor: '#3b82f6' }]}>
                          <ThemedText style={[styles.statusText, { color: '#3b82f6' }]}>{res.status}</ThemedText>
                        </View>
                      </View>

                      {res.specialRequests ? (
                        <ThemedText style={[styles.specialReq, { color: colors.textSecondary }]}>{res.specialRequests}</ThemedText>
                      ) : null}

                      <View style={styles.manageRow}>
                        <TouchableOpacity
                          style={[styles.manageButton, { backgroundColor: colors.primary, opacity: managingReservationId === res.id ? 0.7 : 1 }]}
                          onPress={() => handleManageStatus(res, 'Completed')}
                          disabled={managingReservationId === res.id}
                        >
                          <ThemedText style={styles.manageButtonText}>Mark Completed</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.manageButton, styles.manageDangerButton, { opacity: managingReservationId === res.id ? 0.7 : 1 }]}
                          onPress={() => doCancel(res.id)}
                          disabled={managingReservationId === res.id}
                        >
                          <ThemedText style={styles.manageButtonText}>Cancel</ThemedText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </>
            )
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  titleLogo: { width: 36, height: 36 },

  tabRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 18,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabLabel: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
    letterSpacing: 0.2,
  },

  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyTitle: {
    fontFamily: 'Oregano_400Regular',
    fontSize: 26,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  retryBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { fontFamily: 'Corben_700Bold', fontSize: 14 },
  bookBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 32,
  },
  bookBtnText: {
    color: '#fff',
    fontFamily: 'Corben_700Bold',
    fontSize: 15,
    letterSpacing: 0.3,
  },

  resCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  resHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resHeaderInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  resDate: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
    marginBottom: 3,
    flexShrink: 1,
    paddingRight: 8,
  },
  resMeta: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
    opacity: 0.75,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  statusText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  specialReq: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 18,
    opacity: 0.8,
  },
  cancelBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelBtnText: {
    color: '#ef4444',
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  confirmText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
    marginRight: 2,
  },
  confirmYes: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  confirmYesText: {
    color: '#fff',
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
  },
  confirmNo: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  confirmNoText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
  },

  section: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontFamily: 'Corben_700Bold',
    fontSize: 15,
    marginBottom: 12,
    letterSpacing: 0.2,
  },

  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  locationName: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
  },
  locationAddr: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.75,
  },

  partySizeRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  sizeBtn: {
    width: 48,
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeBtnText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 16,
  },

  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 13,
  },
  timeBtnText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 12,
    letterSpacing: 0.1,
  },

  tableOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  tableText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
  },
  manageRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  manageButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  manageDangerButton: {
    backgroundColor: '#ef4444',
  },
  manageButtonText: {
    color: '#fff',
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
  },

  inputWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 88,
  },
  input: {
    fontFamily: 'Corben_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },

  errorText: {
    color: '#ef4444',
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 19,
  },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  inlineErrorText: {
    flex: 1,
    color: '#ef4444',
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  bookSubmitBtn: {
    borderRadius: 16,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  bookSubmitText: {
    color: '#fff',
    fontFamily: 'Corben_700Bold',
    fontSize: 18,
    letterSpacing: 0.4,
  },
});