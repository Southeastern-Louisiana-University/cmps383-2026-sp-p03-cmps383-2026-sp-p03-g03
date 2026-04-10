import { useState } from "react";
import { T, LOGO } from "../components/tokens";
import { Ic } from "../components/icons";
import { ImageWithFallback } from "../components/ImageWithFallback";

export function ReservationPage() {
  const [res, setRes] = useState({ date: "", time: "08:00", party: 2 });
  const [resOK, setResOK] = useState(false);

  return (
    <div className="cl-res-page">
      <section className="cl-res-hero">
        <ImageWithFallback
          src={T.dineImg}
          alt="Restaurant interior"
          className="cl-res-hero-image"
        />
        <div className="cl-res-hero-overlay" />
        <div className="cl-noise-overlay" />
        <div className="cl-res-hero-content">
          <p className="cl-res-hero-kicker">Reservations</p>
          <h1 className="cl-res-hero-title">Reserve your table</h1>
          <p className="cl-res-hero-subtitle">
            Book a seat at least 2 hours in advance. Bar seats are walk-in only.
          </p>
        </div>
      </section>

      {resOK ? (
        <div className="cl-res-success">
          <div className="cl-res-success-icon-wrap">
            <Ic name="check" size={36} color={T.green} />
          </div>
          <h2 className="cl-res-success-title">You're all set</h2>
          <p className="cl-res-success-party">Party of {res.party} confirmed</p>
          <p className="cl-res-success-copy">
            We'll have your table ready. See you soon!
          </p>
          <button
            onClick={() => {
              setResOK(false);
              setRes({ date: "", time: "08:00", party: 2 });
            }}
            className="cl-btn-outline cl-focus-ring cl-btn-outline-base"
          >
            Book Another Table
          </button>
        </div>
      ) : (
        <div className="cl-res-grid">
          <div className="cl-card-base cl-res-form-card">
            <div className="cl-res-form-grid">
              <div className="cl-res-col-full">
                <label className="cl-label-base">Location</label>
                <select className="cl-select-base">
                  <option>Caffeinated Lions — Downtown</option>
                  <option>Caffeinated Lions — Midtown</option>
                  <option>Caffeinated Lions — University</option>
                </select>
              </div>
              <div>
                <label className="cl-label-base">Date</label>
                <input
                  type="date"
                  value={res.date}
                  onChange={(e) => setRes({ ...res, date: e.target.value })}
                  className="cl-input-base"
                />
              </div>
              <div>
                <label className="cl-label-base">Time</label>
                <select
                  value={res.time}
                  onChange={(e) => setRes({ ...res, time: e.target.value })}
                  className="cl-select-base"
                >
                  {Array.from({ length: 25 }, (_, i) => {
                    const h = Math.floor(i / 2) + 6,
                      m = i % 2 === 0 ? "00" : "30";
                    if (h > 18 || (h === 18 && m === "30")) return null;
                    return (
                      <option
                        key={i}
                        value={`${String(h).padStart(2, "0")}:${m}`}
                      >{`${h > 12 ? h - 12 : h}:${m} ${h >= 12 ? "PM" : "AM"}`}</option>
                    );
                  })}
                </select>
              </div>
              <div className="cl-res-col-full">
                <label className="cl-label-base">Party Size</label>
                <div className="cl-res-party-grid">
                  {[2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRes({ ...res, party: n })}
                      className={`cl-focus-ring cl-res-party-btn ${res.party === n ? "cl-res-party-btn-active" : "cl-res-party-btn-inactive"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setResOK(true)}
              className="cl-btn-primary cl-focus-ring cl-btn-primary-base cl-res-confirm-btn"
            >
              Confirm Reservation
            </button>
          </div>

          <div>
            <div className="cl-card-base cl-res-info-card">
              <h4 className="cl-res-side-title">Good to Know</h4>
              {[
                { i: "clock", t: "Book 2+ hours ahead" },
                { i: "user", t: "Parties of 2–6 guests" },
                { i: "calendar", t: "Open Mon–Sat 6am–6pm" },
              ].map((item) => (
                <div key={item.t} className="cl-res-tip-row">
                  <div className="cl-res-tip-icon-wrap">
                    <Ic name={item.i} size={16} color={T.green} />
                  </div>
                  <span className="cl-res-tip-text">{item.t}</span>
                </div>
              ))}
            </div>

            <div className="cl-card-base cl-res-walkin-card">
              <img src={LOGO} alt="" className="cl-res-walkin-logo" />
              <p className="cl-res-walkin-title">Walk-ins welcome</p>
              <p className="cl-res-walkin-copy">
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
