import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, StyleSheet, ScrollView, Image, ActivityIndicator,
  TouchableOpacity, TextInput, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedButton } from '@/components/animated-button';
import { PageHeaderActions } from '@/components/page-header-actions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { CommonStyles, getColors } from '@/constants/styles';
import {
  getReservations, createReservation, cancelReservation,
  getLocations, getTables,
  type ReservationDto, type LocationDto, type TableDto,
} from '@/services/api';



const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const HOUR_SLOTS = [6,7,8,9,10,11,12,13,14,15,16,17,18]; // 6 AM – 6 PM

function formatHour(h: number) {
  if (h === 12) return '12:00 PM';
  return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
}

function formatReservationDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}



function CalendarPicker({
  selected, onSelect, colors,
}: { selected: Date | null; onSelect: (d: Date) => void; colors: ReturnType<typeof getColors> }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

 
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const firstDay = startOfMonth(viewYear, viewMonth).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  return (
    <View style={calStyles.wrap}>
      {/* Month nav */}
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

      {/* Day headers */}
      <View style={calStyles.row}>
        {DAYS.map(d => (
          <ThemedText key={d} style={[calStyles.dayHeader, { color: colors.textSecondary }]}>{d}</ThemedText>
        ))}
      </View>

      {/* Date grid */}
      <View style={calStyles.grid}>
        {cells.map((day, i) => {
          if (!day) return <View key={`e-${i}`} style={calStyles.cell} />;
          const date = new Date(viewYear, viewMonth, day);
          const isPast = date < minDate;
          const isSelected = selected &&
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
              <ThemedText style={[
                calStyles.dayText,
                { color: isSelected ? '#fff' : colors.text },
              ]}>{day}</ThemedText>
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



type Tab = 'my' | 'book';

export default function ReservationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const { user } = useAuth();

  const [tab, setTab] = useState<Tab>('my');


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

  const loadReservations = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoadingRes(true);
    setResError(null);
    try {
      const all = await getReservations();
      
      const mine = user ? all.filter(r => r.userId === user.id) : all;
      setMyRes(mine.sort((a, b) => new Date(b.reservedFor).getTime() - new Date(a.reservedFor).getTime()));
    } catch (e: any) {
      setResError(e.message || 'Failed to load reservations.');
    } finally {
      setLoadingRes(false);
      setRefreshing(false);
    }
  }, [user]);


  useEffect(() => {
    Promise.all([getLocations(), getTables()])
      .then(([locs, tbls]) => {
        const active = locs.filter(l => l.isActive);
        setLocations(active);
        if (active.length) setSelectedLocationId(active[0].id);
        setTables(tbls);
      })
      .catch(() => {})
      .finally(() => setLoadingMeta(false));
  }, []);

  useEffect(() => { loadReservations(); }, [loadReservations]);


  const eligibleTables = useMemo(() =>
    tables.filter(t =>
      t.locationId === selectedLocationId &&
      t.isActive &&
      !t.isBarSeat &&
      t.seats >= partySize
    ),
    [tables, selectedLocationId, partySize]
  );


  useEffect(() => { setSelectedTableId(null); }, [selectedLocationId, partySize]);


  const doCancel = (id: number) => {
    setCancelError(null);
    setConfirmingId(null);
    setCancellingId(id);
    cancelReservation(id)
      .then(() => loadReservations(true))
      .catch((e: any) => {
        const msg: string = e?.message || 'Could not cancel reservation.';
        const clean = msg.replace(/^API Error: \d+ - "?|"?$/g, '').trim();
        setCancelError(clean || msg);
      })
      .finally(() => setCancellingId(null));
  };

  const handleBook = async () => {
    setBookingError(null);
    if (!selectedLocationId) { setBookingError('Select a location.'); return; }
    if (!selectedDate) { setBookingError('Pick a date.'); return; }
    if (selectedHour === null) { setBookingError('Pick a time slot.'); return; }
    if (!selectedTableId) { setBookingError('Select a table.'); return; }
    if (!user) { setBookingError('You must be logged in.'); return; }

    const reservedFor = new Date(
      selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(),
      selectedHour, 0, 0
    );

    
    if (reservedFor.getTime() - Date.now() < 2 * 60 * 60 * 1000) {
      setBookingError('Must be at least 2 hours from now.');
      return;
    }

    setBooking(true);
    try {
      await createReservation({
        locationId: selectedLocationId,
        userId: user.id,
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
      loadReservations(true);
      setBookingError(null);
    } catch (e: any) {
      setBookingError(e.message || 'Could not complete booking.');
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
            ? <RefreshControl refreshing={refreshing} onRefresh={() => loadReservations(true)} tintColor={colors.primary} />
            : undefined
        }
      >
        <ThemedView style={CommonStyles.container}>
          <PageHeaderActions />

          <View style={styles.titleRow}>
            <Image source={require('@/assets/images/ConceptLogo2-FpjOWRtT.png')} style={styles.titleLogo} resizeMode="contain" />
            <ThemedText style={CommonStyles.title}>Reservations</ThemedText>
          </View>

          {/* Tab toggle */}
          <View style={[styles.tabRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            {(['my', 'book'] as Tab[]).map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.tabBtn, tab === t && { backgroundColor: colors.primary }]}
                onPress={() => setTab(t)}
                activeOpacity={0.85}
              >
                <ThemedText style={[styles.tabLabel, { color: tab === t ? '#fff' : colors.textSecondary }]}>
                  {t === 'my' ? 'My Reservations' : 'Book a Table'}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── MY RESERVATIONS ── */}
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
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>Book your first table below.</ThemedText>
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
                {myRes.map(res => {
                const isPast = new Date(
                  res.reservedFor.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(res.reservedFor)
                    ? res.reservedFor : res.reservedFor + 'Z'
                ) < new Date();
                const isCancelled = res.status?.toLowerCase() === 'cancelled';
                const statusColor = isCancelled ? '#ef4444' : isPast ? '#6b7280' : '#10b981';
                return (
                  <View key={res.id} style={[styles.resCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <View style={styles.resHeader}>
                      <View>
                        <ThemedText style={[styles.resDate, { color: colors.text }]}>{formatReservationDate(res.reservedFor)}</ThemedText>
                        <ThemedText style={[styles.resMeta, { color: colors.textSecondary }]}>Party of {res.partySize} · Table #{res.tableId}</ThemedText>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
                        <ThemedText style={[styles.statusText, { color: statusColor }]}>
                          {isCancelled ? 'Cancelled' : isPast ? 'Past' : res.status}
                        </ThemedText>
                      </View>
                    </View>
                    {res.specialRequests ? (
                      <ThemedText style={[styles.specialReq, { color: colors.textSecondary }]}>"{res.specialRequests}"</ThemedText>
                    ) : null}
                    {!isCancelled && !isPast && (
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
                              : <ThemedText style={styles.confirmYesText}>Yes, cancel</ThemedText>
                            }
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

          {/* ── BOOK A TABLE ── */}
          {tab === 'book' && (
            loadingMeta ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
            ) : (
              <>
                {/* Location */}
                <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Location</ThemedText>
                  {locations.map(loc => (
                    <TouchableOpacity
                      key={loc.id}
                      style={[styles.locationOption, {
                        borderColor: selectedLocationId === loc.id ? colors.primary : colors.border,
                        backgroundColor: selectedLocationId === loc.id ? colors.primary + '18' : 'transparent',
                      }]}
                      onPress={() => setSelectedLocationId(loc.id)}
                      activeOpacity={0.85}
                    >
                      <MaterialIcons name={selectedLocationId === loc.id ? 'radio-button-checked' : 'radio-button-unchecked'} size={18} color={selectedLocationId === loc.id ? colors.primary : colors.textSecondary} />
                      <View style={{ flex: 1 }}>
                        <ThemedText style={[styles.locationName, { color: colors.text }]}>{loc.name}</ThemedText>
                        <ThemedText style={[styles.locationAddr, { color: colors.textSecondary }]}>{loc.address}, {loc.city}</ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Party size */}
                <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Party Size</ThemedText>
                  <View style={styles.partySizeRow}>
                    {[2,3,4,5,6].map(n => (
                      <TouchableOpacity
                        key={n}
                        style={[styles.sizeBtn, { borderColor: partySize === n ? colors.primary : colors.border, backgroundColor: partySize === n ? colors.primary : 'transparent' }]}
                        onPress={() => setPartySize(n)}
                      >
                        <ThemedText style={[styles.sizeBtnText, { color: partySize === n ? '#fff' : colors.text }]}>{n}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Calendar */}
                <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Date</ThemedText>
                  <CalendarPicker selected={selectedDate} onSelect={d => { setSelectedDate(d); setSelectedHour(null); }} colors={colors} />
                </View>

                {/* Time slots — only show after date picked */}
                {selectedDate && (
                  <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Time (6 AM – 6 PM)</ThemedText>
                    <View style={styles.timeGrid}>
                      {HOUR_SLOTS.map(h => {
                        const slotDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), h);
                        const too_soon = slotDate.getTime() - Date.now() < 2 * 60 * 60 * 1000;
                        const isSelected = selectedHour === h;
                        return (
                          <TouchableOpacity
                            key={h}
                            style={[styles.timeBtn, {
                              borderColor: isSelected ? colors.primary : colors.border,
                              backgroundColor: isSelected ? colors.primary : 'transparent',
                              opacity: too_soon ? 0.35 : 1,
                            }]}
                            onPress={() => !too_soon && setSelectedHour(h)}
                            activeOpacity={too_soon ? 1 : 0.8}
                          >
                            <ThemedText style={[styles.timeBtnText, { color: isSelected ? '#fff' : colors.text }]}>{formatHour(h)}</ThemedText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Table selection — only show after date + time picked */}
                {selectedDate && selectedHour !== null && (
                  <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Table</ThemedText>
                    {eligibleTables.length === 0 ? (
                      <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                        No tables available for party of {partySize} at this location.
                      </ThemedText>
                    ) : eligibleTables.map(t => (
                      <TouchableOpacity
                        key={t.id}
                        style={[styles.tableOption, {
                          borderColor: selectedTableId === t.id ? colors.primary : colors.border,
                          backgroundColor: selectedTableId === t.id ? colors.primary + '18' : 'transparent',
                        }]}
                        onPress={() => setSelectedTableId(t.id)}
                        activeOpacity={0.85}
                      >
                        <MaterialIcons name={selectedTableId === t.id ? 'radio-button-checked' : 'radio-button-unchecked'} size={18} color={selectedTableId === t.id ? colors.primary : colors.textSecondary} />
                        <ThemedText style={[styles.tableText, { color: colors.text }]}>
                          Table {t.tableNumber} · {t.seats} seats
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Special requests */}
                <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Special Requests</ThemedText>
                  <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Allergies, occasion, seating preference… (optional)"
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
                    : <ThemedText style={styles.bookSubmitText}>Confirm Reservation</ThemedText>
                  }
                </AnimatedButton>
              </>
            )
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Header
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  titleLogo: { width: 36, height: 36 },

  // Tab toggle
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

  // Empty / error states
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

  // Reservation cards
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
    alignItems: 'flex-start',
    marginBottom: 8,
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

  // Booking sections
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

  // Location picker
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

  // Party size
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

  // Time slots
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

  // Table picker
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

  // Special requests
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

  // Error + submit
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
