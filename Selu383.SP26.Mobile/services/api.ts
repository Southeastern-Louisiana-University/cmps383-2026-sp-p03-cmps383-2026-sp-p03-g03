import { API_BASE_URL, apiCall, ApiError } from '@/services/api-core';
export { API_BASE_URL, apiCall, ApiError } from '@/services/api-core';
export type {
  CreateOrderDto,
  CreateOrderItemDto,
  CreatePaymentMethodDto,
  CreateReservationDto,
  CreateUserAccountDto,
  LocationDto,
  LocationMenuCategoryDto,
  LoyaltySummaryDto,
  MenuCategoryDto,
  MenuItemAvailabilityDto,
  MenuItemDto,
  OrderDto,
  OrderItemDto,
  OrderPaymentDto,
  PayWithSavedMethodResultDto,
  PaymentMethodDto,
  RedeemRewardDto,
  RegisterUserDto,
  RemovePaymentDto,
  ReservationAvailabilityDto,
  ReservationCoverChargeRequiredDto,
  ReservationDto,
  RewardDto,
  StaffUserDto,
  StripePaymentSyncResultDto,
  TableDto,
  UpdateStaffDto,
} from '@/services/api-types';
import type {
  CreateOrderDto,
  CreatePaymentMethodDto,
  CreateReservationDto,
  CreateUserAccountDto,
  LocationDto,
  LocationMenuCategoryDto,
  LoyaltySummaryDto,
  MenuCategoryDto,
  MenuItemAvailabilityDto,
  MenuItemDto,
  OrderDto,
  OrderPaymentDto,
  PayWithSavedMethodResultDto,
  PaymentMethodDto,
  RedeemRewardDto,
  RegisterUserDto,
  RemovePaymentDto,
  ReservationAvailabilityDto,
  ReservationDto,
  RewardDto,
  StaffUserDto,
  StripePaymentSyncResultDto,
  TableDto,
  UpdateStaffDto,
} from '@/services/api-types';

let hasWarnedPaymentMethods500 = false;

export const login = async (username: string, password: string) => {
  return apiCall("/api/authentication/login", "POST", {
    UserName: username,
    Password: password,
  });
};

export const register = async (dto: RegisterUserDto) => {
  return apiCall("/api/authentication/register", "POST", {
    UserName: dto.userName,
    Password: dto.password,
    FirstName: dto.firstName,
    LastName: dto.lastName,
    DisplayName: dto.displayName,
    Email: dto.email,
    PhoneNumber: dto.phoneNumber,
  });
};

export const createUserAccount = async (dto: CreateUserAccountDto) => {
  return apiCall("/api/users", "POST", {
    UserName: dto.userName,
    Password: dto.password,
    FirstName: dto.firstName,
    LastName: dto.lastName,
    DisplayName: dto.displayName,
    Email: dto.email,
    PhoneNumber: dto.phoneNumber,
    Roles: dto.roles,
    LocationId: dto.locationId,
  });
};

// ---------- Staff management (Admin / Manager) ----------

export const listStaff = async (): Promise<StaffUserDto[]> => {
  const result = await apiCall("/api/users/staff", "GET");
  return Array.isArray(result) ? result : [];
};

export const updateStaff = async (
  id: number,
  dto: UpdateStaffDto,
): Promise<StaffUserDto> => {
  return apiCall(`/api/users/${id}`, "PUT", dto);
};

export const disableStaff = async (id: number): Promise<StaffUserDto> => {
  return apiCall(`/api/users/${id}/disable`, "POST");
};

export const enableStaff = async (id: number): Promise<StaffUserDto> => {
  return apiCall(`/api/users/${id}/enable`, "POST");
};

export const resetStaffPassword = async (
  id: number,
  newPassword: string,
): Promise<void> => {
  await apiCall(`/api/users/${id}/reset-password`, "POST", { newPassword });
};

export const deleteStaff = async (id: number): Promise<void> => {
  await apiCall(`/api/users/${id}`, "DELETE");
};

export const getCurrentUser = async () => {
  return apiCall("/api/authentication/me", "GET");
};

export const logout = async (): Promise<void> => {
  await apiCall("/api/authentication/logout", "POST");
};

export const getMenuItems = async (): Promise<MenuItemDto[]> => {
  return apiCall(`/api/menu/items?ts=${Date.now()}`, "GET");
};

