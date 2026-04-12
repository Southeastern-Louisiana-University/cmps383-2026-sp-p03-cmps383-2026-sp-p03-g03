import { Tokens, card, btnP, lbl, inp } from "../styles/tokens";
import { Ic, ItemIcon } from "./icons";
import { Dialog } from "./dialog";
import { useAppContext } from "../api/context-providers/app-context";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../navigation/routes";

export function ItemDialog() {
  const { sel, setSel, note, setNote, qty, setQty, addToCart } =
    useAppContext();

  return (
    <Dialog open={!!sel} onClose={() => setSel(null)} width={720}>
      {sel && (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr" }}>
          <div
            style={{
              background: Tokens.cream,
              padding: "48px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: `${Tokens.rLg} 0 0 ${Tokens.rLg}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 20,
                left: 20,
                fontFamily: Tokens.font,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: Tokens.mocha,
              }}
            >
              {sel.category}
            </span>

            <ItemIcon cat={sel.category} size={120} />

            <div style={{ marginTop: 32, textAlign: "center" }}>
              <span
                style={{
                  fontFamily: Tokens.fontDisplay,
                  fontSize: 36,
                  fontWeight: 700,
                  color: Tokens.darkBrew,
                }}
              >
                ${sel.price.toFixed(2)}
              </span>
            </div>
          </div>

          <div style={{ padding: "40px 36px 36px" }}>
            <h2
              style={{
                fontFamily: Tokens.fontDisplay,
                fontSize: 32,
                fontWeight: 700,
                color: Tokens.darkBrew,
                margin: "0 0 12px",
                lineHeight: 1.15,
                paddingRight: 40,
              }}
            >
              {sel.name}
            </h2>

            <p
              style={{
                fontFamily: Tokens.font,
                fontSize: 16,
                color: Tokens.mocha,
                lineHeight: 1.65,
                margin: "0 0 32px",
              }}
            >
              {sel.desc}
            </p>

            <div style={{ marginBottom: 32 }}>
              <label style={lbl}>Special Instructions</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Extra shot, oat milk, light ice..."
                style={{
                  ...inp,
                  resize: "vertical",
                  minHeight: 72,
                  background: Tokens.cream,
                  border: `1px solid ${Tokens.sand}`,
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: Tokens.mocha,
                    fontFamily: Tokens.font,
                  }}
                >
                  Qty
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                    border: `1px solid ${Tokens.warmTan}`,
                    borderRadius: Tokens.rSm,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="focus-ring"
                    style={{
                      width: 44,
                      height: 44,
                      border: "none",
                      background: Tokens.white,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "background 0.15s",
                      borderRight: `1px solid ${Tokens.warmTan}`,
                    }}
                  >
                    <Ic name="minus" size={14} />
                  </button>
                  <span
                    style={{
                      width: 52,
                      textAlign: "center",
                      fontSize: 18,
                      fontWeight: 600,
                      fontFamily: Tokens.font,
                      background: Tokens.white,
                      lineHeight: "44px",
                    }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="focus-ring"
                    style={{
                      width: 44,
                      height: 44,
                      border: "none",
                      background: Tokens.white,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "background 0.15s",
                      borderLeft: `1px solid ${Tokens.warmTan}`,
                    }}
                  >
                    <Ic name="plus" size={14} />
                  </button>
                </div>
              </div>

              <button
                onClick={addToCart}
                className="btn-primary focus-ring"
                style={{ ...btnP, padding: "14px 32px", fontSize: 15, flex: 1 }}
              >
                Add to Cart — ${(sel.price * qty).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}

export function CheckoutDialog() {
  const { showCO, setShowCO, setShowOK, total, rcpt, setRcpt } =
    useAppContext();

  return (
    <Dialog open={showCO} onClose={() => setShowCO(false)} width={560}>
      <div style={{ padding: "40px" }}>
        <p
          style={{
            fontFamily: Tokens.font,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: Tokens.mocha,
            margin: "0 0 4px",
          }}
        >
          Checkout
        </p>
        <h2
          style={{
            fontFamily: Tokens.fontDisplay,
            fontSize: 32,
            fontWeight: 700,
            margin: "0 0 32px",
            color: Tokens.darkBrew,
            lineHeight: 1.15,
          }}
        >
          Complete your order
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px 28px",
            marginBottom: 28,
          }}
        >
          <div>
            <label style={lbl}>Order Type</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["Pickup", "Drive-Thru"].map((t, i) => (
                <button
                  key={t}
                  className="focus-ring"
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: Tokens.rSm,
                    border:
                      i === 0
                        ? `1.5px solid ${Tokens.green}`
                        : `1px solid ${Tokens.warmTan}`,
                    background: i === 0 ? Tokens.green : Tokens.white,
                    color: i === 0 ? Tokens.white : Tokens.espresso,
                    fontFamily: Tokens.font,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={lbl}>Receipt</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 6,
              }}
            >
              {["Paper", "Text", "Email", "None"].map((o) => (
                <button
                  key={o}
                  onClick={() => setRcpt(o.toLowerCase())}
                  className="focus-ring"
                  style={{
                    padding: 10,
                    borderRadius: Tokens.rSm,
                    border:
                      rcpt === o.toLowerCase()
                        ? `1.5px solid ${Tokens.green}`
                        : `1px solid ${Tokens.warmTan}`,
                    background:
                      rcpt === o.toLowerCase() ? Tokens.cream : Tokens.white,
                    fontFamily: Tokens.font,
                    fontWeight: 500,
                    fontSize: 13,
                    color:
                      rcpt === o.toLowerCase() ? Tokens.green : Tokens.espresso,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={lbl}>Payment Method</label>
          <div
            style={{
              ...card(),
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 44,
                height: 28,
                borderRadius: 6,
                background: "#635BFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: Tokens.white,
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: Tokens.font,
                }}
              >
                VISA
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: Tokens.font,
                  color: Tokens.darkBrew,
                }}
              >
                •••• 4242
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 13,
                  color: Tokens.mocha,
                  fontFamily: Tokens.font,
                }}
              >
                Exp 12/27
              </p>
            </div>
            <Ic name="check" size={18} color={Tokens.green} />
          </div>
        </div>

        <div
          style={{
            background: Tokens.cream,
            borderRadius: Tokens.rSm,
            padding: "24px",
            marginBottom: 28,
            border: `1px solid ${Tokens.sand}`,
          }}
        >
          {[
            ["Subtotal", `$${total.toFixed(2)}`],
            ["Tax", `$${(total * 0.09).toFixed(2)}`],
          ].map(([l, v]) => (
            <div
              key={l}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  color: Tokens.mocha,
                  fontFamily: Tokens.font,
                }}
              >
                {l}
              </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: Tokens.font,
                  color: Tokens.darkBrew,
                }}
              >
                {v}
              </span>
            </div>
          ))}
          <div
            style={{
              height: 1,
              background: Tokens.sand,
              margin: "16px 0",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span
              style={{
                fontFamily: Tokens.fontDisplay,
                fontSize: 22,
                fontWeight: 700,
                color: Tokens.darkBrew,
              }}
            >
              Total
            </span>
            <span
              style={{
                fontFamily: Tokens.fontDisplay,
                fontSize: 22,
                fontWeight: 700,
                color: Tokens.darkBrew,
              }}
            >
              ${(total * 1.09).toFixed(2)}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setShowCO(false);
            setShowOK(true);
          }}
          className="btn-primary focus-ring"
          style={{ ...btnP, width: "100%", padding: "16px 28px", fontSize: 16 }}
        >
          Pay ${(total * 1.09).toFixed(2)}
        </button>
      </div>
    </Dialog>
  );
}

