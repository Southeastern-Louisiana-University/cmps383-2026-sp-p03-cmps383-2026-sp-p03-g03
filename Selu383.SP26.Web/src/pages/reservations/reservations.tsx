import { useEffect, useState, useMemo } from "react";
import { Tokens } from "../../styles/tokens";
import { Ic } from "../../components/icons";
import { ImageWithFallback } from "../../components/image-with-fallback";
import { requestApi } from "../../api/context-providers/app-context";
import type { LocationDto } from "../../api/dto-interfaces";
import "./reservations.css";

interface TableDto {
  id: number;
  locationId: number;
  tableNumber: string;
  seats: number;
  isBarSeat: boolean;
  isActive: boolean;
}

interface ReservationResult {
  id: number;
  locationId: number;
  tableId: number;
  reservedFor: string;
  partySize: number;
  status: string;
  specialRequests?: string;
}

interface CoverChargeInfo {
  message: string;
  coverChargeAmount: number;
  coverChargeOrderId: number;
  checkoutUrl: string | null;
}

export function ReservationPage() {
  const [res, setRes] = useState({
    date: "",
    time: "08:00",
    party: 2,
    specialRequests: "",
  });
  const [locationId, setLocationId] = useState<number | null>(null);
  const [tableId, setTableId] = useState<number | null>(null);
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [tables, setTables] = useState<TableDto[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<ReservationResult | null>(null);
  const [coverCharge, setCoverCharge] = useState<CoverChargeInfo | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    requestApi("/api/locations", { method: "GET" })
      .then(({ response, payload }) => {
        if (response.ok) {
          const data = payload as LocationDto[];
          setLocations(data);
          if (data.length > 0) setLocationId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (locationId == null) return;
    setTablesLoading(true);
    setTableId(null);
    requestApi(`/api/tables/location/${locationId}`, { method: "GET" })
      .then(({ response, payload }) => {
        if (response.ok) {
          const all = payload as TableDto[];
          setTables(all.filter((t) => !t.isBarSeat && t.isActive));
        }
      })
      .catch(() => {})
      .finally(() => setTablesLoading(false));
  }, [locationId]);

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (!res.date) {
      errors.push("Please select a date.");
    } else {
      const chosen = new Date(`${res.date}T${res.time}`);
      const cutoff = new Date(Date.now() + 2 * 60 * 60 * 1000);
      if (chosen < cutoff) {
        errors.push("Reservation must be at least 2 hours from now.");
      }
      if (res.time) {
        const [h] = res.time.split(":").map(Number);
        const m = Number(res.time.split(":")[1]);
        if (h < 6 || h > 16 || (h === 16 && m > 0)) {
          errors.push(
            "Pick a time between 6:00 AM and 4:00 PM so your 2-hour booking ends by closing.",
          );
        }
      }
    }
    if (res.party < 2 || res.party > 6) {
      errors.push("Party size must be between 2 and 6.");
    }
    if (tableId == null) {
      errors.push("Please select a table.");
    }
    return errors;
  }, [res.date, res.time, res.party, tableId]);

  const canSubmit = validation.length === 0 && locationId != null && !busy;

  const handleConfirm = async () => {
    if (!canSubmit || locationId == null || tableId == null) return;
    setError("");
    setCoverCharge(null);
    setBusy(true);

    try {
      const { response, payload } = await requestApi("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId,
          tableId,
          reservedFor: new Date(`${res.date}T${res.time}:00`).toISOString(),
          partySize: res.party,
          specialRequests: res.specialRequests.trim() || null,
        }),
      });

      if (response.status === 201) {
        setConfirmed(payload as ReservationResult);
      } else if (response.status === 402) {
        setCoverCharge(payload as CoverChargeInfo);
      } else {
        const body = payload as Record<string, unknown> | string;
        if (typeof body === "string" && body.trim()) {
          setError(body);
        } else if (
          body &&
          typeof body === "object" &&
          typeof body.message === "string"
        ) {
          setError(body.message);
        } else {
          setError("We couldn't book that. Please try again.");
        }
      }
    } catch {
      setError("We couldn't book that. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="reservation-page">
      <section className="res-hero">
        <ImageWithFallback
          src={Tokens.dineImg}
          alt="Restaurant interior"
          className="res-hero-image"
        />
        <div className="res-hero-overlay" />
        <div className="noise-overlay" />
        <div className="res-hero-content">
          <p className="res-hero-kicker">Reservations</p>
          <h1 className="res-hero-title">Reserve your table</h1>
          <p className="res-hero-subtitle">
            Book a seat at least 2 hours in advance. Bar seats are walk-in only.
          </p>
        </div>
      </section>

      {confirmed ? (
        <div className="res-success">
          <div className="res-success-icon-wrap">
            <Ic name="check" size={36} color={Tokens.green} />
          </div>
          <h2 className="res-success-title">You're all set</h2>
          <p className="res-success-party">
            Party of {confirmed.partySize} confirmed
          </p>
          <p className="res-success-detail">
            Reservation #{confirmed.id} &mdash;{" "}
            {new Date(confirmed.reservedFor).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            at{" "}
            {new Date(confirmed.reservedFor).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          <p className="res-success-copy">
            We'll have your table ready. See you soon!
          </p>
          <button
            onClick={() => {
              setConfirmed(null);
              setRes({ date: "", time: "08:00", party: 2, specialRequests: "" });
              setTableId(null);
              setCoverCharge(null);
              setError("");
            }}
            className="btn-outline focus-ring btn-outline-base"
          >
            Book Another Table
          </button>
        </div>
      ) : (
        <div className="res-grid">
          <div className="card-base res-form-card">
            <div className="res-cover-info">
              <Ic name="gift" size={14} color={Tokens.caramel} />
              <span>
                A $5.00 cover charge applies. Your cover is waived if your order
                total is over $10 on arrival.
              </span>
            </div>

            <div className="res-form-grid">
              <div className="res-col-full">
                <label className="label-base">Location</label>
                <select
                  value={locationId ?? ""}
                  onChange={(e) => setLocationId(Number(e.target.value))}
                  className="select-base"
                >
                  {locations.length === 0 ? (
                    <option>Loading...</option>
                  ) : (
                    locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="res-col-full">
                <label className="label-base">Table</label>
                {tablesLoading ? (
                  <p className="res-tables-status">Loading tables...</p>
                ) : tables.length === 0 ? (
                  <p className="res-tables-status">
                    No reservable tables at this location.
                  </p>
                ) : (
                  <div className="res-table-grid">
                    {tables.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTableId(t.id)}
                        className={`focus-ring res-table-btn ${tableId === t.id ? "res-table-btn-active" : "res-table-btn-inactive"}`}
                      >
                        <span className="res-table-num">
                          Table #{t.tableNumber}
                        </span>
                        <span className="res-table-seats">
                          {t.seats} seats
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="label-base">Date</label>
                <input
                  type="date"
                  value={res.date}
                  onChange={(e) => setRes({ ...res, date: e.target.value })}
                  className="input-base"
                />
              </div>
              <div>
                <label className="label-base">Time</label>
                <select
                  value={res.time}
                  onChange={(e) => setRes({ ...res, time: e.target.value })}
                  className="select-base"
                >
                  {Array.from({ length: 25 }, (_, i) => {
                    const h = Math.floor(i / 2) + 6,
                      m = i % 2 === 0 ? "00" : "30";
                    if (h > 16 || (h === 16 && m === "30")) return null;
                    return (
                      <option
                        key={i}
                        value={`${String(h).padStart(2, "0")}:${m}`}
                      >{`${h > 12 ? h - 12 : h}:${m} ${h >= 12 ? "PM" : "AM"}`}</option>
                    );
                  })}
                </select>
              </div>

              <div className="res-col-full">
                <label className="label-base">Party Size</label>
                <div className="res-party-grid">
                  {[2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRes({ ...res, party: n })}
                      className={`cl-focus-ring res-party-btn ${res.party === n ? "res-party-btn-active" : "res-party-btn-inactive"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="res-col-full">
                <label className="label-base">Special Requests</label>
                <textarea
                  value={res.specialRequests}
                  onChange={(e) =>
                    setRes({ ...res, specialRequests: e.target.value })
                  }
                  placeholder="Dietary restrictions, high chair needed, birthday..."
                  className="input-base res-special-input"
                />
              </div>
            </div>

            {res.date && validation.length > 0 && (
              <div className="res-validation">
                {validation.map((msg) => (
                  <p key={msg} className="res-validation-msg">
                    {msg}
                  </p>
                ))}
              </div>
            )}

            {error && <p className="res-error">{error}</p>}

            {coverCharge && (
              <div className="res-cover-notice">
                <p className="res-cover-notice-text">
                  A ${coverCharge.coverChargeAmount.toFixed(2)} cover charge is
                  required to hold this table. Pay now to confirm your
                  reservation.
                </p>
                <div className="res-cover-notice-actions">
                  <button
                    onClick={() => {
                      if (coverCharge.checkoutUrl) {
                        window.location.href = coverCharge.checkoutUrl;
                      } else {
                        setError(
                          "Stripe is temporarily unavailable. Please try again later.",
                        );
                        setCoverCharge(null);
                      }
                    }}
                    className="btn-primary focus-ring btn-primary-base"
                  >
                    Pay ${coverCharge.coverChargeAmount.toFixed(2)} now
                  </button>
                  <button
                    onClick={() => setCoverCharge(null)}
                    className="btn-outline focus-ring btn-outline-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={!canSubmit}
              className="btn-primary focus-ring btn-primary-base res-confirm-btn"
              style={{ opacity: canSubmit ? 1 : 0.5 }}
            >
              {busy ? "Booking..." : "Confirm Reservation"}
            </button>
          </div>

          <div>
            <div className="card-base res-info-card">
              <h4 className="res-side-title">Good to Know</h4>
              {[
                { i: "clock", t: "Book 2+ hours ahead" },
                { i: "clock", t: "Tables held for 2 hours" },
                { i: "user", t: "Parties of 2\u20136 guests" },
                { i: "calendar", t: "Open Mon\u2013Sat 6am\u20136pm" },
              ].map((item) => (
                <div key={item.t} className="res-tip-row">
                  <div className="res-tip-icon-wrap">
                    <Ic name={item.i} size={16} color={Tokens.green} />
                  </div>
                  <span className="res-tip-text">{item.t}</span>
                </div>
              ))}
            </div>

            <div className="card-base res-walkin-card">
              <p className="res-walkin-title">Walk-ins welcome</p>
              <p className="res-walkin-copy">
                Bar seating and patio seats are first-come, first-served — no
                reservation needed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
