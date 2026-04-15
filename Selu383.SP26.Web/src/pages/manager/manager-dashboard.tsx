import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../api/context-providers/app-context";
import { requestApi } from "../../api/context-providers/app-context";
import { Dialog } from "../../components/dialog";
import { StaffDashboard } from "../staff/staff-dashboard";
import {
  disableMenuItem,
  enableMenuItem,
  listOrderPayments,
  refundOrderPayment,
  getDailySummary,
  type OrderPayment,
  type DailySummary,
} from "../../api/staff";
import "./manager-dashboard.css";

type MgrTab = "menu" | "refunds" | "summary";

function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface MenuItemDto {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  basePrice: number;
  isAvailable: boolean;
  unavailableReason: string | null;
}

interface MenuCategoryDto {
  id: number;
  name: string;
  isSeasonal: boolean;
  isActive: boolean;
}

interface OrderDto {
  id: number;
  createdByUserId: number;
  orderCode: string;
  orderType: string;
  status: string;
  paymentStatus: string;
  orderTime: string;
  total: number;
}

export function ManagerDashboard() {
  const { user } = useAppContext();
  const [tab, setTab] = useState<MgrTab>("menu");

  const primaryRole = user.roles.includes("Admin") ? "Admin" : "Manager";

  return (
    <div className="mgr-page">
      <div className="mgr-header">
        <p className="mgr-kicker">{primaryRole} Dashboard</p>
        <h1 className="mgr-title">Manager Dashboard</h1>
        <p className="mgr-subtitle">
          Signed in as {user.name} &middot; {primaryRole}
        </p>
      </div>

      <StaffDashboard />

      <div className="mgr-divider" />

      <div className="mgr-tabs">
        {(
          [
            { key: "menu" as MgrTab, label: "Menu Availability" },
            { key: "refunds" as MgrTab, label: "Refunds" },
            { key: "summary" as MgrTab, label: "Today's Summary" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            className={`mgr-tab ${tab === t.key ? "mgr-tab-active" : "mgr-tab-inactive"}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "menu" && <MenuAvailabilitySection />}
      {tab === "refunds" && <RefundsSection />}
      {tab === "summary" && <SummarySection />}
    </div>
  );
}

function MenuAvailabilitySection() {
  const [items, setItems] = useState<MenuItemDto[]>([]);
  const [categories, setCategories] = useState<MenuCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [disableTarget, setDisableTarget] = useState<MenuItemDto | null>(null);

  const fetchMenu = useCallback(async () => {
    setError("");
    try {
      const [itemsRes, catsRes] = await Promise.all([
        requestApi("/api/menu/items", { method: "GET" }),
        requestApi("/api/menu/categories", { method: "GET" }),
      ]);
      if (!itemsRes.response.ok || !catsRes.response.ok) {
        throw new Error("Failed to load menu data");
      }
      setItems(itemsRes.payload as MenuItemDto[]);
      setCategories(catsRes.payload as MenuCategoryDto[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleEnable = async (item: MenuItemDto) => {
    try {
      await enableMenuItem(item.id);
      await fetchMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enable item");
    }
  };

  const handleDisableDone = () => {
    setDisableTarget(null);
    fetchMenu();
  };

  if (loading) {
    return (
      <div className="mgr-loading">
        <span className="mgr-spinner" />
        <p className="mgr-loading-text">Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-base mgr-error-card">
        <p className="mgr-error-text">{error}</p>
        <button
          className="mgr-error-retry"
          onClick={() => {
            setLoading(true);
            setError("");
            fetchMenu();
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const grouped = new Map<string, MenuItemDto[]>();
  for (const item of items) {
    const catName = catMap.get(item.categoryId) ?? "Other";
    const list = grouped.get(catName) ?? [];
    list.push(item);
    grouped.set(catName, list);
  }

  return (
    <>
      <div className="mgr-section-bar">
        <h2 className="mgr-section-title">Menu Availability</h2>
        <button
          className="mgr-refresh-btn"
          onClick={() => {
            setLoading(true);
            fetchMenu();
          }}
        >
          Refresh
        </button>
      </div>

      <div className="mgr-menu-list">
        {[...grouped.entries()].map(([catName, catItems]) => (
          <div key={catName}>
            <p className="mgr-menu-group-heading">{catName}</p>
            {catItems.map((item) => (
              <div key={item.id} className="card-base mgr-menu-row">
                <div className="mgr-menu-info">
                  <p className="mgr-menu-name">{item.name}</p>
                  {!item.isAvailable && item.unavailableReason && (
                    <p className="mgr-menu-reason">
                      {item.unavailableReason}
                    </p>
                  )}
                </div>
                <span className="mgr-menu-price">
                  {fmtMoney(item.basePrice)}
                </span>
                <span
                  className={`mgr-avail-badge ${item.isAvailable ? "mgr-avail-badge-on" : "mgr-avail-badge-off"}`}
                >
                  {item.isAvailable ? "Available" : "Disabled"}
                </span>
                {item.isAvailable ? (
                  <button
                    className="mgr-toggle-btn mgr-toggle-btn-danger"
                    onClick={() => setDisableTarget(item)}
                  >
                    Disable
                  </button>
                ) : (
                  <button
                    className="mgr-toggle-btn"
                    onClick={() => handleEnable(item)}
                  >
                    Enable
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {disableTarget && (
        <DisableMenuItemDialog
          item={disableTarget}
          onClose={() => setDisableTarget(null)}
          onDone={handleDisableDone}
        />
      )}
    </>
  );
}

function DisableMenuItemDialog({
  item,
  onClose,
  onDone,
}: {
  item: MenuItemDto;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [dlgError, setDlgError] = useState("");

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setBusy(true);
    setDlgError("");
    try {
      await disableMenuItem(item.id, reason.trim());
      onDone();
    } catch (err) {
      setDlgError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <div className="mgr-disable-body">
        <h3 className="mgr-disable-header">Disable Menu Item</h3>
        <p className="mgr-disable-sub">
          <strong>{item.name}</strong> &mdash; {fmtMoney(item.basePrice)}
        </p>

        <label className="label-base">Reason</label>
        <textarea
          className="mgr-disable-textarea"
          placeholder="Why is this item being disabled?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        {dlgError && (
          <div className="mgr-refund-dialog-error">{dlgError}</div>
        )}

        <div className="mgr-disable-actions">
          <button
            className="btn-outline-base btn-outline focus-ring"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className="btn-primary-base btn-primary focus-ring"
            onClick={handleSubmit}
            disabled={busy || !reason.trim()}
          >
            {busy ? "Disabling..." : "Disable Item"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

function RefundsSection() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refundTarget, setRefundTarget] = useState<OrderDto | null>(null);

  const fetchPaidOrders = useCallback(async () => {
    setError("");
    try {
      const { response, payload } = await requestApi("/api/orders", {
        method: "GET",
      });
      if (!response.ok) throw new Error("Failed to load orders");
      const all = payload as OrderDto[];
      const paid = all
        .filter((o) => o.paymentStatus === "Paid")
        .sort(
          (a, b) =>
            new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime(),
        );
      setOrders(paid);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaidOrders();
  }, [fetchPaidOrders]);

  const handleRefundDone = () => {
    setRefundTarget(null);
    setLoading(true);
    fetchPaidOrders();
  };

  if (loading) {
    return (
      <div className="mgr-loading">
        <span className="mgr-spinner" />
        <p className="mgr-loading-text">Loading paid orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-base mgr-error-card">
        <p className="mgr-error-text">{error}</p>
        <button
          className="mgr-error-retry"
          onClick={() => {
            setLoading(true);
            setError("");
            fetchPaidOrders();
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mgr-section-bar">
        <h2 className="mgr-section-title">Refunds</h2>
        <button
          className="mgr-refresh-btn"
          onClick={() => {
            setLoading(true);
            fetchPaidOrders();
          }}
        >
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="mgr-empty">
          <p className="mgr-empty-text">No paid orders to refund.</p>
        </div>
      ) : (
        <div className="mgr-refunds-list">
          {orders.map((o) => (
            <div key={o.id} className="card-base mgr-refund-row">
              <span className="mgr-refund-code">{o.orderCode}</span>
              <div className="mgr-refund-info">
                <p className="mgr-refund-customer">
                  Customer #{o.createdByUserId}
                </p>
                <p className="mgr-refund-date">{fmtDate(o.orderTime)}</p>
              </div>
              <span className="mgr-refund-total">{fmtMoney(o.total)}</span>
              <button
                className="mgr-refund-btn"
                onClick={() => setRefundTarget(o)}
              >
                Issue Refund
              </button>
            </div>
          ))}
        </div>
      )}

      {refundTarget && (
        <RefundDialog
          order={refundTarget}
          onClose={() => setRefundTarget(null)}
          onDone={handleRefundDone}
        />
      )}
    </>
  );
}

function RefundDialog({
  order,
  onClose,
  onDone,
}: {
  order: OrderDto;
  onClose: () => void;
  onDone: () => void;
}) {
  const [payments, setPayments] = useState<OrderPayment[]>([]);
  const [loadingPay, setLoadingPay] = useState(true);
  const [selectedPayId, setSelectedPayId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [dlgError, setDlgError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listOrderPayments(order.id);
        if (cancelled) return;
        setPayments(list);
        const recent = list
          .filter((p) => p.status === "Paid")
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          )[0];
        if (recent) setSelectedPayId(recent.id);
      } catch (err) {
        if (!cancelled)
          setDlgError(
            err instanceof Error ? err.message : "Failed to load payments",
          );
      } finally {
        if (!cancelled) setLoadingPay(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [order.id]);

  const handleSubmit = async () => {
    if (!reason.trim() || selectedPayId === null) return;
    setBusy(true);
    setDlgError("");
    try {
      await refundOrderPayment(order.id, selectedPayId, reason.trim());
      onDone();
    } catch (err) {
      setDlgError(
        err instanceof Error ? err.message : "Something went wrong",
      );
      setBusy(false);
    }
  };

  const formatPaymentType = (p: OrderPayment): string => {
    const parts = [p.provider];
    if (p.paymentMethodType) {
      parts.push(p.paymentMethodType);
    }
    return parts.join(" \u00B7 ");
  };

  return (
    <Dialog open onClose={onClose} width={560}>
      <div className="mgr-refund-dialog-body">
        <h3 className="mgr-refund-dialog-header">Issue Refund</h3>
        <p className="mgr-refund-dialog-sub">
          Order <strong>{order.orderCode}</strong> &middot;{" "}
          {fmtMoney(order.total)}
        </p>

        {loadingPay ? (
          <div className="mgr-loading">
            <span className="mgr-spinner" />
            <p className="mgr-loading-text">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <p className="mgr-empty-text">No payments found for this order.</p>
        ) : (
          <>
            <label className="label-base">Select payment to refund</label>
            <div className="mgr-payment-list">
              {payments.map((p) => (
                <label
                  key={p.id}
                  className={`mgr-payment-row ${selectedPayId === p.id ? "mgr-payment-row-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayId === p.id}
                    onChange={() => setSelectedPayId(p.id)}
                  />
                  <span className="mgr-payment-details">
                    {formatPaymentType(p)}
                  </span>
                  <span className="mgr-payment-amount">
                    {fmtMoney(p.amount)}
                  </span>
                  <span
                    className={`mgr-payment-status ${p.status === "Paid" ? "mgr-payment-status-paid" : "mgr-payment-status-other"}`}
                  >
                    {p.status}
                  </span>
                </label>
              ))}
            </div>

            <label className="label-base">Reason</label>
            <textarea
              className="mgr-refund-textarea"
              placeholder="Why is this refund being issued?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </>
        )}

        {dlgError && (
          <div className="mgr-refund-dialog-error">{dlgError}</div>
        )}

        <div className="mgr-refund-dialog-actions">
          <button
            className="btn-outline-base btn-outline focus-ring"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className="btn-primary-base btn-primary focus-ring"
            onClick={handleSubmit}
            disabled={
              busy ||
              !reason.trim() ||
              selectedPayId === null ||
              loadingPay ||
              payments.length === 0
            }
          >
            {busy ? "Processing..." : "Issue Refund"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

function SummarySection() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    setError("");
    try {
      const data = await getDailySummary();
      setSummary(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load summary",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading) {
    return (
      <div className="mgr-loading">
        <span className="mgr-spinner" />
        <p className="mgr-loading-text">Loading summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-base mgr-error-card">
        <p className="mgr-error-text">{error}</p>
        <button
          className="mgr-error-retry"
          onClick={() => {
            setLoading(true);
            setError("");
            fetchSummary();
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <>
      <div className="mgr-section-bar">
        <h2 className="mgr-section-title">Today&rsquo;s Summary</h2>
        <button
          className="mgr-refresh-btn"
          onClick={() => {
            setLoading(true);
            fetchSummary();
          }}
        >
          Refresh
        </button>
      </div>

      <div className="mgr-stats-grid">
        <div className="card-base mgr-stat-card">
          <p className="mgr-stat-value">{summary.totalOrders}</p>
          <p className="mgr-stat-label">Total Orders</p>
        </div>
        <div className="card-base mgr-stat-card">
          <p className="mgr-stat-value">{summary.completedOrders}</p>
          <p className="mgr-stat-label">Completed</p>
        </div>
        <div className="card-base mgr-stat-card">
          <p className="mgr-stat-value">{summary.cancelledOrders}</p>
          <p className="mgr-stat-label">Cancelled</p>
        </div>
        <div className="card-base mgr-stat-card">
          <p className="mgr-stat-value">{summary.openOrders}</p>
          <p className="mgr-stat-label">Open</p>
        </div>
      </div>

      <div className="card-base mgr-revenue-card">
        <p className="mgr-revenue-value">{fmtMoney(summary.revenue)}</p>
        <p className="mgr-revenue-label">Revenue</p>
      </div>

      <h3 className="mgr-top-items-heading">Top 5 items today</h3>
      {summary.topItems.length === 0 ? (
        <div className="mgr-empty">
          <p className="mgr-empty-text">No items sold yet today.</p>
        </div>
      ) : (
        <ol className="mgr-top-items-list">
          {summary.topItems.slice(0, 5).map((item, i) => (
            <li key={item.menuItemName} className="mgr-top-item">
              <span className="mgr-top-item-rank">{i + 1}.</span>
              <span>{item.menuItemName}</span>
              <span className="mgr-top-item-qty">
                &times; {item.quantitySold}
              </span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
