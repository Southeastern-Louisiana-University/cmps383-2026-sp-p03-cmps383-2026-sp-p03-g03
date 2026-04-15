import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedButton } from '@/components/animated-button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { CommonStyles, getColors } from '@/constants/styles';
import {
  ApiError,
  getLocations,
  getMenuItems,
  getPaymentMethods,
  getReservationAvailability,
  getTables,
  createOrder,
  createReservation,
  createStripeCheckoutSession,
  syncStripePaymentStatus,
  payOrderWithSavedMethod,
  type LocationDto,
  type PaymentMethodDto,
  type ReservationCoverChargeRequiredDto,
  type TableDto,
} from '@/services/api';
import * as WebBrowser from 'expo-web-browser';

type OrderType = 'Pickup' | 'DineIn' | 'DriveThru';
type PaymentChoice = 'stripe' | 'saved';

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

  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
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
    <View style={styles.calendarWrap}>
      <View style={styles.calendarNavRow}>
        <TouchableOpacity onPress={prevMonth} style={styles.calendarNavBtn}>
          <MaterialIcons name="chevron-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.calendarMonthLabel, { color: colors.text }]}>
          {MONTHS[viewMonth]} {viewYear}
        </ThemedText>
        <TouchableOpacity onPress={nextMonth} style={styles.calendarNavBtn}>
          <MaterialIcons name="chevron-right" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarHeaderRow}>
        {DAYS.map((d) => (
          <ThemedText key={d} style={[styles.calendarDayHeader, { color: colors.textSecondary }]}>
            {d}
          </ThemedText>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {cells.map((day, i) => {
          if (!day) {
            return <View key={`e-${i}`} style={styles.calendarCell} />;
          }

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
                styles.calendarCell,
                isSelected && { backgroundColor: colors.primary, borderRadius: 8 },
                isPast && { opacity: 0.3 },
              ]}
              onPress={() => !isPast && onSelect(date)}
              activeOpacity={isPast ? 1 : 0.7}
            >
              <ThemedText style={[styles.calendarDayText, { color: isSelected ? '#fff' : colors.text }]}>
                {day}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function CheckoutScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDto[]>([]);
  const [tables, setTables] = useState<TableDto[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedPaymentChoice, setSelectedPaymentChoice] = useState<PaymentChoice>('stripe');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('Pickup');
  const [pickupName, setPickupName] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [bookReservation, setBookReservation] = useState(false);
  const [partySize, setPartySize] = useState(2);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [takenTableIds, setTakenTableIds] = useState<number[]>([]);
  const [reservationRequests, setReservationRequests] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [placing, setPlacing] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.0875;
  const total = subtotal + tax;

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

  const selectedTable = tables.find((t) => t.id === selectedTableId) ?? null;

  const reservationSummary =
    orderType === 'DineIn' && bookReservation && selectedDate && selectedHour !== null
      ? `Reservation: ${selectedDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })} at ${formatHour(selectedHour)}${selectedTable ? ` - Table ${selectedTable.tableNumber}` : ''} - Party ${partySize}`
      : '';

  useEffect(() => {
    getLocations()
      .then((data) => {
        const active = data.filter((l) => l.isActive);
        setLocations(active);
        if (active.length > 0) {
          setSelectedLocationId(active[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingLocations(false));

    getPaymentMethods()
      .then((data) => {
        setPaymentMethods(data);
        const defaultMethod = data.find((method) => method.isDefault) ?? data[0];
        if (defaultMethod) {
          setSelectedPaymentMethodId(defaultMethod.id);
        }
      })
      .catch(() => {
        setPaymentMethods([]);
      })
      .finally(() => setLoadingPaymentMethods(false));

    getTables()
      .then((data) => {
        setTables(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setTables([]);
      });
  }, []);

  useEffect(() => {
    if (user?.displayName) {
      setPickupName(user.displayName);
    } else if (user?.userName) {
      setPickupName(user.userName);
    }
  }, [user]);

  useEffect(() => {
    setSelectedTableId(null);
  }, [selectedLocationId, partySize, selectedDate, selectedHour, bookReservation]);

  useEffect(() => {
    if (!bookReservation || orderType !== 'DineIn' || !selectedLocationId || !selectedDate || selectedHour === null) {
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
  }, [bookReservation, orderType, selectedLocationId, selectedDate, selectedHour]);

  useEffect(() => {
    if (selectedTableId && takenTableIds.includes(selectedTableId)) {
      setSelectedTableId(null);
    }
  }, [selectedTableId, takenTableIds]);

  const tryCreateReservationForOrder = async () => {
    if (!bookReservation || orderType !== 'DineIn') {
      return { success: false, message: '' };
    }

    if (!selectedLocationId || !selectedDate || selectedHour === null || !selectedTableId) {
      return { success: false, message: 'Reservation details were incomplete.' };
    }

    const reservedFor = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedHour,
      0,
      0,
    );

    try {
      await createReservation({
        locationId: selectedLocationId,
        tableId: selectedTableId,
        reservedFor: reservedFor.toISOString(),
        partySize,
        specialRequests: reservationRequests.trim() || undefined,
      });

      return { success: true, message: 'Your table reservation is confirmed.' };
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 402) {
        const paymentInfo = e.data as ReservationCoverChargeRequiredDto | undefined;
        const amount = paymentInfo?.coverChargeAmount;
        const coverChargeOrderId = paymentInfo?.coverChargeOrderId;
        const checkoutUrl = paymentInfo?.checkoutUrl;

        Alert.alert(
          'Reservation Cover Charge',
          amount
            ? `Your order is placed. A $${amount.toFixed(2)} cover charge is still required to confirm this table if your paid order does not qualify yet.`
            : 'Your order is placed, but a cover charge may still be required to confirm the table.',
          [
            { text: 'Later', style: 'cancel' },
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

                if (!urlToOpen) {
                  Alert.alert('Payment Required', 'Checkout could not be opened automatically.');
                  return;
                }

                try {
                  await WebBrowser.openBrowserAsync(urlToOpen);
                  if (coverChargeOrderId) {
                    try {
                      await syncStripePaymentStatus(coverChargeOrderId);
                    } catch {
                      // best effort
                    }
                  }

                  let created = false;
                  for (let attempt = 0; attempt < 3; attempt++) {
                    try {
                      await createReservation({
                        locationId: selectedLocationId,
                        tableId: selectedTableId,
                        reservedFor: reservedFor.toISOString(),
                        partySize,
                        coverChargeOrderId,
                        specialRequests: reservationRequests.trim() || undefined,
                      });
                      created = true;
                      break;
                    } catch (createErr: any) {
                      if (!(createErr instanceof ApiError) || createErr.status !== 402) {
                        throw createErr;
                      }
                    }
                  }

                  Alert.alert(
                    created ? 'Reservation Confirmed' : 'Payment Received',
                    created
                      ? 'Your table reservation is now confirmed.'
                      : 'Cover charge payment was received. If the reservation does not appear yet, refresh and try once more.',
                  );
                } catch (err: any) {
                  Alert.alert('Checkout Error', err?.message || 'Could not open the cover charge checkout.');
                }
              },
            },
          ],
        );

        return { success: false, message: 'Reservation needs a cover-charge confirmation.' };
      }

      return { success: false, message: e.message || 'Could not complete the reservation add-on.' };
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Add items to your cart before checking out.');
      return;
    }

    if (!selectedLocationId) {
      Alert.alert('No Location', 'Please select a location for your order.');
      return;
    }

    if ((orderType === 'Pickup' || orderType === 'DriveThru') && !pickupName.trim()) {
      Alert.alert('Name Required', 'Enter a name for your order.');
      return;
    }

    if (orderType === 'DineIn' && bookReservation) {
      if (!selectedDate) {
        Alert.alert('Reservation Date Needed', 'Pick a reservation date for your dine-in order.');
        return;
      }

      if (selectedHour === null) {
        Alert.alert('Reservation Time Needed', 'Pick a reservation time for your dine-in order.');
        return;
      }

      if (!selectedTableId) {
        Alert.alert('Table Needed', 'Select a table for the reservation add-on.');
        return;
      }

      if (takenTableIds.includes(selectedTableId)) {
        Alert.alert('Table Unavailable', 'That table has already been taken for the selected time. Please choose another table.');
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
        Alert.alert('Reservation Too Soon', 'Reservations must be made at least 2 hours in advance.');
        return;
      }
    }

    setPlacing(true);
    try {
      const liveMenu = await getMenuItems();
      const unavailableIds = new Set(liveMenu.filter((item) => !item.isAvailable).map((item) => item.id));

      const staleUnavailable = cart.filter((item) => unavailableIds.has(item.id));
      if (staleUnavailable.length > 0) {
        staleUnavailable.forEach((item) => removeItem(item.id));
        Alert.alert(
          'Items Updated',
          'One or more items in your cart are no longer available and were removed. Please review your cart and try again.',
        );
        return;
      }

      const combinedOrderNote = [orderNote.trim(), reservationSummary]
        .filter((value) => value && value.length > 0)
        .join(' | ');

      const order = await createOrder({
        locationId: selectedLocationId,
        orderType,
        pickupName: orderType === 'DineIn' ? undefined : pickupName.trim(),
        note: combinedOrderNote || undefined,
        items: cart.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          itemNote: item.customizationNotes || undefined,
        })),
      });

      if (selectedPaymentChoice === 'saved' && selectedPaymentMethodId) {
        try {
          const savedResult = await payOrderWithSavedMethod(order.id, selectedPaymentMethodId);
          if (savedResult.succeeded) {
            const reservationResult = await tryCreateReservationForOrder();
            clearCart();
            router.replace('/(tabs)/orders');
            setTimeout(() => {
              Alert.alert(
                'Payment Successful',
                reservationResult.message
                  ? `Your order #${order.orderCode} was paid using your saved card. ${reservationResult.message}`
                  : `Your order #${order.orderCode} was paid using your saved card.`
              );
            }, 300);
            return;
          }
        } catch {
          // fall through to Stripe checkout if saved card payment fails
        }
      }

      try {
        const stripeUrl = await createStripeCheckoutSession(order.id);
        await WebBrowser.openBrowserAsync(stripeUrl);

        let paymentCompleted = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const syncResult = await syncStripePaymentStatus(order.id);
            if (syncResult.paymentStatus === 'Paid') {
              paymentCompleted = true;
              break;
            }
          } catch {
            // best effort
          }
        }

        const reservationResult = paymentCompleted ? await tryCreateReservationForOrder() : { success: false, message: '' };
        clearCart();
        router.replace('/(tabs)/orders');

        setTimeout(() => {
          if (!paymentCompleted) {
            Alert.alert('Payment Pending', `Your order #${order.orderCode} was created, but payment was not completed in Stripe yet.`);
          } else if (reservationResult.success) {
            Alert.alert('Order & Reservation Confirmed', `Your order #${order.orderCode} is paid. ${reservationResult.message}`);
          } else {
            Alert.alert(
              'Order Paid',
              reservationResult.message
                ? `Your order #${order.orderCode} was paid successfully. ${reservationResult.message}`
                : `Your order #${order.orderCode} was paid successfully.`
            );
          }
        }, 300);
      } catch {
        const reservationResult = await tryCreateReservationForOrder();
        clearCart();
        router.replace('/(tabs)/orders');
        setTimeout(() => {
          Alert.alert(
            'Order Placed!',
            reservationResult.message
              ? `Your order #${order.orderCode} is confirmed. ${reservationResult.message}`
              : `Your order #${order.orderCode} is confirmed. Payment can be completed at the counter.`
          );
        }, 300);
      }
    } catch (err: any) {
      Alert.alert('Order Failed', err.message || 'Could not place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={CommonStyles.scrollContent}>
        <ThemedView style={CommonStyles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <MaterialIcons name="arrow-back" size={16} color={colors.text} />
              <ThemedText style={styles.backText}>Back</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.titleRow}>
            <Image
              source={require('@/assets/images/ConceptLogo2-FpjOWRtT.png')}
              style={styles.titleLogo}
              resizeMode="contain"
            />
            <ThemedText style={CommonStyles.title}>Checkout</ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Your Order</ThemedText>

            {cart.length === 0 ? (
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>Your cart is empty.</ThemedText>
            ) : (
              cart.map((item) => (
                <View key={item.id} style={[styles.cartRow, { borderTopColor: colors.border }]}>
                  <View style={styles.cartItemInfo}>
                    <ThemedText style={[styles.cartItemName, { color: colors.text }]}>{item.name}</ThemedText>
                    {item.customizationNotes ? (
                      <ThemedText style={[styles.cartItemNote, { color: colors.textSecondary }]}>
                        {item.customizationNotes}
                      </ThemedText>
                    ) : null}
                  </View>

                  <View style={styles.cartItemControls}>
                    <TouchableOpacity
                      style={[styles.qtyButton, { borderColor: colors.border }]}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <MaterialIcons name="remove" size={14} color={colors.text} />
                    </TouchableOpacity>
                    <ThemedText style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</ThemedText>
                    <TouchableOpacity
                      style={[styles.qtyButton, { borderColor: colors.border }]}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <MaterialIcons name="add" size={14} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  <ThemedText style={[styles.cartItemPrice, { color: colors.primary }]}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </ThemedText>

                  <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeButton}>
                    <MaterialIcons name="close" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))
            )}

            {cart.length > 0 ? (
              <View style={[styles.totalsBlock, { borderTopColor: colors.border }]}>
                <View style={styles.totalRow}>
                  <ThemedText style={[styles.totalLabel, { color: colors.textSecondary }]}>Subtotal</ThemedText>
                  <ThemedText style={[styles.totalValue, { color: colors.text }]}>${subtotal.toFixed(2)}</ThemedText>
                </View>
                <View style={styles.totalRow}>
                  <ThemedText style={[styles.totalLabel, { color: colors.textSecondary }]}>Tax (8.75%)</ThemedText>
                  <ThemedText style={[styles.totalValue, { color: colors.text }]}>${tax.toFixed(2)}</ThemedText>
                </View>
                <View style={styles.totalRow}>
                  <ThemedText style={[styles.totalLabelBold, { color: colors.text }]}>Total</ThemedText>
                  <ThemedText style={[styles.totalValueBold, { color: colors.primary }]}>${total.toFixed(2)}</ThemedText>
                </View>
              </View>
            ) : null}
          </View>

          <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Order Type</ThemedText>
            <View style={styles.typeRow}>
              {(['Pickup', 'DineIn', 'DriveThru'] as OrderType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: orderType === type ? colors.primary : colors.background,
                      borderColor: orderType === type ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setOrderType(type)}
                  activeOpacity={0.85}
                >
                  <MaterialIcons
                    name={type === 'Pickup' ? 'shopping-bag' : type === 'DriveThru' ? 'directions-car' : 'restaurant'}
                    size={18}
                    color={orderType === type ? '#fff' : colors.text}
                  />
                  <ThemedText style={[styles.typeLabel, { color: orderType === type ? '#fff' : colors.text }]}>
                    {type === 'DineIn' ? 'Dine In' : type === 'DriveThru' ? 'Drive Thru' : 'Pickup'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Location</ThemedText>
            {loadingLocations ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              locations.map((loc) => (
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
                  <View style={styles.locationText}>
                    <ThemedText style={[styles.locationName, { color: colors.text }]}>{loc.name}</ThemedText>
                    <ThemedText style={[styles.locationAddr, { color: colors.textSecondary }]}> 
                      {loc.address}, {loc.city}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {orderType === 'DineIn' ? (
            <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={styles.reservationHeaderRow}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.text, marginBottom: 4 }]}>Add Reservation & Time</ThemedText>
                  <ThemedText style={[styles.reservationHint, { color: colors.textSecondary }]}>Book a table together with this dine-in order.</ThemedText>
                </View>
                <TouchableOpacity
                  style={[
                    styles.inlineToggle,
                    {
                      borderColor: bookReservation ? colors.primary : colors.border,
                      backgroundColor: bookReservation ? colors.primary + '18' : 'transparent',
                    },
                  ]}
                  onPress={() => setBookReservation((prev) => !prev)}
                  activeOpacity={0.85}
                >
                  <MaterialIcons
                    name={bookReservation ? 'check-circle' : 'radio-button-unchecked'}
                    size={18}
                    color={bookReservation ? colors.primary : colors.textSecondary}
                  />
                  <ThemedText style={[styles.inlineToggleText, { color: colors.text }]}>
                    {bookReservation ? 'Added' : 'Add'}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {bookReservation ? (
                <>
                  <ThemedText style={[styles.miniLabel, { color: colors.text }]}>Party Size</ThemedText>
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

                  <ThemedText style={[styles.miniLabel, { color: colors.text }]}>Date</ThemedText>
                  <CalendarPicker
                    selected={selectedDate}
                    onSelect={(d) => {
                      setSelectedDate(d);
                      setSelectedHour(null);
                    }}
                    colors={colors}
                  />

                  {selectedDate ? (
                    <>
                      <ThemedText style={[styles.miniLabel, { color: colors.text }]}>Time</ThemedText>
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
                    </>
                  ) : null}

                  {selectedDate && selectedHour !== null ? (
                    <>
                      <ThemedText style={[styles.miniLabel, { color: colors.text }]}>Table</ThemedText>
                      {eligibleTables.length === 0 ? (
                        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>No tables match this party size at the selected location.</ThemedText>
                      ) : (
                        eligibleTables.map((t) => {
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
                              <ThemedText style={[styles.tableText, { color: colors.text }]}>Table {t.tableNumber} · {t.seats} seats{isTaken ? ' - Taken' : ''}</ThemedText>
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </>
                  ) : null}

                  {reservationSummary ? (
                    <View style={[styles.reservationPreviewBox, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
                      <ThemedText style={[styles.reservationPreviewText, { color: colors.text }]}>{reservationSummary}</ThemedText>
                    </View>
                  ) : null}

                  <ThemedText style={[styles.miniLabel, { color: colors.text }]}>Special Requests</ThemedText>
                  <View style={[styles.inputWrap, styles.inputMultiline, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Birthday, booth preference, allergies..."
                      placeholderTextColor={colors.textSecondary}
                      value={reservationRequests}
                      onChangeText={setReservationRequests}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </>
              ) : null}
            </View>
          ) : null}

          {(orderType === 'Pickup' || orderType === 'DriveThru') ? (
            <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                {orderType === 'DriveThru' ? 'Driver Name' : 'Pickup Name'}
              </ThemedText>
              <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={orderType === 'DriveThru' ? 'Name for the drive-thru order' : 'Name for your order'}
                  placeholderTextColor={colors.textSecondary}
                  value={pickupName}
                  onChangeText={setPickupName}
                />
              </View>
            </View>
          ) : null}

          <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Special Instructions</ThemedText>
            <View style={[styles.inputWrap, styles.inputMultiline, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Any notes for the kitchen? (optional)"
                placeholderTextColor={colors.textSecondary}
                value={orderNote}
                onChangeText={setOrderNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</ThemedText>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                {
                  borderColor: selectedPaymentChoice === 'stripe' ? colors.primary : colors.border,
                  backgroundColor: selectedPaymentChoice === 'stripe' ? colors.primary + '18' : 'transparent',
                },
              ]}
              onPress={() => setSelectedPaymentChoice('stripe')}
              activeOpacity={0.85}
            >
              <MaterialIcons
                name={selectedPaymentChoice === 'stripe' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={18}
                color={selectedPaymentChoice === 'stripe' ? colors.primary : colors.textSecondary}
              />
              <View style={styles.paymentText}>
                <ThemedText style={[styles.paymentName, { color: colors.text }]}>Stripe Checkout</ThemedText>
              </View>
            </TouchableOpacity>

            {loadingPaymentMethods ? (
              <ActivityIndicator color={colors.primary} style={styles.paymentLoading} />
            ) : paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentOption,
                    {
                      borderColor:
                        selectedPaymentChoice === 'saved' && selectedPaymentMethodId === method.id
                          ? colors.primary
                          : colors.border,
                      backgroundColor:
                        selectedPaymentChoice === 'saved' && selectedPaymentMethodId === method.id
                          ? colors.primary + '18'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setSelectedPaymentChoice('saved');
                    setSelectedPaymentMethodId(method.id);
                  }}
                  activeOpacity={0.85}
                >
                  <MaterialIcons
                    name={selectedPaymentChoice === 'saved' && selectedPaymentMethodId === method.id ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={18}
                    color={selectedPaymentChoice === 'saved' && selectedPaymentMethodId === method.id ? colors.primary : colors.textSecondary}
                  />
                  <View style={styles.paymentText}>
                    <ThemedText style={[styles.paymentName, { color: colors.text }]}>
                      {method.brand} **** {method.last4}
                    </ThemedText>
                    <ThemedText style={[styles.paymentHint, { color: colors.textSecondary }]}>
                      {method.isDefault ? 'Default saved card' : `Expires ${method.expMonth}/${method.expYear}`}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <ThemedText style={[styles.noPaymentMethodsText, { color: colors.textSecondary }]}>No saved cards yet. Add one from Account.</ThemedText>
            )}
          </View>

          <AnimatedButton
            style={[styles.placeButton, { backgroundColor: placing || cart.length === 0 ? colors.border : colors.primary }]}
            onPress={handlePlaceOrder}
          >
            {placing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.placeButtonText}>
                {selectedPaymentChoice === 'saved' ? 'Pay with Saved Card' : 'Continue to Stripe'} · ${total.toFixed(2)}
              </ThemedText>
            )}
          </AnimatedButton>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  backText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  titleLogo: {
    width: 34,
    height: 34,
  },
  section: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Corben_700Bold',
    fontSize: 15,
    marginBottom: 10,
  },
  emptyText: {
    fontFamily: 'Corben_400Regular',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 10,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 6,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
  },
  cartItemNote: {
    fontFamily: 'Corben_400Regular',
    fontSize: 11,
    marginTop: 2,
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qtyButton: {
    width: 26,
    height: 26,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
    minWidth: 22,
    textAlign: 'center',
  },
  cartItemPrice: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
    minWidth: 52,
    textAlign: 'right',
  },
  removeButton: {
    padding: 4,
  },
  totalsBlock: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    fontFamily: 'Corben_400Regular',
    fontSize: 14,
  },
  totalValue: {
    fontFamily: 'Corben_400Regular',
    fontSize: 14,
  },
  totalLabelBold: {
    fontFamily: 'Corben_700Bold',
    fontSize: 16,
    marginTop: 4,
  },
  totalValueBold: {
    fontFamily: 'Corben_700Bold',
    fontSize: 18,
    marginTop: 4,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 72,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  typeLabel: {
    fontFamily: 'Corben_700Bold',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  reservationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  reservationHint: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  inlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inlineToggleText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 12,
  },
  miniLabel: {
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 8,
  },
  partySizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  sizeBtn: {
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sizeBtnText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
  },
  calendarWrap: {
    marginBottom: 8,
  },
  calendarNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calendarNavBtn: {
    padding: 6,
  },
  calendarMonthLabel: {
    fontFamily: 'Corben_700Bold',
    fontSize: 15,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayHeader: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontFamily: 'Corben_700Bold',
    fontSize: 11,
  },
  calendarDayText: {
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  timeBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  timeBtnText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 12,
  },
  tableOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  tableText: {
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
    flex: 1,
  },
  reservationPreviewBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  reservationPreviewText: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  locationText: {
    flex: 1,
  },
  locationName: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
  },
  locationAddr: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
  },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputMultiline: {
    minHeight: 84,
  },
  input: {
    fontFamily: 'Corben_400Regular',
    fontSize: 14,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  paymentText: {
    flex: 1,
  },
  paymentName: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
  },
  paymentHint: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
  },
  paymentLoading: {
    marginTop: 6,
  },
  noPaymentMethodsText: {
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  placeButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  placeButtonText: {
    color: '#fff',
    fontFamily: 'Corben_700Bold',
    fontSize: 15,
  },
});
