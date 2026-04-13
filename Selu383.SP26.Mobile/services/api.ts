const AZURE_API_BASE_URL = "https://selu383-sp26-p03-g03.azurewebsites.net";
const LOCAL_API_BASE_URL = "https://localhost:7116";
const TIMEOUT = 30000;

const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const envTarget = process.env.EXPO_PUBLIC_API_TARGET?.trim().toLowerCase();
  const azureEnvUrl = process.env.EXPO_PUBLIC_AZURE_API_BASE_URL?.trim();
  const localEnvUrl = process.env.EXPO_PUBLIC_LOCAL_API_BASE_URL?.trim();

  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  if (envTarget === "local") {
    return (localEnvUrl || LOCAL_API_BASE_URL).replace(/\/$/, "");
  }

  return (azureEnvUrl || AZURE_API_BASE_URL).replace(/\/$/, "");
};

const API_BASE_URL = getApiBaseUrl();
let hasWarnedPaymentMethods500 = false;

export class ApiError<T = unknown> extends Error {
  status: number;
  data?: T;

  constructor(message: string, status: number, data?: T) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export interface MenuItemDto {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  basePrice: number;
  isAvailable: boolean;
  unavailableReason?: string;
}

export interface MenuCategoryDto {
  id: number;
  name: string;
  isSeasonal: boolean;
  isActive: boolean;
}

export interface OrderItemDto {
  id: number;
  menuItemId: number;
  menuItemName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  itemNote?: string;
}

export interface OrderDto {
  id: number;
  locationId: number;
  createdByUserId: number;
  orderCode: string;
  orderType: string;
  status: string;
  paymentStatus: string;
  orderTime: string;
  scheduledPickupTime?: string;
  subtotal?: number;
  tax?: number;
  total: number;
  note?: string;
  pickupName?: string;
  items: OrderItemDto[];
  receiptUrl?: string;
}

export interface LocationDto {
  id: number;
  name: string;
  type: string;
  phone?: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  openingTime?: string;
  closingTime?: string;
  isActive: boolean;
  tableCount?: number;
  managerId?: number;
  managerName?: string;
}

export interface CreateOrderItemDto {
  menuItemId: number;
  quantity: number;
  itemNote?: string;
}

export interface CreateOrderDto {
  locationId: number;
  orderType: string;
  note?: string;
  pickupName?: string;
  scheduledPickupTime?: string;
  items: CreateOrderItemDto[];
}

export interface RegisterUserDto {
  userName: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface CreateUserAccountDto {
  userName: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  roles: string[];
  locationId?: number;
}

export interface PaymentMethodDto {
  id: number;
  cardholderName: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface CreatePaymentMethodDto {
  cardholderName: string;
  cardNumber?: string; // Full card number for Stripe tokenization
  cvc?: string; // CVV for Stripe tokenization
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
}

export interface OrderPaymentDto {
  id: number;
  provider: string;
  paymentMethodType: string;
  transactionId?: string;
  amount: number;
  status: string;
  createdAt: string;
  removedAt?: string;
  removedReason?: string;
}

export interface RemovePaymentDto {
  reason: string;
}

export interface ReservationCoverChargeRequiredDto {
  message: string;
  coverChargeAmount: number;
  coverChargeOrderId: number;
  checkoutUrl?: string | null;
}

export interface StripePaymentSyncResultDto {
  orderId: number;
  paymentStatus: string;
  orderStatus: string;
  updated: boolean;
}

export interface PayWithSavedMethodResultDto {
  succeeded: boolean;
  requiresCheckout: boolean;
  message: string;
  paymentStatus?: string;
}

export interface ReservationDto {
  id: number;
  locationId: number;
  userId: number;
  tableId: number;
  reservedFor: string;
  partySize: number;
  status: string;
  specialRequests?: string;
}

export interface CreateReservationDto {
  locationId: number;
  tableId: number;
  reservedFor: string;
  partySize: number;
  specialRequests?: string;
}

export interface TableDto {
  id: number;
  locationId: number;
  tableNumber: string;
  seats: number;
  isBarSeat: boolean;
  isActive: boolean;
}

export interface LoyaltyLedgerEntryDto {
  id: number;
  orderId?: number;
  rewardId?: number;
  rewardName?: string;
  pointsEarned: number;
  pointsRedeemed: number;
  createdAt: string;
}

export interface LoyaltySummaryDto {
  points: number;
  history: LoyaltyLedgerEntryDto[];
}

export interface RewardDto {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  isActive: boolean;
}

export interface RedeemRewardDto {
  rewardId: number;
}

const apiCall = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  data?: unknown,
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (data && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    options.body = JSON.stringify(data);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT);

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok) {
      let errorData: unknown;
      let errorText = "";

      if (contentType.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch {
          errorData = undefined;
        }
      } else {
        errorText = (await response.text())?.trim();
      }

      if (!errorText && typeof errorData === "string") {
        errorText = errorData.trim();
      } else if (
        !errorText &&
        errorData &&
        typeof errorData === "object" &&
        "message" in errorData &&
        typeof (errorData as { message?: unknown }).message === "string"
      ) {
        errorText = (errorData as { message: string }).message.trim();
      } else if (
        !errorText &&
        errorData &&
        typeof errorData === "object" &&
        "error" in errorData &&
        typeof (errorData as { error?: unknown }).error === "string"
      ) {
        errorText = (errorData as { error: string }).error.trim();
      } else if (
        !errorText &&
        errorData &&
        typeof errorData === "object" &&
        "details" in errorData &&
        typeof (errorData as { details?: unknown }).details === "string"
      ) {
        errorText = (errorData as { details: string }).details.trim();
      } else if (
        !errorText &&
        errorData &&
        typeof errorData === "object" &&
        "detail" in errorData &&
        typeof (errorData as { detail?: unknown }).detail === "string"
      ) {
        errorText = (errorData as { detail: string }).detail.trim();
      } else if (
        !errorText &&
        errorData &&
        typeof errorData === "object" &&
        "title" in errorData &&
        typeof (errorData as { title?: unknown }).title === "string"
      ) {
        errorText = (errorData as { title: string }).title.trim();
      } else if (
        !errorText &&
        errorData &&
        typeof errorData === "object" &&
        "errors" in errorData &&
        (errorData as { errors?: unknown }).errors &&
        typeof (errorData as { errors: unknown }).errors === "object"
      ) {
        const validationErrors = Object.values((errorData as { errors: Record<string, string[]> }).errors)
          .flat()
          .filter((v): v is string => typeof v === "string" && v.trim().length > 0);

        if (validationErrors.length > 0) {
          errorText = validationErrors[0];
        }
      }

      if (response.status === 401) {
        throw new ApiError(
          errorText || "Unauthorized. Please log in again.",
          response.status,
          errorData,
        );
      }

      if (response.status === 402) {
        throw new ApiError(
          errorText || "Payment required.",
          response.status,
          errorData,
        );
      }

      if (response.status === 403) {
        throw new ApiError(
          errorText || "Access denied for this account.",
          response.status,
          errorData,
        );
      }

      throw new ApiError(
        `API Error: ${response.status} - ${errorText || "Request failed"}`,
        response.status,
        errorData,
      );
    }

