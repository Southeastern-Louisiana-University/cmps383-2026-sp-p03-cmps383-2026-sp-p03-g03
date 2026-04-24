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
  locationIds?: number[];
  isSeasonal: boolean;
  isActive: boolean;
}

export interface LocationMenuCategoryDto {
  id: number;
  name: string;
  locationIds?: number[];
  isSeasonal: boolean;
  isActive: boolean;
  items: MenuItemDto[];
}

export interface MenuItemAvailabilityDto {
  menuItemId: number;
  categoryId: number;
  name: string;
  basePrice: number;
  locationId: number;
  isAvailable: boolean;
  unavailableReason?: string;
  isOverridden: boolean;
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
  layoutJson?: string;
  isActive: boolean;
  tableCount?: number;
  managerId?: number;
  managerDisplayName?: string;
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
  cardNumber?: string;
  cvc?: string;
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
  createdAt?: string;
  partySize: number;
  status: string;
  specialRequests?: string;
}

export interface ReservationAvailabilityDto {
  locationId: number;
  reservedFor: string;
  takenTableIds: number[];
}

export interface CreateReservationDto {
  locationId: number;
  tableId: number;
  reservedFor: string;
  partySize: number;
  coverChargeOrderId?: number;
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