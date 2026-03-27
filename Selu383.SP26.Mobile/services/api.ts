const DEFAULT_API_BASE_URL = "https://selu383-sp26-p03-g03.azurewebsites.net/";
const TIMEOUT = 30000; // 30 seconds

const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  return DEFAULT_API_BASE_URL;
};

const API_BASE_URL = getApiBaseUrl();

export interface MenuItemDto {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  basePrice: number;
  isAvailable: boolean;
}

export interface MenuCategoryDto {
  id: number;
  locationIds?: number[];
  name: string;
  isSeasonal: boolean;
  isActive: boolean;
}

export interface OrderItemDto {
  id: number;
  menuItemId: number;
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
  total: number;
  note?: string;
  pickupName?: string;
  items: OrderItemDto[];
}

export interface LocationDto {
  id: number;
  name: string;
  type: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  openingTime?: string;
  closingTime?: string;
  isActive: boolean;
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
  items: CreateOrderItemDto[];
}

const apiCall = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any,
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (data && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(data);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT);

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        credentials: "include", // Include cookies with all requests
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 401) {
      throw new Error("Unauthorized - please login again");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get("content-type");
    if (response.status === 204 || !contentType?.includes("application/json")) {
      return null;
    }

    return await response.json();
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(`Request timed out after ${TIMEOUT / 1000} seconds`);
    }
    throw new Error(error.message || "Network request failed");
  }
};

export const login = async (
  username: string,
  password: string,
): Promise<any> => {
  try {
    console.log(
      "API: Attempting login to:",
      API_BASE_URL + "/api/authentication/login",
    );
    const response = await apiCall("/api/authentication/login", "POST", {
      UserName: username,
      Password: password,
    });

    console.log("API: Login successful, response:", response);

    return response;
  } catch (error: any) {
    console.log("API: Login error:", error.message);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<any> => {
  return apiCall("/api/authentication/me", "GET");
};

export const logout = async (): Promise<void> => {
  try {
    console.log("API: Starting logout...");
    const response = await fetch(`${API_BASE_URL}/api/authentication/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("API: Logout response status:", response.status);

    if (!response.ok) {
      throw new Error(`Logout failed: ${response.status}`);
    }

    console.log("API: Logout successful");
  } catch (error: any) {
    console.log("API: Logout error:", error.message);
  }
};

export const getMenuItems = async (): Promise<MenuItemDto[]> => {
  try {
    console.log(
      "API: Fetching menu items from:",
      `${API_BASE_URL}/api/menu/items`,
    );
    const response = await apiCall("/api/menu/items", "GET");
    console.log("API: Menu items fetched:", response);
    return response;
  } catch (error: any) {
    console.log("API: Failed to fetch menu items:", error.message);
    throw error;
  }
};

export const getMenuCategories = async (): Promise<MenuCategoryDto[]> => {
  try {
    console.log(
      "API: Fetching menu categories from:",
      `${API_BASE_URL}/api/menu/categories`,
    );
    const response = await apiCall("/api/menu/categories", "GET");
    console.log("API: Menu categories fetched:", response);
    return response;
  } catch (error: any) {
    console.log("API: Failed to fetch menu categories:", error.message);
    throw error;
  }
};

export const getMyOrders = async (): Promise<OrderDto[]> => {
  try {
    console.log(
      "API: Fetching user orders from:",
      `${API_BASE_URL}/api/orders/my-orders`,
    );
    const response = await apiCall("/api/orders/my-orders", "GET");
    console.log("API: User orders fetched:", response);
    return response;
  } catch (error: any) {
    console.log("API: Failed to fetch user orders:", error.message);
    throw error;
  }
};

export const getReceiptPdfUrl = (orderId: number): string => {
  return `${API_BASE_URL}/api/orders/${orderId}/receiptpdf`;
};

export const getLocations = async (): Promise<LocationDto[]> => {
  try {
    console.log(
      "API: Fetching locations from:",
      `${API_BASE_URL}/api/locations`,
    );
    const response = await apiCall("/api/locations", "GET");
    console.log("API: Locations fetched:", response);
    return response;
  } catch (error: any) {
    console.log("API: Failed to fetch locations:", error.message);
    throw error;
  }
};

export const createOrder = async (
  orderData: CreateOrderDto,
): Promise<OrderDto> => {
  try {
    console.log("API: Creating order:", orderData);
    const response = await apiCall("/api/orders", "POST", orderData);
    console.log("API: Order created:", response);
    return response;
  } catch (error: any) {
    console.log("API: Failed to create order:", error.message);
    throw error;
  }
};

export const createStripeCheckoutSession = async (
  orderId: number,
): Promise<string> => {
  try {
    console.log("API: Creating Stripe checkout session for order:", orderId);
    const response = await apiCall(
      "/api/payments/create-checkout-session",
      "POST",
      {
        orderId,
      },
    );
    console.log("API: Stripe checkout session created:", response);
    return response.checkoutUrl;
  } catch (error: any) {
    console.log("API: Failed to create Stripe session:", error.message);
    throw error;
  }
};

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

export interface TableDto {
  id: number;
  locationId: number;
  tableNumber: number;
  seats: number;
  isBarSeat: boolean;
  isActive: boolean;
}

export const getReservations = async (): Promise<ReservationDto[]> => {
  try {
    console.log(
      "API: Fetching reservations from:",
      `${API_BASE_URL}/api/reservations`,
    );
    const response = await apiCall("/api/reservations", "GET");
    console.log("API: Reservations fetched:", response);
    return response;
  } catch (error: any) {
    console.log("API: Failed to fetch reservations:", error.message);
    throw error;
  }
};

export const createReservation = async (
  reservationData: Omit<ReservationDto, "id" | "status">,
): Promise<ReservationDto> => {
  try {
    console.log("API: Creating reservation:", reservationData);
    const response = await apiCall(
      "/api/reservations",
      "POST",
      reservationData,
    );
    console.log("API: Reservation created:", response);
    return response;
  } catch (error: any) {
    console.log("API: Failed to create reservation:", error.message);
    throw error;
  }
};

export const getTables = async (): Promise<TableDto[]> => {
  try {
    const response = await apiCall("/api/tables", "GET");
    return response;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch tables");
  }
};

export const cancelReservation = async (
  reservationId: number,
): Promise<any> => {
  try {
    console.log("API: Cancelling reservation:", reservationId);
    const response = await apiCall(
      `/api/reservations/${reservationId}`,
      "DELETE",
    );
    console.log("API: Reservation cancelled:", response);
    return response;
  } catch (error: any) {
    console.log("API: Failed to cancel reservation:", error.message);
    throw error;
  }
};

export default {
  login,
  getCurrentUser,
  logout,
  getMenuItems,
  getMenuCategories,
  getMyOrders,
  getLocations,
  createOrder,
  createStripeCheckoutSession,
  getReservations,
  createReservation,
  cancelReservation,
  getTables,
  apiCall,
};
