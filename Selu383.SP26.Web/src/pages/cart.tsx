import { T, LOGO, getCat } from "../components/tokens";
import { Ic, ItemIcon } from "../components/icons";
import { useAppContext } from "../components/app-context";

export function CartPage() {
  const { cart, setCart, setTab, setShowCO, total } = useAppContext();

  return (
    <div className="cl-cart-page">
      <section className="cl-cart-header">
        <p className="cl-cart-kicker">Your Order</p>
        <h1 className="cl-cart-title">Cart</h1>
      </section>

      {cart.length === 0 ? (
        <div className="cl-cart-empty-state">
          <img src={LOGO} alt="" className="cl-cart-empty-logo" />
          <h2 className="cl-cart-empty-title">Nothing here yet</h2>
          <p className="cl-cart-empty-copy">
            Browse our menu and add something delicious.
          </p>
          <button
            onClick={() => setTab("order")}
            className="cl-btn-primary cl-focus-ring cl-btn-primary-base"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="cl-cart-grid">
          <div>
            {cart.map((it, idx) => (
              <div key={idx} className="cl-card-base cl-cart-item-card">
                <ItemIcon cat={getCat(it.id)} size={52} />
                <div className="cl-cart-flex-1">
                  <h4 className="cl-cart-item-title">{it.name}</h4>
                  {it.note && <p className="cl-cart-item-note">"{it.note}"</p>}
                  <p className="cl-cart-item-unit-price">
                    ${it.price.toFixed(2)} each
                  </p>
                </div>
                <div className="cl-cart-qty-controls">
                  <button
                    onClick={() =>
                      setCart(
                        cart.map((c, i) =>
                          i === idx ? { ...c, qty: Math.max(1, c.qty - 1) } : c,
                        ),
                      )
                    }
                    className="cl-focus-ring cl-cart-qty-btn cl-cart-qty-btn-minus"
                  >
                    <Ic name="minus" size={14} />
                  </button>
                  <span className="cl-cart-qty-value">{it.qty}</span>
                  <button
                    onClick={() =>
                      setCart(
                        cart.map((c, i) =>
                          i === idx ? { ...c, qty: c.qty + 1 } : c,
                        ),
                      )
                    }
                    className="cl-btn-primary cl-focus-ring cl-cart-qty-btn cl-cart-qty-btn-plus"
                  >
                    <Ic name="plus" size={14} color={T.white} />
                  </button>
                </div>
                <span className="cl-cart-line-total">
                  ${(it.price * it.qty).toFixed(2)}
                </span>
                <button
                  onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                  className="cl-focus-ring cl-cart-remove-btn"
                >
                  <Ic name="x" size={18} color={T.caramel} />
                </button>
              </div>
            ))}
          </div>

          <div className="cl-card-base cl-cart-summary-card">
            <h3 className="cl-cart-summary-title">Order Summary</h3>

            {[
              ["Subtotal", `$${total.toFixed(2)}`],
              ["Tax (est.)", `$${(total * 0.09).toFixed(2)}`],
            ].map(([l, v]) => (
              <div key={l} className="cl-cart-summary-row">
                <span className="cl-cart-summary-label">{l}</span>
                <span className="cl-cart-summary-value">{v}</span>
              </div>
            ))}

            <div className="cl-cart-points-box">
              <span className="cl-cart-points-label">Points earned</span>
              <span className="cl-cart-points-value">
                +{Math.round(total * 10)}
              </span>
            </div>

            <div className="cl-cart-divider" />

            <div className="cl-cart-total-row">
              <span className="cl-cart-total-text">Total</span>
              <span className="cl-cart-total-text">
                ${(total * 1.09).toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => setShowCO(true)}
              className="cl-btn-primary cl-focus-ring cl-btn-primary-base cl-cart-checkout-btn"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
