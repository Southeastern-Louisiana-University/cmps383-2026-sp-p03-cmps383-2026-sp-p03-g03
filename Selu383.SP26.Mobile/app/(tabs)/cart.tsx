import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
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

export default function CartScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const router = useRouter();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.0875;
  const total = subtotal + tax;

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

              <View style={[styles.totalsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <View style={styles.totalRow}>
                  <ThemedText style={[styles.totalLabel, { color: colors.textSecondary }]}>Subtotal</ThemedText>
                  <ThemedText style={[styles.totalValue, { color: colors.text }]}>${subtotal.toFixed(2)}</ThemedText>
                </View>
                <View style={styles.totalRow}>
                  <ThemedText style={[styles.totalLabel, { color: colors.textSecondary }]}>Tax (8.75%)</ThemedText>
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

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  titleLogo: {
    width: 34,
    height: 34,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 14,
  },
  badgeText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 12,
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  headline: {
    fontFamily: 'Oregano_400Regular',
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  copy: {
    fontFamily: 'Corben_400Regular',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  menuButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  menuButtonText: {
    color: '#fff',
    fontFamily: 'Corben_700Bold',
    fontSize: 15,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
    marginBottom: 2,
  },
  itemNote: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: 'Corben_700Bold',
    fontSize: 15,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
    minWidth: 22,
    textAlign: 'center',
  },
  removeBtn: {
    marginLeft: 4,
    padding: 2,
  },
  totalsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    marginBottom: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalRowFinal: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0,
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
  },
  totalValueBold: {
    fontFamily: 'Corben_700Bold',
    fontSize: 18,
  },
  checkoutButton: {
    borderRadius: 14,
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkoutButtonText: {
    color: '#fff',
    fontFamily: 'Corben_700Bold',
    fontSize: 18,
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  clearText: {
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
