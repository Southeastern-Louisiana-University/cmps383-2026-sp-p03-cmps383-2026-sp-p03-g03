import { T, LOGO, card, btnP, getCat } from "../components/tokens";
import { Ic, ItemIcon } from "../components/icons";
import { useAppContext } from "../components/app-context";

export function CartPage() {
  const { cart, setCart, setTab, setShowCO, total } = useAppContext();

  return (
    <div>
      <section style={{ marginBottom: 40 }}>
        <p style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: T.green, margin: "0 0 8px" }}>
          Your Order
        </p>
        <h1 style={{ fontFamily: T.fontDisplay, fontSize: 40, fontWeight: 700, color: T.darkBrew, margin: 0, lineHeight: 1.1 }}>
          Cart
        </h1>
      </section>

      {cart.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "96px 40px 80px",
          border: `1px dashed ${T.warmTan}`, borderRadius: T.rLg,
        }}>
          <img src={LOGO} alt="" style={{ width: 80, height: 80, objectFit: "contain", margin: "0 auto 24px", display: "block", opacity: 0.25 }} />
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 700, margin: "0 0 8px", color: T.darkBrew }}>Nothing here yet</h2>
          <p style={{ fontSize: 16, color: T.mocha, margin: "0 0 32px", fontFamily: T.font }}>Browse our menu and add something delicious.</p>
          <button onClick={() => setTab("order")} className="cl-btn-primary cl-focus-ring" style={btnP}>Browse Menu</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
          <div>
            {cart.map((it, idx) => (
              <div key={idx} style={{
                ...card(), padding: "24px 28px", marginBottom: 12,
                display: "flex", alignItems: "center", gap: 20,
              }}>
                <ItemIcon cat={getCat(it.id)} size={52} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, margin: "0 0 2px", color: T.darkBrew, lineHeight: 1.2 }}>{it.name}</h4>
                  {it.note && <p style={{ margin: 0, fontSize: 13, color: T.green, fontStyle: "italic", fontFamily: T.font }}>"{it.note}"</p>}
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: T.mocha, fontFamily: T.font }}>${it.price.toFixed(2)} each</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    onClick={() => setCart(cart.map((c, i) => i === idx ? { ...c, qty: Math.max(1, c.qty - 1) } : c))}
                    className="cl-focus-ring"
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      border: `1px solid ${T.warmTan}`, background: T.white,
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                      transition: "border-color 0.2s",
                    }}
                  ><Ic name="minus" size={14} /></button>
                  <span style={{ fontSize: 17, fontWeight: 600, minWidth: 20, textAlign: "center", fontFamily: T.font }}>{it.qty}</span>
                  <button
                    onClick={() => setCart(cart.map((c, i) => i === idx ? { ...c, qty: c.qty + 1 } : c))}
                    className="cl-btn-primary cl-focus-ring"
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      border: "none", background: T.green,
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  ><Ic name="plus" size={14} color={T.white} /></button>
                </div>
                <span style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: T.darkBrew, minWidth: 70, textAlign: "right" }}>
                  ${(it.price * it.qty).toFixed(2)}
                </span>
                <button
                  onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                  className="cl-focus-ring"
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6,
                    transition: "background 0.2s",
                  }}
                ><Ic name="x" size={18} color={T.caramel} /></button>
              </div>
            ))}
          </div>

          <div style={{
            ...card(), padding: "32px", position: "sticky", top: 96,
          }}>
            <h3 style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: T.mocha, margin: "0 0 24px" }}>
              Order Summary
            </h3>

            {[
              ["Subtotal", `$${total.toFixed(2)}`],
              ["Tax (est.)", `$${(total * 0.09).toFixed(2)}`],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 15, color: T.mocha, fontFamily: T.font }}>{l}</span>
                <span style={{ fontSize: 15, fontWeight: 500, fontFamily: T.font, color: T.darkBrew }}>{v}</span>
              </div>
            ))}

            <div style={{
              background: T.cream, borderRadius: T.rSm, padding: "12px 16px",
              display: "flex", justifyContent: "space-between", margin: "16px 0",
              border: `1px solid ${T.sand}`,
            }}>
              <span style={{ fontSize: 13, color: T.green, fontWeight: 600, fontFamily: T.font }}>Points earned</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.green, fontFamily: T.font }}>+{Math.round(total * 10)}</span>
            </div>

            <div style={{ height: 1, background: T.sand, margin: "20px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
              <span style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 700, color: T.darkBrew }}>Total</span>
              <span style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 700, color: T.darkBrew }}>${(total * 1.09).toFixed(2)}</span>
            </div>

            <button
              onClick={() => setShowCO(true)}
              className="cl-btn-primary cl-focus-ring"
              style={{ ...btnP, width: "100%", padding: "16px 28px", fontSize: 16 }}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