    if (response.status === 204 || !contentType.includes("application/json")) {
      return null;
    }

    return await response.json();
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error?.name === "AbortError") {
      throw new Error(`Request timed out after ${TIMEOUT / 1000} seconds`);
    }

    if (error?.message === "Network request failed") {
      throw new Error(
        `Network request failed. Verify API host is reachable: ${API_BASE_URL}`,
      );
    }

    throw new Error(error.message || "Network request failed");
  }
};

export const login = async (username: string, password: string): Promise<any> => {
  return apiCall("/api/authentication/login", "POST", {
    UserName: username,
    Password: password,
  });
};

export const register = async (dto: RegisterUserDto): Promise<any> => {
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

export const createUserAccount = async (dto: CreateUserAccountDto): Promise<any> => {
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

export const getCurrentUser = async (): Promise<any> => {
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

export const disableMenuItem = async (
  id: number,
  reason: string,
): Promise<MenuItemDto> => {
  return apiCall(`/api/menu/items/${id}/disable`, "POST", { reason });
};

export const enableMenuItem = async (id: number): Promise<MenuItemDto> => {
  return apiCall(`/api/menu/items/${id}/enable`, "POST");
};

export const getMyOrders = async (): Promise<OrderDto[]> => {
  return apiCall("/api/orders/my-orders", "GET");
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

export const createOrder = async (orderData: CreateOrderDto): Promise<OrderDto> => {
  return apiCall("/api/orders", "POST", orderData);
};

export const createStripeCheckoutSession = async (orderId: number): Promise<string> => {
  const response = await apiCall("/api/payments/create-checkout-session", "POST", {
    orderId,
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
): Promise<PayWithSavedMethodResultDto> => {
  return apiCall(`/api/payments/orders/${orderId}/pay-with-saved-method`, "POST", {});
};

export const getPaymentMethods = async (): Promise<PaymentMethodDto[]> => {
  try {
    const response = await apiCall("/api/payments/methods", "GET");
    return Array.isArray(response) ? response : [];
  } catch (error: unknown) {
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

export const getReservations = async (): Promise<ReservationDto[]> => {
  return apiCall("/api/reservations/my", "GET");
};

export const createReservation = async (
  reservationData: CreateReservationDto,
): Promise<ReservationDto> => {
  return apiCall("/api/reservations", "POST", reservationData);
};

export const cancelReservation = async (reservationId: number): Promise<any> => {
  return apiCall(`/api/reservations/${reservationId}`, "DELETE");
};

export const getTables = async (): Promise<TableDto[]> => {
  return apiCall("/api/tables", "GET");
};

export const getMyLoyalty = async (): Promise<LoyaltySummaryDto> => {
  return apiCall("/api/loyalty/me", "GET");
};

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
  getMyOrders,
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
  getReservations,
  createReservation,
  cancelReservation,
  getTables,
  getMyLoyalty,
  getRewards,
  redeemReward,
  apiCall,
};