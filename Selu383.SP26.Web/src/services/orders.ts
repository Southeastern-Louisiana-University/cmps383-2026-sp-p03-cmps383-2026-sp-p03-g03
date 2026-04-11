import { useEffect, useState } from "react";
import type { ApiOrderDto, OrderSummary } from "./interfaces";

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function readJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new HttpError(response.status, `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function toOrderSummary(order: ApiOrderDto): OrderSummary {
  return {
    id: order.id,
    orderCode: order.orderCode,
    orderType: order.orderType,
    status: order.status,
    paymentStatus: order.paymentStatus,
    orderTime: order.orderTime,
    total: Number(order.total),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.menuItemName,
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal),
    })),
    receiptUrl: order.receiptUrl,
  };
}

export async function fetchMyOrders(
  signal?: AbortSignal,
): Promise<OrderSummary[]> {
  const orders = await readJson<ApiOrderDto[]>("/api/orders/my-orders", signal);
  return orders.map(toOrderSummary);
}

export function useMyOrders() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setUnauthorized(false);
    setError(null);

    fetchMyOrders(controller.signal)
      .then((result) => {
        setOrders(result);
      })
      .catch((reason: unknown) => {
        if ((reason as Error).name === "AbortError") {
          return;
        }

        if (reason instanceof HttpError && reason.status === 401) {
          setUnauthorized(true);
          return;
        }

        setError("Unable to load your orders right now.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  return { orders, loading, unauthorized, error };
}