export const getMenuCategories = async (): Promise<MenuCategoryDto[]> => {
  return apiCall(`/api/menu/categories?ts=${Date.now()}`, "GET");
};

export const disableMenuItem = async (id: number, reason: string): Promise<MenuItemDto> => {
  return apiCall(`/api/menu/items/${id}/disable`, "POST", { reason });
};

export const enableMenuItem = async (id: number): Promise<MenuItemDto> => {
  return apiCall(`/api/menu/items/${id}/enable`, "POST");
};

export const createMenuItem = async (data: {
  categoryId: number;
  locationId?: number;
  name: string;
  description?: string;
  imagePath?: string;
  basePrice: number;
}): Promise<MenuItemDto> => {
  return apiCall("/api/menu/items", "POST", data);
};

export const deleteMenuItem = async (id: number): Promise<void> => {
  return apiCall(`/api/menu/items/${id}`, "DELETE");
};

export const getMenuByLocation = async (
  locationId: number,
): Promise<LocationMenuCategoryDto[]> => {
  return apiCall(`/api/menu/location/${locationId}?ts=${Date.now()}`, "GET");
};

export const getLocationAvailability = async (
  locationId: number,
): Promise<MenuItemAvailabilityDto[]> => {
  return apiCall(`/api/menu/items/location/${locationId}/availability?ts=${Date.now()}`, "GET");
};

export const disableMenuItemAtLocation = async (
  itemId: number,
  locationId: number,
  reason: string,
): Promise<MenuItemAvailabilityDto> => {
  return apiCall(`/api/menu/items/${itemId}/location/${locationId}/disable`, "POST", { reason });
};

export const enableMenuItemAtLocation = async (
  itemId: number,
  locationId: number,
): Promise<MenuItemAvailabilityDto> => {
  return apiCall(`/api/menu/items/${itemId}/location/${locationId}/enable`, "POST");
};

export const getMyOrders = async (): Promise<OrderDto[]> => apiCall("/api/orders/my-orders", "GET");

export const getAllOrders = async (): Promise<OrderDto[]> => apiCall("/api/orders", "GET");

export const updateOrderStatus = async (orderId: number, status: string): Promise<OrderDto> => {
  return apiCall(`/api/orders/${orderId}/status`, "PUT", { status });
};

export const getOrderById = async (orderId: number): Promise<OrderDto> => {
  return apiCall(`/api/orders/${orderId}`, "GET");
};

export const getReceiptPdfUrl = (orderId: number): string => {
  return `${API_BASE_URL}/api/orders/${orderId}/receiptpdf`;
};

export const archiveReceipt = async (
  orderId: number,
): Promise<{ receiptUrl: string }> => {
  return apiCall(`/api/orders/${orderId}/archive-receipt`, "POST");
};

export const getLocations = async (): Promise<LocationDto[]> => {
  return apiCall("/api/locations", "GET");
};

export const updateLocationManager = async (
  location: LocationDto,
  managerId?: number | null,
): Promise<LocationDto> => {
  return apiCall(`/api/locations/${location.id}`, "PUT", {
    Name: location.name,
    Type: location.type,
    Phone: location.phone,
    Address: location.address,
    City: location.city,
    State: location.state,
    Zip: location.zip,
    OpeningTime: location.openingTime,
    ClosingTime: location.closingTime,
    LayoutJson: location.layoutJson,
    IsActive: location.isActive,
    TableCount: location.tableCount ?? 1,
    ManagerId: managerId ?? null,
  });
};

export const createOrder = async (orderData: CreateOrderDto): Promise<OrderDto> => {
  return apiCall("/api/orders", "POST", orderData);
};

export const createStripeCheckoutSession = async (orderId: number, returnUrl?: string): Promise<string> => {
  const response = await apiCall("/api/payments/create-checkout-session", "POST", {
    orderId,
    returnUrl,
  });
  return response.checkoutUrl;
};

export const syncStripePaymentStatus = async (
  orderId: number,
): Promise<StripePaymentSyncResultDto> => {
  return apiCall(`/api/payments/orders/${orderId}/sync-stripe-status`, "POST");
};

export const payOrderWithSavedMethod = async (
  orderId: number,
  paymentMethodId?: number,
): Promise<PayWithSavedMethodResultDto> => {
  return apiCall(`/api/payments/orders/${orderId}/pay-with-saved-method`, "POST", {
    paymentMethodId,
  });
};

