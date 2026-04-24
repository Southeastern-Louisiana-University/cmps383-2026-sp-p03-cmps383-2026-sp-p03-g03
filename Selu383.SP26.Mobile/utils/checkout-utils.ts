export const SALES_TAX_RATE = 0.0875;
export const RESERVATION_MIN_ADVANCE_HOURS = 2;
const MS_PER_HOUR = 60 * 60 * 1000;

export interface PricedCartItem {
  price: number;
  quantity: number;
}

export function calculateCartTotals(items: PricedCartItem[], taxRate = SALES_TAX_RATE) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return { subtotal, tax, total };
}

export function buildReservationDateTime(date: Date, hour: number) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hour,
    0,
    0,
  );
}

export function isReservationTooSoon(reservedFor: Date, minimumAdvanceHours = RESERVATION_MIN_ADVANCE_HOURS) {
  return reservedFor.getTime() - Date.now() < minimumAdvanceHours * MS_PER_HOUR;
}

export interface RetryReservationCreateOptions {
  createReservation: () => Promise<unknown>;
  isPendingError: (error: unknown) => boolean;
  maxAttempts?: number;
  retryDelayMs?: number;
  onBeforeAttempt?: (attempt: number) => Promise<void> | void;
}

export async function retryReservationCreateAfterPayment(options: RetryReservationCreateOptions) {
  const {
    createReservation,
    isPendingError,
    maxAttempts = 3,
    retryDelayMs = 0,
    onBeforeAttempt,
  } = options;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (onBeforeAttempt) {
      await onBeforeAttempt(attempt);
    }

    try {
      await createReservation();
      return true;
    } catch (error) {
      if (!isPendingError(error)) {
        throw error;
      }

      if (attempt < maxAttempts - 1 && retryDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  return false;
}

export interface ReservationCreatePayloadInput {
  locationId: number;
  tableId: number;
  reservedForIso: string;
  partySize: number;
  coverChargeOrderId?: number;
  specialRequests?: string;
}

export function buildReservationCreatePayload(input: ReservationCreatePayloadInput) {
  const {
    locationId,
    tableId,
    reservedForIso,
    partySize,
    coverChargeOrderId,
    specialRequests,
  } = input;

  return {
    locationId,
    tableId,
    reservedFor: reservedForIso,
    partySize,
    coverChargeOrderId,
    specialRequests: specialRequests?.trim() || undefined,
  };
}

export async function resolveCoverChargeCheckoutUrl(
  coverChargeOrderId: number | undefined,
  checkoutUrl: string | null | undefined,
  createCheckoutSession: (orderId: number) => Promise<string>,
) {
  if (checkoutUrl) {
    return checkoutUrl;
  }

  if (!coverChargeOrderId) {
    return null;
  }

  try {
    return await createCheckoutSession(coverChargeOrderId);
  } catch {
    return null;
  }
}