import { useState } from "react";
import { T, MENU, card, noiseOverlay } from "../components/tokens";
import { ItemIcon } from "../components/icons";
import { useAppContext } from "../components/app-context";
import { ImageWithFallback } from "../components/ImageWithFallback";

const catImages: Record<string, string> = {
  Drinks: T.icedImg,
  "Sweet Crepes": T.crepeImg,
  "Savory Crepes": T.cafeImg,
  Bagels: T.latteImg,
};

export function MenuPage() {
  const { setSel, setQty, setNote } = useAppContext();
  const [menuCat, setMenuCat] = useState("Drinks");
  const items = MENU[menuCat];

  return (
    <div>
      <section style={{ marginBottom: 48 }}>
        <p style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: T.green, margin: "0 0 8px" }}>
          Our Menu
        </p>
        <h1 style={{ fontFamily: T.fontDisplay, fontSize: 48, fontWeight: 700, color: T.darkBrew, margin: "0 0 12px", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
          Handcrafted<br />with care
        </h1>
        <p style={{ fontFamily: T.font, fontSize: 18, color: T.mocha, margin: 0, maxWidth: 480, lineHeight: 1.6 }}>
          From bold espresso to sweet crepes, every item is made fresh to order.
        </p>
      </section>

      <div style={{ display: "flex", gap: 0, marginBottom: 48, borderBottom: `1px solid ${T.sand}` }}>
        {Object.keys(MENU).map(c => (
          <button
            key={c}
            onClick={() => setMenuCat(c)}
            className="cl-focus-ring"
            style={{
              padding: "12px 28px", border: "none", background: "none",
              fontFamily: T.font, fontWeight: menuCat === c ? 600 : 500, fontSize: 15,
              color: menuCat === c ? T.darkBrew : T.mocha,
              cursor: "pointer", position: "relative",
              transition: "color 0.2s",
              borderBottom: menuCat === c ? `2px solid ${T.green}` : "2px solid transparent",
              marginBottom: -1,
            }}
          >{c}</button>
        ))}
      </div>

      <div style={{
        borderRadius: T.rLg, overflow: "hidden", position: "relative",
        height: 200, marginBottom: 48,
      }}>
        <ImageWithFallback
          src={catImages[menuCat]} alt={menuCat}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(58,46,31,0.8) 0%, rgba(58,46,31,0.3) 60%, transparent 100%)" }} />
        <div style={noiseOverlay} />
        <div style={{ position: "absolute", bottom: 0, left: 0, padding: "36px 40px", zIndex: 1 }}>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 36, fontWeight: 700, color: T.white, margin: "0 0 4px", lineHeight: 1.1 }}>
            {menuCat}
          </h2>
          <p style={{ fontFamily: T.font, fontSize: 15, color: T.caramel, margin: 0 }}>
            {items.length} items available
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div
          onClick={() => { setSel(items[0]); setQty(1); setNote(""); }}
          className="cl-card-hover"
          style={{
            ...card(), gridColumn: "1 / -1", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 0, overflow: "hidden",
          }}
        >
          <div style={{
            width: 220, height: 180, flexShrink: 0,
            background: T.cream, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ItemIcon cat={menuCat} size={80} />
          </div>
          <div style={{ padding: "32px 36px", flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: 26, fontWeight: 700, color: T.darkBrew, margin: "0 0 4px", lineHeight: 1.2 }}>
                  {items[0].name}
                </h3>
                <span style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 600, color: T.green }}>
                  ${items[0].price.toFixed(2)}
                </span>
              </div>
              <span style={{
                background: T.cream, color: T.green,
                fontFamily: T.font, fontSize: 11, fontWeight: 600,
                letterSpacing: "1px", textTransform: "uppercase",
                padding: "6px 14px", borderRadius: 6, border: `1px solid ${T.sand}`,
              }}>Featured</span>
            </div>
            <p style={{ fontFamily: T.font, fontSize: 16, color: T.mocha, lineHeight: 1.6, margin: "12px 0 0", maxWidth: 500 }}>
              {items[0].desc}
            </p>
          </div>
        </div>

        {items.slice(1).map(item => (
          <div
            key={item.id}
            onClick={() => { setSel(item); setQty(1); setNote(""); }}
            className="cl-card-hover"
            style={{
              ...card(), cursor: "pointer", padding: "24px",
              display: "flex", gap: 16, alignItems: "flex-start",
            }}
          >
            <ItemIcon cat={menuCat} size={56} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, color: T.darkBrew, margin: 0, lineHeight: 1.2 }}>
                  {item.name}
                </h3>
                <span style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 600, color: T.darkBrew, flexShrink: 0, marginLeft: 12 }}>
                  ${item.price.toFixed(2)}
                </span>
              </div>
              <p style={{ fontFamily: T.font, fontSize: 14, color: T.mocha, lineHeight: 1.55, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
