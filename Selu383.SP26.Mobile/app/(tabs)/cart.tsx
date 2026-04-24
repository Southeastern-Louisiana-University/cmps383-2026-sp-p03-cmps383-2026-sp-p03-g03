import React from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedButton } from '@/components/animated-button';
import { PageHeaderActions } from '@/components/page-header-actions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/hooks/useCart';
import { CommonStyles, getColors } from '@/constants/styles';
import { styles } from '@/styles/screens/cart.styles';
import { calculateCartTotals, SALES_TAX_RATE } from '@/utils/checkout-utils';

export default function CartScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark');
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const router = useRouter();

  const { subtotal, tax, total } = calculateCartTotals(cart);

  return (
    <SafeAreaView style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={CommonStyles.scrollContent}>
        <ThemedView style={CommonStyles.container}>
          <PageHeaderActions />

          <View style={styles.titleRow}>
            <Image
              source={require('@/assets/images/ConceptLogo2-FpjOWRtT.png')}
              style={styles.titleLogo}
              resizeMode="contain"
            />
            <ThemedText style={CommonStyles.title}>Cart</ThemedText>
          </View>

          <View style={[styles.badge, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <ThemedText style={[styles.badgeText, { color: colors.primary }]}>Quick pickup, fast checkout</ThemedText>
          </View>

          {cart.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <ThemedText style={styles.headline}>Nothing here yet</ThemedText>
              <ThemedText style={[styles.copy, { color: colors.textSecondary }]}>
                Browse the menu and add your favorites.
              </ThemedText>
              <AnimatedButton
                style={[styles.menuButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/menu')}
              >
                <ThemedText style={styles.menuButtonText}>Go to Menu</ThemedText>
              </AnimatedButton>
            </View>
          ) : (
            <>
              {cart.map((item) => (
                <View key={item.id} style={[styles.cartRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <View style={styles.itemInfo}>
                    <ThemedText style={[styles.itemName, { color: colors.text }]}>{item.name}</ThemedText>
                    {item.customizationNotes ? (
                      <ThemedText style={[styles.itemNote, { color: colors.textSecondary }]}>
                        {item.customizationNotes}
                      </ThemedText>
                    ) : null}
                    <ThemedText style={[styles.itemPrice, { color: colors.primary }]}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </ThemedText>
                  </View>

                  <View style={styles.controls}>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { borderColor: colors.border }]}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <MaterialIcons name="remove" size={14} color={colors.text} />
                    </TouchableOpacity>
                    <ThemedText style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</ThemedText>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { borderColor: colors.border }]}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <MaterialIcons name="add" size={14} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.id)}>
                      <MaterialIcons name="delete-outline" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={[styles.addMoreButton, { borderColor: colors.primary, backgroundColor: colors.primary + '12' }]}
                onPress={() => router.push('/(tabs)/menu')}
                activeOpacity={0.85}
              >
                <MaterialIcons name="restaurant-menu" size={18} color={colors.primary} />
                <ThemedText style={[styles.addMoreButtonText, { color: colors.primary }]}>Add More Items</ThemedText>
              </TouchableOpacity>

              <View style={[styles.totalsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <View style={styles.totalRow}>
                  <ThemedText style={[styles.totalLabel, { color: colors.textSecondary }]}>Subtotal</ThemedText>
                  <ThemedText style={[styles.totalValue, { color: colors.text }]}>${subtotal.toFixed(2)}</ThemedText>
                </View>
                <View style={styles.totalRow}>
                  <ThemedText style={[styles.totalLabel, { color: colors.textSecondary }]}>Tax ({(SALES_TAX_RATE * 100).toFixed(2)}%)</ThemedText>
                  <ThemedText style={[styles.totalValue, { color: colors.text }]}>${tax.toFixed(2)}</ThemedText>
                </View>
                <View style={[styles.totalRow, styles.totalRowFinal]}>
                  <ThemedText style={[styles.totalLabelBold, { color: colors.text }]}>Total</ThemedText>
                  <ThemedText style={[styles.totalValueBold, { color: colors.primary }]}>${total.toFixed(2)}</ThemedText>
                </View>
              </View>

              <AnimatedButton
                style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/checkout')}
              >
                <ThemedText style={styles.checkoutButtonText}>Proceed to Checkout</ThemedText>
              </AnimatedButton>

              <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
                <ThemedText style={[styles.clearText, { color: colors.textSecondary }]}>Clear cart</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
