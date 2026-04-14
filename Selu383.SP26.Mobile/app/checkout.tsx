import React, { useEffect, useState } from 'react';
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
import { getLocations, createOrder, createStripeCheckoutSession, syncStripePaymentStatus, payOrderWithSavedMethod, type LocationDto } from '@/services/api';
import * as WebBrowser from 'expo-web-browser';

type OrderType = 'Pickup' | 'DineIn';

export default function CheckoutScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('Pickup');
  const [pickupName, setPickupName] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [placing, setPlacing] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.0875;
  const total = subtotal + tax;

  useEffect(() => {
    getLocations()
      .then((data) => {
        const active = data.filter((l) => l.isActive);
        setLocations(active);
        if (active.length > 0) setSelectedLocationId(active[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingLocations(false));
  }, []);

  useEffect(() => {
    if (user?.displayName) setPickupName(user.displayName);
    else if (user?.userName) setPickupName(user.userName);
  }, [user]);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Add items to your cart before checking out.');
      return;
    }
    if (!selectedLocationId) {
      Alert.alert('No Location', 'Please select a pickup location.');
      return;
    }
    if (orderType === 'Pickup' && !pickupName.trim()) {
      Alert.alert('Name Required', 'Enter a name for your pickup order.');
      return;
    }

    setPlacing(true);
    try {
      const order = await createOrder({
        locationId: selectedLocationId,
        orderType,
        pickupName: orderType === 'Pickup' ? pickupName.trim() : undefined,
        note: orderNote.trim() || undefined,
        items: cart.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          itemNote: item.customizationNotes || undefined,
        })),
      });

      // Try paying with saved card first (instant, no browser needed)
      try {
        const savedResult = await payOrderWithSavedMethod(order.id);
        if (savedResult.succeeded) {
          clearCart();
          router.replace('/(tabs)/orders');
          return;
        }
      } catch { /* no saved method — fall through to Stripe checkout */ }

      // Open Stripe checkout in the browser
      try {
        const stripeUrl = await createStripeCheckoutSession(order.id);
        await WebBrowser.openBrowserAsync(stripeUrl);

        // Stripe/webhook updates can lag briefly; retry sync a few times before returning to Orders.
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const syncResult = await syncStripePaymentStatus(order.id);
            if (syncResult.paymentStatus === 'Paid') {
              break;
            }
          } catch {
            // best effort
          }

          if (attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 900));
          }
        }

        clearCart();
        router.replace('/(tabs)/orders');
      } catch {
        // Stripe not configured — still confirm the order
        clearCart();
        
        // Show receipt if available
        if (order.receiptUrl) {
          Alert.alert(
            'Order Placed!',
            `Your order #${order.orderCode} is confirmed.\nPayment can be completed at the counter.`,
            [
              {
                text: 'View Receipt',
                onPress: () => {
                  WebBrowser.openBrowserAsync(order.receiptUrl!);
                  router.replace('/(tabs)/orders');
                },
              },
              {
                text: 'Done',
                onPress: () => router.replace('/(tabs)/orders'),
              },
            ],
          );
        } else {
          router.replace('/(tabs)/orders');
          setTimeout(() => {
            Alert.alert('Order Placed!', `Your order #${order.orderCode} is confirmed.\nPayment can be completed at the counter.`);
          }, 300);
        }
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

          {/* Header */}
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

          {/* Cart Items */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Your Order</ThemedText>

            {cart.length === 0 ? (
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                Your cart is empty.
              </ThemedText>
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

            {cart.length > 0 && (
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
            )}
          </View>

          {/* Order Type */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Order Type</ThemedText>
            <View style={styles.typeRow}>
              {(['Pickup', 'DineIn'] as OrderType[]).map((type) => (
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
                    name={type === 'Pickup' ? 'shopping-bag' : 'restaurant'}
                    size={18}
                    color={orderType === type ? '#fff' : colors.text}
                  />
                  <ThemedText style={[styles.typeLabel, { color: orderType === type ? '#fff' : colors.text }]}>
                    {type === 'DineIn' ? 'Dine In' : 'Pickup'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
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

          {/* Pickup Name */}
          {orderType === 'Pickup' && (
            <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Pickup Name</ThemedText>
              <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Name for your order"
                  placeholderTextColor={colors.textSecondary}
                  value={pickupName}
                  onChangeText={setPickupName}
                />
              </View>
            </View>
          )}

          {/* Special Instructions */}
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

          {/* Place Order */}
          <AnimatedButton
            style={[styles.placeButton, { backgroundColor: placing || cart.length === 0 ? colors.border : colors.primary }]}
            onPress={handlePlaceOrder}
          >
            {placing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.placeButtonText}>
                Place Order · ${total.toFixed(2)}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
  },
  typeLabel: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
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
    marginTop: 2,
  },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputMultiline: {
    minHeight: 80,
  },
  input: {
    fontFamily: 'Corben_400Regular',
    fontSize: 14,
  },
  placeButton: {
    borderRadius: 14,
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  placeButtonText: {
    color: '#fff',
    fontFamily: 'Corben_700Bold',
    fontSize: 18,
  },
});
