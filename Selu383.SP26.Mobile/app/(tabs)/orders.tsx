import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, RefreshControl, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PageHeaderActions } from '@/components/page-header-actions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CommonStyles, getColors } from '@/constants/styles';
import { getMyOrders, getReceiptPdfUrl, type OrderDto } from '@/services/api';

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Preparing: '#8b5cf6',
  Ready: '#10b981',
  Completed: '#6b7280',
  Cancelled: '#ef4444',
};

const PAYMENT_COLORS: Record<string, string> = {
  Unpaid: '#ef4444',
  Paid: '#10b981',
  Refunded: '#6b7280',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function OrdersScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const router = useRouter();

  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const openReceipt = useCallback(async (orderId: number) => {
    const receiptUrl = getReceiptPdfUrl(orderId);

    try {
      const supported = await Linking.canOpenURL(receiptUrl);
      if (!supported) {
        Alert.alert('Receipt unavailable', 'This device could not open the receipt link.');
        return;
      }

      await Linking.openURL(receiptUrl);
    } catch {
      Alert.alert('Receipt unavailable', 'There was a problem opening the receipt.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={CommonStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={colors.primary}
          />
        }
      >
        <ThemedView style={CommonStyles.container}>
          <PageHeaderActions />

          <View style={styles.titleRow}>
            <Image
              source={require('@/assets/images/ConceptLogo2-FpjOWRtT.png')}
              style={styles.titleLogo}
              resizeMode="contain"
            />
            <ThemedText style={CommonStyles.title}>Orders</ThemedText>
          </View>

          <View style={[styles.badge, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <ThemedText style={[styles.badgeText, { color: colors.primary }]}>Track every order in one place</ThemedText>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
          ) : error ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>{error}</ThemedText>
              <TouchableOpacity onPress={() => load()} style={[styles.retryBtn, { borderColor: colors.primary }]}>
                <ThemedText style={[styles.retryText, { color: colors.primary }]}>Retry</ThemedText>
              </TouchableOpacity>
            </View>
          ) : orders.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <MaterialIcons name="receipt-long" size={40} color={colors.textSecondary} style={{ marginBottom: 10 }} />
              <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>No orders yet</ThemedText>
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                Place your first order from the menu.
              </ThemedText>
              <TouchableOpacity
                style={[styles.menuBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/menu')}
              >
                <ThemedText style={styles.menuBtnText}>Browse Menu</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map((order) => (
              <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                {/* Order header */}
                <View style={styles.orderHeader}>
                  <View>
                    <ThemedText style={[styles.orderCode, { color: colors.text }]}>#{order.orderCode}</ThemedText>
                    <ThemedText style={[styles.orderDate, { color: colors.textSecondary }]}>{formatDate(order.orderTime)}</ThemedText>
                  </View>
                  <View style={styles.badges}>
                    <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[order.status] ?? '#6b7280') + '22', borderColor: STATUS_COLORS[order.status] ?? '#6b7280' }]}>
                      <ThemedText style={[styles.statusText, { color: STATUS_COLORS[order.status] ?? '#6b7280' }]}>
                        {order.status}
                      </ThemedText>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: (PAYMENT_COLORS[order.paymentStatus] ?? '#6b7280') + '22', borderColor: PAYMENT_COLORS[order.paymentStatus] ?? '#6b7280' }]}>
                      <ThemedText style={[styles.statusText, { color: PAYMENT_COLORS[order.paymentStatus] ?? '#6b7280' }]}>
                        {order.paymentStatus}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Meta row */}
                <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
                  <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
                    {order.orderType === 'DineIn' ? 'Dine In' : 'Pickup'}
                    {order.pickupName ? ` · ${order.pickupName}` : ''}
                  </ThemedText>
                  <ThemedText style={[styles.total, { color: colors.primary }]}>${order.total.toFixed(2)}</ThemedText>
                </View>

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <View style={[styles.itemsBlock, { borderTopColor: colors.border }]}>
                    {order.items.map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        <ThemedText style={[styles.itemQty, { color: colors.textSecondary }]}>{item.quantity}×</ThemedText>
                        <ThemedText style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                          Item #{item.menuItemId}
                        </ThemedText>
                        <ThemedText style={[styles.itemPrice, { color: colors.textSecondary }]}>${item.lineTotal.toFixed(2)}</ThemedText>
                      </View>
                    ))}
                    {order.note ? (
                      <ThemedText style={[styles.orderNote, { color: colors.textSecondary }]}>Note: {order.note}</ThemedText>
                    ) : null}
                    <TouchableOpacity
                      style={[styles.receiptButton, { borderColor: colors.primary, backgroundColor: colors.primary + '14' }]}
                      onPress={() => openReceipt(order.id)}
                    >
                      <MaterialIcons name="receipt-long" size={18} color={colors.primary} />
                      <ThemedText style={[styles.receiptButtonText, { color: colors.primary }]}>View Receipt</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
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
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'Oregano_400Regular',
    fontSize: 26,
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: 'Corben_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  retryBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  retryText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
  },
  menuBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  menuBtnText: {
    color: '#fff',
    fontFamily: 'Corben_700Bold',
    fontSize: 15,
  },
  orderCard: {
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
  },
  orderCode: {
    fontFamily: 'Corben_700Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  orderDate: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 11,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  metaText: {
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
  },
  total: {
    fontFamily: 'Corben_700Bold',
    fontSize: 16,
  },
  itemsBlock: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemQty: {
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
    minWidth: 24,
  },
  itemName: {
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
    flex: 1,
  },
  itemPrice: {
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
  },
  orderNote: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  receiptButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  receiptButtonText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 12,
  },
});
