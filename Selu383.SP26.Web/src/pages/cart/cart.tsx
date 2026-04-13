import { Tokens, LOGO } from "../../styles/tokens";
import { Ic, ItemIcon } from "../../components/icons";
import { useAppContext } from "../../api/context-providers/app-context";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../navigation/routes";
import "./cart.css";

export function CartPage() {
  const { cart, setCart, setShowCO, total } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="cart-page">
      <section className="cart-header">
        <p className="cart-kicker">Your Order</p>
        <h1 className="cart-title">Cart</h1>
      </section>

      {cart.length === 0 ? (
        <div className="cart-empty-state">
          <img src={LOGO} alt="" className="cart-empty-logo" />
          <h2 className="cart-empty-title">Nothing here yet</h2>
          <p className="cart-empty-copy">
            Browse our menu and add something delicious.
          </p>
          <button
            onClick={() => navigate(APP_ROUTES.menu)}
            className="btn-primary focus-ring btn-primary-base"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="cart-grid">
          <div>
            {cart.map((it, idx) => (
              <div key={idx} className="card-base cart-item-card">
                <ItemIcon cat={it.category} size={52} />
                <div className="cart-flex-1">
                  <h4 className="cart-item-title">{it.name}</h4>
                  {it.note && <p className="cart-item-note">"{it.note}"</p>}
                  <p className="cart-item-unit-price">
                    ${it.price.toFixed(2)} each
                  </p>
                </div>
                <div className="cart-qty-controls">
                  <button
                    onClick={() =>
                      setCart(
                        cart.map((c, i) =>
                          i === idx ? { ...c, qty: Math.max(1, c.qty - 1) } : c,
                        ),
                      )
                    }
                    className="focus-ring cart-qty-btn cart-qty-btn-minus"
                  >
                    <Ic name="minus" size={14} />
                  </button>
                  <span className="cart-qty-value">{it.qty}</span>
                  <button
                    onClick={() =>
                      setCart(
                        cart.map((c, i) =>
                          i === idx ? { ...c, qty: c.qty + 1 } : c,
                        ),
                      )
                    }
                    className="btn-primary focus-ring cart-qty-btn cart-qty-btn-plus"
                  >
                    <Ic name="plus" size={14} color={Tokens.white} />
                  </button>
                </div>
                <span className="cart-line-total">
                  ${(it.price * it.qty).toFixed(2)}
                </span>
                <button
                  onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                  className="focus-ring cart-remove-btn"
                >
                  <Ic name="x" size={18} color={Tokens.caramel} />
                </button>
              </div>
            ))}
          </div>

          <div className="card-base cart-summary-card">
            <h3 className="cart-summary-title">Order Summary</h3>

            {[
              ["Subtotal", `$${total.toFixed(2)}`],
              ["Tax (est.)", `$${(total * 0.09).toFixed(2)}`],
            ].map(([l, v]) => (
              <div key={l} className="cart-summary-row">
                <span className="cart-summary-label">{l}</span>
                <span className="cart-summary-value">{v}</span>
              </div>
            ))}

            <div className="cart-points-box">
              <span className="cart-points-label">Points earned</span>
              <span className="cart-points-value">
                +{Math.round(total * 10)}
              </span>
            </div>

            <div className="cart-divider" />

            <div className="cart-total-row">
              <span className="cart-total-text">Total</span>
              <span className="cart-total-text">
                ${(total * 1.09).toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => setShowCO(true)}
              className="btn-primary focus-ring btn-primary-base cart-checkout-btn"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