export const getPaymentMethods = async (): Promise<PaymentMethodDto[]> => {
  try {
    const response = await apiCall("/api/payments/methods", "GET");
    return Array.isArray(response) ? response : [];
  } catch (error: any) {
    if (error instanceof ApiError && error.status >= 500) {
      if (!hasWarnedPaymentMethods500) {
        console.warn("[API] payment methods endpoint returned 500; using empty list for now", error);
        hasWarnedPaymentMethods500 = true;
      }

      return [];
    }

    throw error;
  }
};

export const addPaymentMethod = async (
  method: CreatePaymentMethodDto,
): Promise<PaymentMethodDto> => {
  return apiCall("/api/payments/methods", "POST", method);
};

export const setDefaultPaymentMethod = async (id: number): Promise<void> => {
  await apiCall(`/api/payments/methods/${id}/default`, "POST");
};

export const deletePaymentMethod = async (id: number): Promise<void> => {
  await apiCall(`/api/payments/methods/${id}`, "DELETE");
};

export const getOrderPayments = async (orderId: number): Promise<OrderPaymentDto[]> => {
  const response = await apiCall(`/api/payments/orders/${orderId}`, "GET");
  return Array.isArray(response) ? response : [];
};

export const removeOrderPayment = async (
  orderId: number,
  paymentId: number,
  reason: string,
): Promise<void> => {
  await apiCall(`/api/payments/orders/${orderId}/${paymentId}`, "DELETE", {
    reason,
  } satisfies RemovePaymentDto);
};

export const refundOrderPayment = async (
  orderId: number,
  paymentId: number,
  reason: string,
): Promise<void> => {
  await removeOrderPayment(orderId, paymentId, reason);
};

export const getReservations = async (): Promise<ReservationDto[]> => {
  return apiCall("/api/reservations/my", "GET");
};

export const createReservation = async (
  reservationData: CreateReservationDto,
): Promise<ReservationDto> => {
  return apiCall("/api/reservations", "POST", reservationData);
};

export const getLocationReservations = async (locationId: number): Promise<ReservationDto[]> => {
  const response = await apiCall(`/api/reservations/location/${locationId}`, "GET");
  return Array.isArray(response) ? response : [];
};

export const getReservationAvailability = async (
  locationId: number,
  reservedFor: string,
): Promise<ReservationAvailabilityDto> => {
  return apiCall(`/api/reservations/availability?locationId=${locationId}&reservedFor=${encodeURIComponent(reservedFor)}`, "GET");
};

export const updateReservation = async (
  reservationId: number,
  reservationData: CreateReservationDto & { status: string },
): Promise<ReservationDto> => {
  return apiCall(`/api/reservations/${reservationId}`, "PUT", reservationData);
};

export const cancelReservation = async (reservationId: number) => {
  return apiCall(`/api/reservations/${reservationId}`, "DELETE");
};

export const getTables = async (): Promise<TableDto[]> => apiCall("/api/tables", "GET");

export const getMyLoyalty = async (): Promise<LoyaltySummaryDto> => apiCall("/api/loyalty/me", "GET");

export const getRewards = async (): Promise<RewardDto[]> => {
  const response = await apiCall("/api/loyalty/rewards", "GET");
  return Array.isArray(response) ? response : [];
};

export const redeemReward = async (
  rewardId: number,
): Promise<{ message: string; remainingPoints: number }> => {
  return apiCall("/api/loyalty/redeem", "POST", {
    rewardId,
  } satisfies RedeemRewardDto);
};

export default {
  login,
  register,
  createUserAccount,
  getCurrentUser,
  logout,
  getMenuItems,
  getMenuCategories,
  disableMenuItem,
  enableMenuItem,
  createMenuItem,
  getMenuByLocation,
  getLocationAvailability,
  disableMenuItemAtLocation,
  enableMenuItemAtLocation,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  getReceiptPdfUrl,
  archiveReceipt,
  getLocations,
  createOrder,
  createStripeCheckoutSession,
  syncStripePaymentStatus,
  payOrderWithSavedMethod,
  getPaymentMethods,
  addPaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  getOrderPayments,
  removeOrderPayment,
  refundOrderPayment,
  getReservations,
  createReservation,
  getLocationReservations,
  getReservationAvailability,
  updateReservation,
  cancelReservation,
  getTables,
  getMyLoyalty,
  getRewards,
  redeemReward,
  listStaff,
  updateStaff,
  disableStaff,
  enableStaff,
  resetStaffPassword,
  deleteStaff,
};