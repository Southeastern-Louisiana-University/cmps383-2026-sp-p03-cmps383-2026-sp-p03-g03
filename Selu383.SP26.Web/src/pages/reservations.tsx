import { useState } from "react";
import { T, LOGO, card, btnP, btnO, lbl, inp, selSt, noiseOverlay } from "../components/tokens";
import { Ic } from "../components/icons";
import { ImageWithFallback } from "../components/ImageWithFallback";

export function ReservationPage() {
  const [res, setRes] = useState({ date: "", time: "08:00", party: 2 });
  const [resOK, setResOK] = useState(false);

  return (
    <div>
      <section style={{
        borderRadius: T.rLg, overflow: "hidden", position: "relative",
        height: 320, marginBottom: 64,
      }}>
        <ImageWithFallback src={T.dineImg} alt="Restaurant interior" style={{
          width: "100%", height: "100%", objectFit: "cover",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(58,46,31,0.85) 0%, rgba(58,46,31,0.5) 60%, rgba(74,124,89,0.2) 100%)" }} />
        <div style={noiseOverlay} />
        <div style={{ position: "absolute", bottom: 0, left: 0, padding: "48px 56px", zIndex: 1 }}>
          <p style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: T.caramel, margin: "0 0 12px" }}>
            Reservations
          </p>
          <h1 style={{ fontFamily: T.fontDisplay, fontSize: 48, fontWeight: 700, color: T.white, margin: "0 0 8px", lineHeight: 1.1 }}>
            Reserve your table
          </h1>
          <p style={{ fontFamily: T.font, fontSize: 16, color: "rgba(255,255,255,0.65)", margin: 0, maxWidth: 420 }}>
            Book a seat at least 2 hours in advance. Bar seats are walk-in only.
          </p>
        </div>
      </section>

      {resOK ? (
        <div style={{ textAlign: "center", padding: "80px 40px 64px" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%", margin: "0 auto 28px",
            background: T.cream, border: `1px solid ${T.sand}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Ic name="check" size={36} color={T.green} />
          </div>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 36, fontWeight: 700, margin: "0 0 12px", color: T.darkBrew }}>You're all set</h2>
          <p style={{ fontSize: 18, color: T.mocha, margin: "0 0 8px", fontFamily: T.font }}>
            Party of {res.party} confirmed
          </p>
          <p style={{ fontSize: 15, color: T.caramel, margin: "0 0 48px", fontFamily: T.font }}>
            We'll have your table ready. See you soon!
          </p>
          <button onClick={() => { setResOK(false); setRes({ date: "", time: "08:00", party: 2 }); }} className="cl-btn-outline cl-focus-ring" style={btnO}>
            Book Another Table
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 48, alignItems: "start" }}>
          <div style={{ ...card(), padding: "40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px 32px", marginBottom: 32 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Location</label>
                <select style={selSt}>
                  <option>Caffeinated Lions — Downtown</option>
                  <option>Caffeinated Lions — Midtown</option>
                  <option>Caffeinated Lions — University</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Date</label>
                <input type="date" value={res.date} onChange={e => setRes({ ...res, date: e.target.value })} style={inp} />
              </div>
              <div>
                <label style={lbl}>Time</label>
                <select value={res.time} onChange={e => setRes({ ...res, time: e.target.value })} style={selSt}>
                  {Array.from({ length: 25 }, (_, i) => {
                    const h = Math.floor(i / 2) + 6, m = i % 2 === 0 ? "00" : "30";
                    if (h > 18 || (h === 18 && m === "30")) return null;
                    return <option key={i} value={`${String(h).padStart(2, "0")}:${m}`}>{`${h > 12 ? h - 12 : h}:${m} ${h >= 12 ? "PM" : "AM"}`}</option>;
                  })}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Party Size</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[2, 3, 4, 5, 6].map(n => (
                    <button
                      key={n}
                      onClick={() => setRes({ ...res, party: n })}
                      className="cl-focus-ring"
                      style={{
                        flex: 1, padding: "14px 0", borderRadius: T.rSm,
                        border: res.party === n ? `2px solid ${T.green}` : `1px solid ${T.warmTan}`,
                        background: res.party === n ? T.cream : T.white,
                        color: res.party === n ? T.green : T.espresso,
                        fontFamily: T.font, fontWeight: 600, fontSize: 16, cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >{n}</button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setResOK(true)} className="cl-btn-primary cl-focus-ring" style={{ ...btnP, padding: "16px 48px", fontSize: 16 }}>
              Confirm Reservation
            </button>
          </div>

          <div>
            <div style={{ ...card(), padding: "28px", marginBottom: 20 }}>
              <h4 style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: T.mocha, margin: "0 0 16px" }}>
                Good to Know
              </h4>
              {[
                { i: "clock", t: "Book 2+ hours ahead" },
                { i: "user", t: "Parties of 2–6 guests" },
                { i: "calendar", t: "Open Mon–Sat 6am–6pm" },
              ].map(item => (
                <div key={item.t} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.sand}` }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: T.cream, border: `1px solid ${T.sand}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Ic name={item.i} size={16} color={T.green} />
                  </div>
                  <span style={{ fontSize: 14, color: T.espresso, fontFamily: T.font }}>{item.t}</span>
                </div>
              ))}
            </div>

            <div style={{ ...card(), padding: "28px", background: T.cream, border: `1px solid ${T.sand}` }}>
              <img src={LOGO} alt="" style={{ width: 48, height: 48, objectFit: "contain", marginBottom: 16 }} />
              <p style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: T.darkBrew, margin: "0 0 6px", lineHeight: 1.3 }}>
                Walk-ins welcome
              </p>
              <p style={{ fontFamily: T.font, fontSize: 14, color: T.mocha, margin: 0, lineHeight: 1.6 }}>
                Bar seating and patio seats are first-come, first-served — no reservation needed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
