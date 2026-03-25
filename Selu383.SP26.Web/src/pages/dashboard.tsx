import { T, LOGO, MENU, card, btnP, btnO, noiseOverlay, getCat } from "../components/tokens";
import { Ic } from "../components/icons";
import { LoyaltyCard } from "../components/loyalty-card";
import { useAppContext } from "../components/app-context";
import { ImageWithFallback } from "../components/ImageWithFallback";

export function DashboardPage() {
  const { user, setTab, setSel, setQty, setNote, cart, setCart } = useAppContext();

  const featured = [MENU.Drinks[2], MENU["Sweet Crepes"][1], MENU.Bagels[0]];

  return (
    <div>
      <section style={{
        position: "relative", borderRadius: T.rXl, overflow: "hidden",
        height: 480, marginBottom: 96,
      }}>
        <ImageWithFallback
          src={T.heroImg} alt="Caffeinated Lions coffee shop"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(58,46,31,0.85) 0%, rgba(58,46,31,0.5) 50%, rgba(74,124,89,0.3) 100%)" }} />
        <div style={noiseOverlay} />

        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "64px" }}>
          <p style={{
            fontFamily: T.font, fontSize: 11, fontWeight: 600, color: T.caramel,
            letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 16px",
          }}>
            Welcome back, {user.name}
          </p>
          <h1 style={{
            fontFamily: T.fontDisplay, fontSize: 56, fontWeight: 700,
            color: T.white, margin: "0 0 16px", lineHeight: 1.08, maxWidth: 580,
            letterSpacing: "-0.5px",
          }}>
            Every cup,<br />a moment worth savoring.
          </h1>
          <p style={{
            fontFamily: T.font, fontSize: 18, color: "rgba(255,255,255,0.7)",
            margin: "0 0 36px", maxWidth: 440, lineHeight: 1.6,
          }}>
            Handcrafted drinks and fresh crepes, made with love in the heart of downtown.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setTab("order")} className="cl-btn-primary cl-focus-ring" style={btnP}>
              View Our Menu
            </button>
            <button onClick={() => setTab("reserve")} className="cl-btn-outline cl-focus-ring" style={{
              ...btnO, color: T.white, borderColor: "rgba(255,255,255,0.35)",
            }}>
              Reserve a Table
            </button>
          </div>
        </div>

        <img src={LOGO} alt="" style={{
          position: "absolute", bottom: 40, right: 64, width: 120, height: 120,
          objectFit: "contain", opacity: 0.08,
        }} />
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, marginBottom: 96 }}>
        {[
          { icon: "menu", title: "Handcrafted Daily", desc: "Every drink made fresh by skilled baristas using locally roasted beans." },
          { icon: "clock", title: "Quick Pickup", desc: "Order ahead and skip the line. Your order ready when you arrive." },
          { icon: "gift", title: "Earn Rewards", desc: "Earn points on every purchase. Redeem for free drinks and crepes." },
        ].map((v, i) => (
          <div key={v.title} className="cl-fade-in" style={{ textAlign: "center", padding: "8px 16px", animationDelay: `${i * 0.1}s` }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: "0 auto 20px",
              background: T.cream, border: `1px solid ${T.sand}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Ic name={v.icon} size={24} color={T.green} />
            </div>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, margin: "0 0 8px", color: T.darkBrew, lineHeight: 1.2 }}>{v.title}</h3>
            <p style={{ fontFamily: T.font, fontSize: 15, color: T.mocha, margin: 0, lineHeight: 1.6 }}>{v.desc}</p>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: 96 }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: T.green, margin: "0 0 8px" }}>
            Popular Right Now
          </p>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 40, fontWeight: 700, color: T.darkBrew, margin: 0, lineHeight: 1.15 }}>
            What our regulars love
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 24, gridTemplateRows: "1fr 1fr" }}>
          <div
            onClick={() => { setSel(featured[0]); setQty(1); setNote(""); }}
            className="cl-card-hover cl-img-zoom"
            style={{
              ...card(), gridRow: "1 / 3", cursor: "pointer", overflow: "hidden",
              display: "flex", flexDirection: "column", position: "relative",
            }}
          >
            <div style={{ position: "relative", height: 280, overflow: "hidden", flexShrink: 0 }}>
              <ImageWithFallback src={T.icedImg} alt={featured[0].name} style={{
                width: "100%", height: "100%", objectFit: "cover",
                transition: "transform 0.4s ease",
              }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(58,46,31,0.08) 100%)" }} />
              <span style={{
                position: "absolute", top: 16, left: 16,
                background: T.green, color: T.white,
                fontFamily: T.font, fontSize: 11, fontWeight: 600,
                letterSpacing: "1px", textTransform: "uppercase",
                padding: "6px 14px", borderRadius: 6,
              }}>Staff Pick</span>
            </div>
            <div style={{ padding: "28px 28px 32px", flex: 1, display: "flex", flexDirection: "column" }}>
              <p style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: T.mocha, margin: "0 0 8px" }}>
                {getCat(featured[0].id)}
              </p>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 700, color: T.darkBrew, margin: "0 0 8px", lineHeight: 1.2 }}>
                {featured[0].name}
              </h3>
              <p style={{ fontFamily: T.font, fontSize: 15, color: T.mocha, lineHeight: 1.6, margin: "0 0 20px", flex: 1 }}>
                {featured[0].desc}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 700, color: T.darkBrew }}>${featured[0].price.toFixed(2)}</span>
                <span style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.green }}>Add to order →</span>
              </div>
            </div>
          </div>

          {featured.slice(1).map((item, i) => (
            <div
              key={item.id}
              onClick={() => { setSel(item); setQty(1); setNote(""); }}
              className="cl-card-hover"
              style={{
                ...card(), cursor: "pointer", overflow: "hidden",
                display: "flex", gap: 0,
              }}
            >
              <div style={{ width: 160, flexShrink: 0, overflow: "hidden", position: "relative" }}>
                <ImageWithFallback
                  src={i === 0 ? T.crepeImg : T.cafeImg}
                  alt={item.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 180 }}
                />
              </div>
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                <p style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: T.mocha, margin: "0 0 6px" }}>
                  {getCat(item.id)}
                </p>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, color: T.darkBrew, margin: "0 0 6px", lineHeight: 1.2 }}>
                  {item.name}
                </h3>
                <p style={{ fontFamily: T.font, fontSize: 14, color: T.mocha, lineHeight: 1.5, margin: "0 0 16px", flex: 1 }}>
                  {item.desc}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, color: T.darkBrew }}>${item.price.toFixed(2)}</span>
                  <span style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.green }}>View →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 32, marginBottom: 96 }}>
        <div>
          <div style={{
            ...card(), padding: "32px", display: "flex", alignItems: "center", gap: 24,
            marginBottom: 24,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              overflow: "hidden", flexShrink: 0,
            }}>
              <ImageWithFallback src={T.latteImg} alt="Iced Latte" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: T.mocha, margin: "0 0 4px" }}>
                Order Again
              </p>
              <h4 style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, margin: "0 0 2px", color: T.darkBrew, lineHeight: 1.2 }}>Iced Latte</h4>
              <p style={{ fontFamily: T.font, fontSize: 15, color: T.mocha, margin: 0 }}>Your most ordered drink — $5.50</p>
            </div>
            <button
              onClick={() => setCart([...cart, { ...MENU.Drinks[0], qty: 1, note: "" }])}
              className="cl-btn-primary cl-focus-ring"
              style={btnP}
            >
              Reorder
            </button>
          </div>

          <div style={{
            borderRadius: T.rLg, overflow: "hidden", position: "relative", height: 200,
          }}>
            <ImageWithFallback src={T.beansImg} alt="Fresh roasted beans" style={{
              width: "100%", height: "100%", objectFit: "cover",
            }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(58,46,31,0.8), rgba(58,46,31,0.4))" }} />
            <div style={noiseOverlay} />
            <div style={{ position: "relative", zIndex: 1, padding: "32px 36px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 700, color: T.white, margin: "0 0 4px", lineHeight: 1.2 }}>
                Freshly roasted daily
              </h3>
              <p style={{ fontFamily: T.font, fontSize: 15, color: T.caramel, margin: 0 }}>
                Single-origin beans from Guatemala, Ethiopia & Colombia
              </p>
            </div>
          </div>
        </div>

        <div>
          <LoyaltyCard user={user} />

          <div style={{ ...card(), marginTop: 24, padding: "28px 28px 20px" }}>
            <h4 style={{
              fontFamily: T.font, fontSize: 11, fontWeight: 600, letterSpacing: "1.5px",
              textTransform: "uppercase", color: T.mocha, margin: "0 0 20px",
            }}>Your Activity</h4>
            {[
              { l: "Last Order", v: "Mar 21 — Iced Latte" },
              { l: "Reservation", v: "None upcoming" },
              { l: "Points This Month", v: "+55" },
            ].map((r, i, arr) => (
              <div key={r.l} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 0",
                borderBottom: i < arr.length - 1 ? `1px solid ${T.sand}` : "none",
              }}>
                <span style={{ fontSize: 14, color: T.mocha, fontFamily: T.font }}>{r.l}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.darkBrew, fontFamily: T.font }}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