export function SuccessDialog() {
  const { showOK, setShowOK, setCart, total } = useAppContext();
  const navigate = useNavigate();

  return (
    <Dialog
      open={showOK}
      onClose={() => {
        setShowOK(false);
        setCart([]);
      }}
      width={440}
    >
      <div style={{ textAlign: "center", padding: "56px 40px 48px" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            margin: "0 auto 24px",
            background: Tokens.cream,
            border: `1px solid ${Tokens.sand}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ic name="check" size={32} color={Tokens.green} />
        </div>
        <h2
          style={{
            fontFamily: Tokens.fontDisplay,
            fontSize: 32,
            fontWeight: 700,
            margin: "0 0 8px",
            color: Tokens.darkBrew,
          }}
        >
          Order Confirmed
        </h2>
        <p
          style={{
            fontSize: 16,
            color: Tokens.mocha,
            margin: "0 0 8px",
            fontFamily: Tokens.font,
          }}
        >
          You earned{" "}
          <strong style={{ color: Tokens.green }}>
            +{Math.round(total * 10)} points
          </strong>
        </p>
        <div
          style={{
            background: Tokens.cream,
            borderRadius: Tokens.rSm,
            padding: "20px 28px",
            margin: "28px 0 36px",
            border: `1px solid ${Tokens.sand}`,
            display: "inline-block",
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: Tokens.mocha,
              margin: "0 0 4px",
              fontFamily: Tokens.font,
            }}
          >
            Order #CL-00847
          </p>
          <p
            style={{
              fontFamily: Tokens.fontDisplay,
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
              color: Tokens.darkBrew,
            }}
          >
            Ready in 8–12 min
          </p>
        </div>
        <br />
        <button
          onClick={() => {
            setShowOK(false);
            setCart([]);
            navigate(APP_ROUTES.home);
          }}
          className="btn-primary focus-ring"
          style={{ ...btnP, padding: "14px 56px", fontSize: 16 }}
        >
          Done
        </button>
      </div>
    </Dialog>
  );
}
