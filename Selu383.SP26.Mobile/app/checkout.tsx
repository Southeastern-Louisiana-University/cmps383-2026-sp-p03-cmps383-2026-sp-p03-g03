import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
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
import { styles } from '@/styles/screens/checkout.styles';
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
import * as Linking from 'expo-linking';
import { CalendarPicker } from '@/components/calendar-picker';
import { HOUR_SLOTS, formatHour } from '@/utils/date-utils';
import {
  buildReservationDateTime,
  buildReservationCreatePayload,
  CART_MAX_ITEM_QUANTITY,
  calculateCartTotals,
  formatLocalDateTime,
  isReservationTooSoon,
  resolveCoverChargeCheckoutUrl,
  retryReservationCreateAfterPayment,
  RESERVATION_COVER_CHARGE_AMOUNT,
  RESERVATION_COVER_WAIVE_SUBTOTAL,
  SALES_TAX_RATE,
} from '@/utils/checkout-utils';

type OrderType = 'Pickup' | 'DineIn' | 'DriveThru';
type PaymentChoice = 'stripe' | 'saved';

export default function CheckoutScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const { cart, removeItem, updateQuantity, clearCart, addGuestOrderId, locationId: cartLocationId } = useCart();
  const { user, isGuest } = useAuth();
  const router = useRouter();

  // TODO: consolidate reservation + order fields into a shared checkout step
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

  const { subtotal, tax, total } = calculateCartTotals(cart);

  // A reservation that rides along with this checkout will be attached to the just-paid
  // order via attachedOrderId, so the $5 cover charge is automatically waived. We still
  // surface the rule in the totals so the customer understands the value.
  const reservationAttached = orderType === 'DineIn' && bookReservation;
  const subtotalQualifies = subtotal >= RESERVATION_COVER_WAIVE_SUBTOTAL;
  const coverChargeWaived = reservationAttached && (cart.length > 0 || subtotalQualifies);
  const coverChargeApplies = reservationAttached && !coverChargeWaived;
  const coverChargeAmount = coverChargeApplies ? RESERVATION_COVER_CHARGE_AMOUNT : 0;
  const displayedTotal = total + coverChargeAmount;

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
          const preferred = cartLocationId && active.some((l) => l.id === cartLocationId)
            ? cartLocationId
            : active[0].id;
          setSelectedLocationId(preferred);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingLocations(false));

    if (user && !isGuest) {
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
    } else {
      setPaymentMethods([]);
      setLoadingPaymentMethods(false);
      setSelectedPaymentChoice('stripe');
    }

    getTables()
      .then((data) => {
        setTables(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setTables([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const reservedFor = formatLocalDateTime(buildReservationDateTime(selectedDate, selectedHour));

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

  const tryCreateReservationForOrder = async (attachedOrderId?: number) => {
    if (!bookReservation || orderType !== 'DineIn') {
      return { success: false, message: '' };
    }

    if (!selectedLocationId || !selectedDate || selectedHour === null || !selectedTableId) {
      return { success: false, message: 'Reservation details were incomplete.' };
    }

    const reservedFor = buildReservationDateTime(selectedDate, selectedHour);
    const reservationPayload = buildReservationCreatePayload({
      locationId: selectedLocationId,
      tableId: selectedTableId,
      reservedForIso: formatLocalDateTime(reservedFor),
      partySize,
      attachedOrderId,
      specialRequests: reservationRequests,
    });

    try {
      await createReservation(reservationPayload);

      return { success: true, message: 'Your table reservation request was placed. Payment is received and staff will confirm it shortly.' };
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 402) {
        const paymentInfo = e.data as ReservationCoverChargeRequiredDto | undefined;
        const amount = paymentInfo?.coverChargeAmount;
        const coverChargeOrderId = paymentInfo?.coverChargeOrderId;
        const checkoutUrl = paymentInfo?.checkoutUrl;

        Alert.alert(
          'Reservation Cover Charge',
          amount
            ? `Your order is placed. A $${amount.toFixed(2)} cover charge is still required to secure this table if your paid order does not qualify yet.`
            : 'Your order is placed, but a cover charge may still be required to secure the table.',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Pay Now',
              onPress: async () => {
                const urlToOpen = await resolveCoverChargeCheckoutUrl(
                  coverChargeOrderId,
                  checkoutUrl,
                  createStripeCheckoutSession,
                  Linking.createURL('/'),
                );

                if (!urlToOpen) {
                  Alert.alert('Payment Required', 'Checkout could not be opened automatically.');
                  return;
                }

                try {
                  const coverRedirectUrl = Linking.createURL('/');
                  await WebBrowser.openAuthSessionAsync(urlToOpen, coverRedirectUrl);
                  if (coverChargeOrderId) {
                    try {
                      await syncStripePaymentStatus(coverChargeOrderId);
                    } catch {
                      // best effort
                    }
                  }

                  const created = await retryReservationCreateAfterPayment({
                    createReservation: () => createReservation(
                      buildReservationCreatePayload({
                        locationId: selectedLocationId,
                        tableId: selectedTableId,
                        reservedForIso: formatLocalDateTime(reservedFor),
                        partySize,
                        coverChargeOrderId,
                        specialRequests: reservationRequests,
                      }),
                    ),
                    isPendingError: (error) => error instanceof ApiError && error.status === 402,
                    maxAttempts: 3,
                  });

                  Alert.alert(
                    created ? 'Reservation Placed' : 'Payment Received',
                    created
                      ? 'Your reservation request is placed and payment is received. Staff will confirm it shortly.'
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

  const placeOrder = async () => {
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

      const reservedFor = buildReservationDateTime(selectedDate, selectedHour);

      if (isReservationTooSoon(reservedFor)) {
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

      if (isGuest) {
        addGuestOrderId(order.id);
      }

      if (selectedPaymentChoice === 'saved' && selectedPaymentMethodId) {
        try {
          const savedResult = await payOrderWithSavedMethod(order.id, selectedPaymentMethodId);
          if (savedResult.succeeded) {
            const reservationResult = await tryCreateReservationForOrder(order.id);
            clearCart();
            router.replace('/(tabs)/orders');
            setTimeout(() => {
              Alert.alert(
                'Payment Successful',
                reservationResult.message
                  ? `Your order #${order.orderCode} was paid using your saved card and is waiting for staff confirmation. ${reservationResult.message}`
                  : `Your order #${order.orderCode} was paid using your saved card and is waiting for staff confirmation.`
              );
            }, 300);
            return;
          }
        } catch {
          // saved card failed, fall back to Stripe checkout
        }
      }

      let stripeUrl: string | null = null;
      try {
        // Pass our deep-link base so the success page can redirect back to whichever
        // scheme this build uses (exp:// in Expo Go, selu383sp26mobile:// in standalone).
        stripeUrl = await createStripeCheckoutSession(order.id, Linking.createURL('/'));
      } catch (stripeErr: any) {
        clearCart();
        router.replace('/(tabs)/orders');
        setTimeout(() => {
          Alert.alert(
            'Payment Error',
            stripeErr?.message || 'Could not create Stripe checkout session. Your order has been placed — you can retry payment from your orders.',
          );
        }, 300);
        return;
      }

      try {
        const redirectUrl = Linking.createURL('/');
        await WebBrowser.openAuthSessionAsync(stripeUrl, redirectUrl);
      } catch {
        // dismissed or errored — sync will still catch a completed payment
      }

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

      const reservationResult = paymentCompleted ? await tryCreateReservationForOrder(order.id) : { success: false, message: '' };
      clearCart();
      router.replace('/(tabs)/orders');

      setTimeout(() => {
        if (!paymentCompleted) {
          Alert.alert(
            'Payment Pending',
            `Your order #${order.orderCode} was created, but payment has not been confirmed yet. Check your orders to see when it updates.`,
          );
        } else if (reservationResult.success) {
          Alert.alert('Order Paid', `Your order #${order.orderCode} is paid and waiting for staff confirmation. ${reservationResult.message}`);
        } else {
          Alert.alert(
            'Order Paid',
            reservationResult.message
              ? `Your order #${order.orderCode} was paid and is waiting for staff confirmation. ${reservationResult.message}`
              : `Your order #${order.orderCode} was paid and is waiting for staff confirmation.`
          );
        }
      }, 300);
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
                      onPress={() => {
                        if (item.quantity >= CART_MAX_ITEM_QUANTITY) {
                          Alert.alert('Quantity Limit', `Maximum quantity per item is ${CART_MAX_ITEM_QUANTITY}.`);
                          return;
                        }
                        updateQuantity(item.id, item.quantity + 1);
                      }}
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
                  <ThemedText style={[styles.totalLabel, { color: colors.textSecondary }]}>Tax ({(SALES_TAX_RATE * 100).toFixed(2)}%)</ThemedText>
                  <ThemedText style={[styles.totalValue, { color: colors.text }]}>${tax.toFixed(2)}</ThemedText>
                </View>
                {reservationAttached ? (
                  <View style={styles.totalRow}>
                    <ThemedText style={[styles.totalLabel, { color: colors.textSecondary }]}>Reservation cover fee</ThemedText>
                    {coverChargeWaived ? (
                      <ThemedText style={[styles.totalValue, { color: colors.primary }]}>Waived</ThemedText>
                    ) : (
                      <ThemedText style={[styles.totalValue, { color: colors.text }]}>${RESERVATION_COVER_CHARGE_AMOUNT.toFixed(2)}</ThemedText>
                    )}
                  </View>
                ) : null}
                <View style={styles.totalRow}>
                  <ThemedText style={[styles.totalLabelBold, { color: colors.text }]}>Total</ThemedText>
                  <ThemedText style={[styles.totalValueBold, { color: colors.primary }]}>${displayedTotal.toFixed(2)}</ThemedText>
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
                      {loc.address}, {loc.city}, {loc.state} {loc.zip}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))
            )}
            <ThemedText style={[styles.reservationHint, { color: colors.textSecondary, marginTop: 6 }]}>
              Accessibility: ADA compliant. No pets allowed except trained service animals.
            </ThemedText>
          </View>

          {orderType === 'DineIn' && !isGuest ? (
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
                          const slotDate = buildReservationDateTime(selectedDate, h);
                          const tooSoon = isReservationTooSoon(slotDate);
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

            {!isGuest && loadingPaymentMethods ? (
              <ActivityIndicator color={colors.primary} style={styles.paymentLoading} />
            ) : !isGuest && paymentMethods.length > 0 ? (
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
              <ThemedText style={[styles.noPaymentMethodsText, { color: colors.textSecondary }]}>
                {isGuest ? 'Sign in to use saved payment methods.' : 'No saved cards yet. Add one from Account.'}
              </ThemedText>
            )}
          </View>

          <AnimatedButton
            style={[styles.placeButton, { backgroundColor: placing || cart.length === 0 ? colors.border : colors.primary }]}
            onPress={placeOrder}
          >
            {placing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.placeButtonText}>
                {selectedPaymentChoice === 'saved' ? 'Pay with Saved Card' : 'Continue to Stripe'} · ${displayedTotal.toFixed(2)}
              </ThemedText>
            )}
          </AnimatedButton>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
