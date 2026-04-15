import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../api/context-providers/app-context";
import { Ic } from "../../components/icons";
import { Dialog } from "../../components/dialog";
import {
  listStaffOrders,
  advanceOrder,
  cancelOrder,
  listOrderPayments,
  refundOrderPayment,
  type StaffOrder,
} from "../../api/staff";
import { requestApi } from "../../api/context-providers/app-context";
import "./staff-dashboard.css";

type Tab = "active" | "ready" | "completed";

const ACTIVE_STATUSES = ["Placed", "Confirmed", "Preparing"];

const ORDER_TYPE_ICONS: Record<string, string> = {
  Pickup: "cart",
  DineIn: "menu",
  InStore: "home",
  DriveThru: "cart",
  CoverCharge: "creditcard",
};

function nextLabel(status: string): string {
  switch (status) {
    case "Placed":
      return "Confirm";
    case "Confirmed":
      return "Start Prep";
    case "Preparing":
      return "Mark Ready";
    case "Ready":
      return "Complete";
    default:
      return "Advance";
  }
}

function payPillClass(ps: string): string {
  switch (ps) {
    case "Paid":
      return "staff-pay-pill staff-pay-pill-paid";
    case "Pending":
      return "staff-pay-pill staff-pay-pill-pending";
    case "Refunded":
    case "Removed":
      return "staff-pay-pill staff-pay-pill-refunded";
    default:
      return "staff-pay-pill staff-pay-pill-unpaid";
  }
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

interface Location {
  id: number;
  name: string;
}

export function StaffDashboard({ embedded = false }: { embedded?: boolean } = {}) {
  const { user } = useAppContext();
  const [tab, setTab] = useState<Tab>("active");
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState<StaffOrder | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>();

  const isAdmin = user.roles.includes("Admin");
  const isManagerOrAdmin =
    user.roles.includes("Manager") || user.roles.includes("Admin");
  const primaryRole = user.roles.includes("Admin")
    ? "Admin"
    : user.roles.includes("Manager")
      ? "Manager"
      : "Staff";

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    (async () => {
      try {
        const { response, payload } = await requestApi("/api/locations", {
          method: "GET",
        });
        if (response.ok && !cancelled) {
          setLocations(payload as Location[]);
        }
      } catch {
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const fetchOrders = useCallback(async () => {
    setError("");
    try {
      let fetched: StaffOrder[];
      if (tab === "active") {
        const batches = await Promise.all(
          ACTIVE_STATUSES.map((s) =>
            listStaffOrders({
              status: s,
              locationId: selectedLocationId,
            }),
          ),
        );
        fetched = batches.flat();
      } else if (tab === "ready") {
        fetched = await listStaffOrders({
          status: "Ready",
          locationId: selectedLocationId,
        });
      } else {
        fetched = await listStaffOrders({
          status: "Completed",
          locationId: selectedLocationId,
        });
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        fetched = fetched.filter(
          (o) => new Date(o.orderTime) >= todayStart,
        );
      }
      fetched.sort(
        (a, b) =>
          new Date(a.orderTime).getTime() - new Date(b.orderTime).getTime(),
      );
      setOrders(fetched);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [tab, selectedLocationId]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();

    if (cancelTarget) return;

    const id = setInterval(fetchOrders, 20_000);
    return () => clearInterval(id);
  }, [fetchOrders, cancelTarget]);

  const handleAdvance = async (order: StaffOrder) => {
    try {
      await advanceOrder(order.id);
      await fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to advance order");
    }
  };

  const handleTabChange = (t: Tab) => {
    if (t === tab) return;
    setTab(t);
    setOrders([]);
    setLoading(true);
  };

  const activeCount = tab === "active" ? orders.length : null;

  return (
    <div className="staff-page">
      {!embedded && (
        <div className="staff-header">
          <p className="staff-kicker">{primaryRole} Dashboard</p>
          <h1 className="staff-title">Staff Dashboard</h1>
          <p className="staff-subtitle">
            Signed in as {user.name} &middot; {primaryRole}
          </p>
        </div>
      )}

      {isAdmin && locations.length > 0 && (
        <div className="staff-location-filter">
          <label className="label-base">Location</label>
          <select
            className="select-base"
            value={selectedLocationId ?? ""}
            onChange={(e) =>
              setSelectedLocationId(
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          >
            <option value="">All locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="staff-tabs">
        {(
          [
            { key: "active" as Tab, label: "Active Orders" },
            { key: "ready" as Tab, label: "Ready Pickup" },
            { key: "completed" as Tab, label: "Completed Today" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            className={`staff-tab ${tab === t.key ? "staff-tab-active" : "staff-tab-inactive"}`}
            onClick={() => handleTabChange(t.key)}
          >
            {t.label}
            {tab === t.key && activeCount !== null && activeCount > 0 && (
              <span className="staff-tab-badge">{activeCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="staff-loading">
          <span className="staff-spinner" />
          <p className="staff-loading-text">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="card-base staff-error-card">
          <p className="staff-error-text">{error}</p>
          <button
            className="staff-error-retry"
            onClick={() => {
              setLoading(true);
              setError("");
              fetchOrders();
            }}
          >
            Try again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="staff-empty">
          <p className="staff-empty-title">No orders</p>
          <p className="staff-empty-copy">
            {tab === "active"
              ? "No active orders right now."
              : tab === "ready"
                ? "No orders ready for pickup."
                : "No completed orders today."}
          </p>
        </div>
      ) : (
        <div className="staff-orders-list">
          {orders.map((o) => (
            <div key={o.id} className="card-base staff-order-card">
              <div className="staff-order-info">
                <p className="staff-order-code">{o.orderCode}</p>
                <p className="staff-order-type">
                  <Ic
                    name={ORDER_TYPE_ICONS[o.orderType] ?? "cart"}
                    size={14}
                  />
                  {o.orderType}
                </p>
                <div className="staff-order-meta">
                  <span className="staff-order-meta-item">
                    <Ic name="clock" size={13} />
                    {fmtTime(o.orderTime)}
                  </span>
                  <span className="staff-order-meta-item">
                    <Ic name="user" size={13} />
                    {o.pickupName || `Customer #${o.createdByUserId}`}
                  </span>
                  <span className="staff-order-meta-item">
                    {o.itemCount} item{o.itemCount !== 1 ? "s" : ""}
                  </span>
                  <span className={payPillClass(o.paymentStatus)}>
                    {o.paymentStatus}
                  </span>
                </div>
              </div>
              <span className="staff-order-total">{fmtMoney(o.total)}</span>
              <div className="staff-order-actions">
                {o.status !== "Completed" && o.status !== "Cancelled" && (
                  <button
                    className="staff-btn-advance"
                    onClick={() => handleAdvance(o)}
                  >
                    {nextLabel(o.status)}
                  </button>
                )}
                {o.status !== "Completed" && o.status !== "Cancelled" && (
                  <button
                    className="staff-btn-cancel"
                    onClick={() => setCancelTarget(o)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {cancelTarget && (
        <CancelOrderDialog
          order={cancelTarget}
          isManagerOrAdmin={isManagerOrAdmin}
          onClose={() => setCancelTarget(null)}
          onDone={() => {
            setCancelTarget(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}

function CancelOrderDialog({
  order,
  isManagerOrAdmin,
  onClose,
  onDone,
}: {
  order: StaffOrder;
  isManagerOrAdmin: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [refund, setRefund] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const showRefund = isManagerOrAdmin && order.paymentStatus === "Paid";

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setBusy(true);
    setDialogError("");
    try {
      await cancelOrder(order.id, reason.trim());

      if (showRefund && refund) {
        const payments = await listOrderPayments(order.id);
        const paid = payments
          .filter((p) => p.status === "Paid")
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          )[0];

        if (paid) {
          await refundOrderPayment(
            order.id,
            paid.id,
            `Cancelled: ${reason.trim()}`,
          );
        } else {
          setDialogError(
            "No paid payment found to refund — order cancelled but not refunded.",
          );
          setBusy(false);
          return;
        }
      }

      onDone();
    } catch (err) {
      setDialogError(
        err instanceof Error ? err.message : "Something went wrong",
      );
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <div className="staff-cancel-body">
        <h3 className="staff-cancel-header">Cancel Order</h3>
        <p className="staff-cancel-sub">
          Order <strong>{order.orderCode}</strong> &middot;{" "}
          {fmtMoney(order.total)}
        </p>

        <label className="label-base">Reason</label>
        <textarea
          className="staff-cancel-textarea"
          placeholder="Why is this order being cancelled?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        {showRefund && (
          <label className="staff-cancel-refund-row">
            <input
              type="checkbox"
              checked={refund}
              onChange={(e) => setRefund(e.target.checked)}
            />
            Also refund the customer for this order ({fmtMoney(order.total)})
          </label>
        )}

        {!isManagerOrAdmin && (
          <p className="staff-cancel-hint">
            Refunds must be issued by a manager.
          </p>
        )}

        {dialogError && (
          <div className="staff-cancel-error">{dialogError}</div>
        )}

        <div className="staff-cancel-actions">
          <button
            className="btn-outline-base btn-outline focus-ring"
            onClick={onClose}
            disabled={busy}
          >
            Keep order
          </button>
          <button
            className="btn-primary-base btn-primary focus-ring"
            onClick={handleSubmit}
            disabled={busy || !reason.trim()}
          >
            {busy ? "Cancelling..." : "Cancel order"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
