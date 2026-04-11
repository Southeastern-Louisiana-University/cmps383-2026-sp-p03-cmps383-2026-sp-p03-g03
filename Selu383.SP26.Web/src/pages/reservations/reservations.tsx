import { useEffect, useState } from "react";
import { T, LOGO } from "../../styles/tokens";
import { Ic } from "../../components/icons";
import { ImageWithFallback } from "../../components/image-with-fallback";
import type { LocationDto } from "../../services/interfaces";

export function ReservationPage() {
  const [res, setRes] = useState({ date: "", time: "08:00", party: 2 });
  const [resOK, setResOK] = useState(false);
  const [locations, setLocations] = useState<LocationDto[]>([]);

  useEffect(() => {
    const locationApi = "../api/locations";
    fetch(locationApi)
      .then((response) => response.json() as Promise<LocationDto[]>)
      .then((data) => {
        console.log("locations", data);
        setLocations(data);
      })
      .catch((error) => {
        console.error("Error fetching locations:", error);
      });
  }, []);

  return (
    <div className="res-page">
      <section className="res-hero">
        <ImageWithFallback
          src={T.dineImg}
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

      {resOK ? (
        <div className="res-success">
          <div className="res-success-icon-wrap">
            <Ic name="check" size={36} color={T.green} />
          </div>
          <h2 className="res-success-title">You're all set</h2>
          <p className="res-success-party">Party of {res.party} confirmed</p>
          <p className="res-success-copy">
            We'll have your table ready. See you soon!
          </p>
          <button
            onClick={() => {
              setResOK(false);
              setRes({ date: "", time: "08:00", party: 2 });
            }}
            className="btn-outline focus-ring btn-outline-base"
          >
            Book Another Table
          </button>
        </div>
      ) : (
        <div className="res-grid">
          <div className="card-base res-form-card">
            <div className="res-form-grid">
              <div className="res-col-full">
                <label className="label-base">Location</label>
                <select className="select-base">
                  // This needs a loading state and error handling for the fetch
                  now.
                  {locations ? (
                    locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))
                  ) : (
                    <option>Loading...</option>
                  )}
                </select>
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
            </div>

            <button
              onClick={() => setResOK(true)}
              className="btn-primary focus-ring btn-primary-base res-confirm-btn"
            >
              Confirm Reservation
            </button>
          </div>

          <div>
            <div className="card-base res-info-card">
              <h4 className="res-side-title">Good to Know</h4>
              {[
                { i: "clock", t: "Book 2+ hours ahead" },
                { i: "user", t: "Parties of 2–6 guests" },
                { i: "calendar", t: "Open Mon–Sat 6am–6pm" },
              ].map((item) => (
                <div key={item.t} className="res-tip-row">
                  <div className="res-tip-icon-wrap">
                    <Ic name={item.i} size={16} color={T.green} />
                  </div>
                  <span className="res-tip-text">{item.t}</span>
                </div>
              ))}
            </div>

            <div className="card-base res-walkin-card">
              <img src={LOGO} alt="" className="res-walkin-logo" />
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
