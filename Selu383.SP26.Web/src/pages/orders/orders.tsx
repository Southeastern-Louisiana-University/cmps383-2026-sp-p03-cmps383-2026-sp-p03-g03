import { useMemo } from "react";
import { useAppContext } from "../../components/app-context";
import { Ic } from "../../components/icons";
import { useMyOrders } from "../../services/orders.ts";

function formatOrderDate(isoDate: string) {
  const asDate = new Date(isoDate);
  if (Number.isNaN(asDate.getTime())) {
    return "Unknown date";
  }

  return asDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function OrdersPage() {
  const { setTab } = useAppContext();
  const { orders, loading, unauthorized, error } = useMyOrders();

  const orderCards = useMemo(
    () =>
      orders.map((order) => ({
        ...order,
        itemsText: order.items
          .map((item) => `${item.quantity}x ${item.name}`)
          .join(", "),
      })),
    [orders],
  );

  return (
    <div className="profile-page">
      <section className="cart-header">
        <p className="cart-kicker">Your Orders</p>
        <h1 className="cart-title">Order History</h1>
      </section>

      {loading ? (
        <div className="card-base" style={{ padding: 24 }}>
          Loading your orders...
        </div>
      ) : unauthorized ? (
        <div className="card-base" style={{ padding: 24 }}>
          <p className="profile-block-copy" style={{ marginBottom: 14 }}>
            Please sign in to view your order history.
          </p>
          <button
            onClick={() => setTab("auth")}
            className="btn-primary focus-ring btn-primary-base"
          >
            Sign In
          </button>
        </div>
      ) : error ? (
        <div className="card-base" style={{ padding: 24 }}>
          {error}
        </div>
      ) : orderCards.length === 0 ? (
        <div className="cart-empty-state">
          <h2 className="cart-empty-title">No orders yet</h2>
          <p className="cart-empty-copy">
            Start with the menu and your orders will appear here.
          </p>
          <button
            onClick={() => setTab("order")}
            className="btn-primary focus-ring btn-primary-base"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="profile-order-list">
          {orderCards.map((order) => (
            <div
              key={order.id}
              className="card-base card-hover profile-order-card"
            >
              <div className="profile-order-icon-wrap">
                <Ic name="menu" size={22} color="#65a30d" />
              </div>

              <div className="profile-flex-1">
                <div className="profile-order-head">
                  <h4 className="profile-order-id">{order.orderCode}</h4>
                  <span className="profile-order-date">
                    {formatOrderDate(order.orderTime)}
                  </span>
                </div>
                <p className="profile-order-items">{order.itemsText}</p>
                <p className="profile-order-date" style={{ marginTop: 6 }}>
                  {order.orderType} • {order.paymentStatus}
                </p>
                {order.receiptUrl && (
                  <a
                    href={order.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="profile-order-date"
                    style={{ marginTop: 6, display: "inline-block" }}
                  >
                    View Receipt
                  </a>
                )}
              </div>

              <div className="profile-order-right">
                <p className="profile-order-total">${order.total.toFixed(2)}</p>
                <span className="profile-order-status">{order.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
