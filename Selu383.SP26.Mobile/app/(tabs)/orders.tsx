import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PageHeaderActions } from '@/components/page-header-actions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CommonStyles, getColors } from '@/constants/styles';
import {
  getAllOrders,
  getLocations,
  getMyOrders,
  getOrderById,
  getOrderPayments,
  refundOrderPayment,
  syncStripePaymentStatus,
  updateOrderStatus,
  type OrderDto,
} from '@/services/api';
import { useCart } from '@/hooks/useCart';
import { getUserPermissions } from '@/utils/role-helpers';
import { styles } from '@/styles/screens/orders.styles';

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Placed: '#f59e0b',
  Confirmed: '#3b82f6',
  Preparing: '#8b5cf6',
  Ready: '#10b981',
  Completed: '#6b7280',
  Cancelled: '#ef4444',
};

const NEXT_STATUS: Record<string, string | undefined> = {
  Placed: 'Confirmed',
  Confirmed: 'Preparing',
  Preparing: 'Ready',
  Ready: 'Completed',
};

const PAYMENT_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Paid: '#10b981',
  Refunded: '#6b7280',
};

function formatOrderStatus(status: string) {
  if (status === 'Placed') {
    return 'Pending';
  }

  return status;
}

function formatPaymentStatus(paymentStatus: string) {
  // Backend now returns "Pending" for unpaid orders. Keep a safety net for any legacy rows.
  if (paymentStatus === 'Unpaid') {
    return 'Pending';
  }

  if (paymentStatus === 'Refunded') {
    return 'Cancelled';
  }

  return paymentStatus;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' - ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function OrdersScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const { guestOrderIds } = useCart();

  const { isPrivileged, isAdmin, isManager } = getUserPermissions(user?.roles);
  const canRefund = isAdmin || isManager;

  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managingOrderId, setManagingOrderId] = useState<number | null>(null);
  const [refundingOrderId, setRefundingOrderId] = useState<number | null>(null);
  const [locationNames, setLocationNames] = useState<Record<number, string>>({});

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    // Only show the full-screen loading state when we have nothing yet \u2014 otherwise
    // keep the previous list visible to avoid a slow-feeling re-render on every focus.
    else setLoading((prev) => (prev ? prev : false));
    setError(null);

    try {
      let data: OrderDto[];

      if (isGuest && !user) {
        // no session cookie, fetch each guest order by ID
        if (guestOrderIds.length === 0) {
          data = [];
        } else {
          const results = await Promise.all(
            guestOrderIds.map((id) => getOrderById(id).catch(() => null)),
          );
          data = results.filter((o): o is OrderDto => o !== null);
          data.sort((a, b) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime());
        }
      } else {
        data = isPrivileged ? await getAllOrders() : await getMyOrders();
      }

      setOrders(data);

      const unpaidOrders = data.filter((o) => o.paymentStatus === 'Pending' || o.paymentStatus === 'Unpaid').slice(0, 3);
      if (unpaidOrders.length > 0) {
        void (async () => {
          let shouldRefresh = false;

          await Promise.all(
            unpaidOrders.map(async (order) => {
              try {
                const syncResult = await syncStripePaymentStatus(order.id);
                if (syncResult.paymentStatus === 'Paid' || syncResult.updated) {
                  shouldRefresh = true;
                }
              } catch {
                // best effort
              }
            }),
          );

          if (shouldRefresh) {
            try {
              const refreshed = isPrivileged ? await getAllOrders() : await getMyOrders();
              setOrders(refreshed);
            } catch {
              // best effort
            }
          }
        })();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isPrivileged, isGuest, user, guestOrderIds]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let active = true;

    const loadLocations = async () => {
      try {
        const locations = await getLocations();
        if (!active) return;

        const mapped = locations.reduce<Record<number, string>>((acc, location) => {
          acc[location.id] = location.name;
          return acc;
        }, {});

        setLocationNames(mapped);
      } catch {
        // keep orders usable even if locations endpoint fails
      }
    };

    void loadLocations();

    return () => {
      active = false;
    };
  }, []);

  const advanceStatus = async (order: OrderDto) => {
    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;

    try {
      setManagingOrderId(order.id);
      await updateOrderStatus(order.id, nextStatus);
      await load(true);
    } catch (err: any) {
      Alert.alert('Order Update Failed', err.message || 'Could not update order status.');
    } finally {
      setManagingOrderId(null);
    }
  };

  const refundOrder = (order: OrderDto) => {
    Alert.alert('Cancel Order', `Cancel order #${order.orderCode}?`, [
      { text: 'Back', style: 'cancel' },
      {
        text: 'Cancel Order',
        style: 'destructive',
        onPress: async () => {
          try {
            setRefundingOrderId(order.id);
            const payments = await getOrderPayments(order.id);
            const paidPayment = payments.find((payment) => payment.status === 'Paid');

            if (!paidPayment) {
              Alert.alert('No Paid Charge', 'No paid charge was found for this order.');
              return;
            }

            await refundOrderPayment(order.id, paidPayment.id, 'Order cancelled by management');
            await load(true);
          } catch (err: any) {
            Alert.alert('Cancel Failed', err.message || 'Could not cancel order.');
          } finally {
            setRefundingOrderId(null);
          }
        },
      },
    ]);
  };

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
          <PageHeaderActions showPortal />

          <View style={styles.titleRow}>
            <Image
              source={require('@/assets/images/ConceptLogo2-FpjOWRtT.png')}
              style={styles.titleLogo}
              resizeMode="contain"
            />
            <ThemedText style={CommonStyles.title}>Orders</ThemedText>
          </View>

          <View style={[styles.badge, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <ThemedText style={[styles.badgeText, { color: colors.primary }]}>
              {isPrivileged ? 'Staff & manager order handling' : 'Track every order in one place'}
            </ThemedText>
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
                {isGuest ? 'Sign in to view your order history.' : isPrivileged ? 'No active orders need attention right now.' : 'Place your first order from the menu.'}
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
                {/** Keep backend statuses unchanged; only normalize labels for display. */}
                {(() => {
                  const orderStatusLabel = formatOrderStatus(order.status);
                  const paymentStatusLabel = formatPaymentStatus(order.paymentStatus);

                  return (
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderInfo}>
                    <ThemedText style={[styles.orderCode, { color: colors.text }]}>#{order.orderCode}</ThemedText>
                    <ThemedText style={[styles.orderDate, { color: colors.textSecondary }]}>{formatDate(order.orderTime)}</ThemedText>
                    <ThemedText style={[styles.orderDate, { color: colors.textSecondary }]}> 
                      Location: {locationNames[order.locationId] ?? `#${order.locationId}`}
                    </ThemedText>
                  </View>
                  <View style={styles.badges}>
                    <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[orderStatusLabel] ?? '#6b7280') + '22', borderColor: STATUS_COLORS[orderStatusLabel] ?? '#6b7280' }]}>
                      <ThemedText style={[styles.statusText, { color: STATUS_COLORS[orderStatusLabel] ?? '#6b7280' }]}>
                        {orderStatusLabel}
                      </ThemedText>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: (PAYMENT_COLORS[paymentStatusLabel] ?? '#6b7280') + '22', borderColor: PAYMENT_COLORS[paymentStatusLabel] ?? '#6b7280' }]}>
                      <ThemedText style={[styles.statusText, { color: PAYMENT_COLORS[paymentStatusLabel] ?? '#6b7280' }]}>
                        {paymentStatusLabel}
                      </ThemedText>
                    </View>
                  </View>
                </View>
                  );
                })()}

                <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
                  <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}> 
                    {order.orderType}
                    {order.pickupName ? ` - ${order.pickupName}` : ''}
                    {order.note?.includes('Reservation:') ? ' - Reservation added' : ''}
                  </ThemedText>
                  <ThemedText style={[styles.total, { color: colors.primary }]}>${order.total.toFixed(2)}</ThemedText>
                </View>

                {order.items && order.items.length > 0 ? (
                  <View style={[styles.itemsBlock, { borderTopColor: colors.border }]}>
                    {order.items.map((item) => (
                      <View key={item.id}>
                        <View style={styles.itemRow}>
                          <ThemedText style={[styles.itemQty, { color: colors.textSecondary }]}>{item.quantity}x</ThemedText>
                          <ThemedText style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                            {item.menuItemName?.trim() || 'Menu item'}
                          </ThemedText>
                          <ThemedText style={[styles.itemPrice, { color: colors.textSecondary }]}>${item.lineTotal.toFixed(2)}</ThemedText>
                        </View>
                        {item.itemNote ? (
                          <ThemedText style={[styles.orderNote, { color: colors.textSecondary }]}>Item note: {item.itemNote}</ThemedText>
                        ) : null}
                      </View>
                    ))}
                    {order.note ? (
                      <ThemedText style={[styles.orderNote, { color: colors.textSecondary }]}>Note: {order.note}</ThemedText>
                    ) : null}
                  </View>
                ) : null}

                {isPrivileged && (NEXT_STATUS[order.status] || (canRefund && order.paymentStatus === 'Paid')) ? (
                  <View style={[styles.manageRow, { borderTopColor: colors.border }]}>
                    {NEXT_STATUS[order.status] ? (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary, opacity: managingOrderId === order.id ? 0.7 : 1 }]}
                        onPress={() => advanceStatus(order)}
                        disabled={managingOrderId === order.id}
                      >
                        <ThemedText style={styles.actionButtonText}>Mark {NEXT_STATUS[order.status]}</ThemedText>
                      </TouchableOpacity>
                    ) : null}

                    {canRefund && order.paymentStatus === 'Paid' ? (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.dangerButton, { opacity: refundingOrderId === order.id ? 0.7 : 1 }]}
                        onPress={() => refundOrder(order)}
                        disabled={refundingOrderId === order.id}
                      >
                        <ThemedText style={styles.actionButtonText}>Cancel</ThemedText>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ))
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
