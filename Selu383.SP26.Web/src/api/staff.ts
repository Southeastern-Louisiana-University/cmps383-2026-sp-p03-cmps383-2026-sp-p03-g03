import { requestApi } from "./context-providers/app-context";

export interface StaffOrder {
  id: number;
  locationId: number;
  createdByUserId: number;
  orderCode: string;
  orderType: string;
  status: string;
  paymentStatus: string;
  orderTime: string;
  scheduledPickupTime: string | null;
  total: number;
  pickupName: string | null;
  itemCount: number;
}

export interface OrderPayment {
  id: number;
  provider: string;
  paymentMethodType: string;
  transactionId: string;
  amount: number;
  status: string;
  createdAt: string;
  removedAt: string | null;
  removedReason: string | null;
}

export interface DailySummary {
  date: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  openOrders: number;
  revenue: number;
  topItems: { menuItemName: string; quantitySold: number }[];
}

export interface AdminUser {
  id: number;
  userName: string;
  displayName: string | null;
  email: string | null;
  roles: string[];
  loyaltyPoints: number;
  createdAt: string;
}

function parseMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object") {
    const msg = (payload as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim().length > 0) return msg;
  }
  return `Request failed (HTTP ${status})`;
}

export async function listStaffOrders(
  opts?: { status?: string; locationId?: number },
): Promise<StaffOrder[]> {
  const params = new URLSearchParams();
  if (opts?.status) params.set("status", opts.status);
  if (opts?.locationId) params.set("locationId", String(opts.locationId));
  const qs = params.toString();
  const url = `/api/staff/orders${qs ? `?${qs}` : ""}`;
  const { response, payload } = await requestApi(url, { method: "GET" });
  if (!response.ok) throw new Error(parseMessage(payload, response.status));
  return payload as StaffOrder[];
}

export async function advanceOrder(orderId: number): Promise<StaffOrder> {
  const { response, payload } = await requestApi(
    `/api/staff/orders/${orderId}/advance`,
    { method: "POST" },
  );
  if (!response.ok) throw new Error(parseMessage(payload, response.status));
  return payload as StaffOrder;
}

export async function cancelOrder(
  orderId: number,
  reason: string,
): Promise<StaffOrder> {
  const { response, payload } = await requestApi(
    `/api/staff/orders/${orderId}/cancel`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  );
  if (!response.ok) throw new Error(parseMessage(payload, response.status));
  return payload as StaffOrder;
}

export async function listOrderPayments(
  orderId: number,
): Promise<OrderPayment[]> {
  const { response, payload } = await requestApi(
    `/api/payments/orders/${orderId}`,
    { method: "GET" },
  );
  if (!response.ok) throw new Error(parseMessage(payload, response.status));
  return payload as OrderPayment[];
}

export async function refundOrderPayment(
  orderId: number,
  paymentId: number,
  reason: string,
): Promise<void> {
  const { response, payload } = await requestApi(
    `/api/payments/orders/${orderId}/${paymentId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  );
  if (!response.ok) throw new Error(parseMessage(payload, response.status));
}

export async function disableMenuItem(
  itemId: number,
  reason: string,
): Promise<void> {
  const { response, payload } = await requestApi(
    `/api/staff/menu-items/${itemId}/disable`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  );
  if (!response.ok) throw new Error(parseMessage(payload, response.status));
}

export async function enableMenuItem(itemId: number): Promise<void> {
  const { response, payload } = await requestApi(
    `/api/staff/menu-items/${itemId}/enable`,
    { method: "POST" },
  );
  if (!response.ok) throw new Error(parseMessage(payload, response.status));
}

export async function getDailySummary(date?: string): Promise<DailySummary> {
  const qs = date ? `?date=${encodeURIComponent(date)}` : "";
  const { response, payload } = await requestApi(
    `/api/staff/reports/daily-summary${qs}`,
    { method: "GET" },
  );
  if (!response.ok) throw new Error(parseMessage(payload, response.status));
  return payload as DailySummary;
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const { response, payload } = await requestApi(`/api/staff/admin/users`, {
    method: "GET",
  });
  if (!response.ok) throw new Error(parseMessage(payload, response.status));
  return payload as AdminUser[];
}
