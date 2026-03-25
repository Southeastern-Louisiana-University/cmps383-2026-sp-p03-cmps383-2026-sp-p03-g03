import { T, LOGO, noiseOverlay } from "./tokens";
import { useAppContext } from "./app-context";

export function Footer({ setTab }: { setTab: (t: string) => void }) {
  const { isLoggedIn } = useAppContext();
  return (
    <footer style={{
      background: T.darkBrew, color: T.caramel, position: "relative", overflow: "hidden",
      marginTop: 96,
    }}>
      <div style={noiseOverlay} />

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "64px 48px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 48, paddingBottom: 48, borderBottom: `1px solid rgba(196,168,130,0.15)` }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <img src={LOGO} alt="Caffeinated Lions" style={{ width: 48, height: 48, objectFit: "contain" }} />
              <span style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 700, color: T.white, lineHeight: 1.1 }}>
                Caffeinated Lions
              </span>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: T.caramel, fontFamily: T.font, margin: 0, maxWidth: 300 }}>
              Handcrafted drinks and fresh crepes, served with pride since 2019. Every cup tells a story.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              {["instagram", "twitter", "facebook"].map(s => (
                <div key={s} style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: `1px solid rgba(196,168,130,0.25)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "border-color 0.2s",
                  fontSize: 13, color: T.caramel, fontFamily: T.font, fontWeight: 500, textTransform: "capitalize",
                }}>
                  {s[0].toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontFamily: T.font, fontWeight: 600, fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: T.warmTan, margin: "0 0 20px" }}>Menu</h4>
            {[
              { l: "Drinks", k: "order" },
              { l: "Sweet Crepes", k: "order" },
              { l: "Savory Crepes", k: "order" },
              { l: "Bagels", k: "order" },
            ].map(item => (
              <button key={item.l} onClick={() => setTab(item.k)} style={{
                display: "block", background: "none", border: "none", color: T.caramel,
                fontFamily: T.font, fontSize: 15, padding: "6px 0", cursor: "pointer",
                transition: "color 0.2s", textAlign: "left",
              }}>{item.l}</button>
            ))}
          </div>

          <div>
            <h4 style={{ fontFamily: T.font, fontWeight: 600, fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: T.warmTan, margin: "0 0 20px" }}>Account</h4>
            {isLoggedIn ? (
              <>
                <button onClick={() => setTab("profile")} style={{
                  display: "block", background: "none", border: "none", color: T.caramel,
                  fontFamily: T.font, fontSize: 15, padding: "6px 0", cursor: "pointer",
                  transition: "color 0.2s", textAlign: "left",
                }}>My Profile</button>
                <button onClick={() => setTab("cart")} style={{
                  display: "block", background: "none", border: "none", color: T.caramel,
                  fontFamily: T.font, fontSize: 15, padding: "6px 0", cursor: "pointer",
                  transition: "color 0.2s", textAlign: "left",
                }}>My Orders</button>
                <p style={{ fontFamily: T.font, fontSize: 15, color: T.caramel, margin: 0, padding: "6px 0", cursor: "pointer" }}>Rewards</p>
              </>
            ) : (
              <>
                <button onClick={() => setTab("auth")} style={{
                  display: "block", background: "none", border: "none", color: T.caramel,
                  fontFamily: T.font, fontSize: 15, padding: "6px 0", cursor: "pointer",
                  transition: "color 0.2s", textAlign: "left",
                }}>Sign In</button>
                <button onClick={() => setTab("auth")} style={{
                  display: "block", background: "none", border: "none", color: T.caramel,
                  fontFamily: T.font, fontSize: 15, padding: "6px 0", cursor: "pointer",
                  transition: "color 0.2s", textAlign: "left",
                }}>Create Account</button>
              </>
            )}
          </div>

          <div>
            <h4 style={{ fontFamily: T.font, fontWeight: 600, fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: T.warmTan, margin: "0 0 20px" }}>Visit Us</h4>
            <p style={{ fontFamily: T.font, fontSize: 15, color: T.caramel, margin: "0 0 4px", lineHeight: 1.6 }}>
              123 Main Street<br />Downtown, CA 90210
            </p>
            <p style={{ fontFamily: T.font, fontSize: 15, color: T.caramel, margin: "16px 0 0", lineHeight: 1.6 }}>
              Mon–Sat: 6am – 6pm<br />Sunday: 7am – 4pm
            </p>
          </div>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "24px 0",
        }}>
          <p style={{ fontFamily: T.font, fontSize: 13, color: "rgba(196,168,130,0.5)", margin: 0 }}>
            © 2026 Caffeinated Lions Coffee Co. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy Policy", "Terms of Service"].map(l => (
              <span key={l} style={{ fontFamily: T.font, fontSize: 13, color: "rgba(196,168,130,0.5)", cursor: "pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
