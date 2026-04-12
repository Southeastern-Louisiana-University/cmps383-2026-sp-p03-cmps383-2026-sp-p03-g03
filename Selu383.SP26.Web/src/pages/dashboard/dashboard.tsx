import { Tokens, LOGO } from "../../styles/tokens.ts";
import { Ic } from "../../components/icons.tsx";
import { LoyaltyCard } from "../../components/loyalty-card.tsx";
import { useAppContext } from "../../api/contexts/app-context.tsx";
import { ImageWithFallback } from "../../components/image-with-fallback.tsx";
import { useMenuCatalog } from "../../api/menu.ts";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../navigation/routes.ts";
import "./dashboard.css";

export function DashboardPage() {
  const { user, setSel, setQty, setNote, cart, setCart } = useAppContext();
  const navigate = useNavigate();
  const { featuredItems, loading, error } = useMenuCatalog();

  const featured = featuredItems.slice(0, 3);
  const reorderItem =
    featuredItems.find((item) => item.category === "Drinks") ??
    featuredItems[0];

  return (
    <div className="dashboard-page">
      <section className="hero">
        <ImageWithFallback
          src={Tokens.heroImg}
          alt="Caffeinated Lions coffee shop"
          className="hero-image"
        />
        <div className="hero-overlay" />
        <div className="noise-overlay" />

        <div className="hero-content">
          {/* <p className="hero-kicker">Welcome back, {user.name}</p> */}
          <h1 className="hero-title">
            Bold brews to <br /> fuel the pride.
          </h1>
          <p className="hero-subtitle">
            Fresh coffee, crepes, and bagels, all made with love.
          </p>
          <div className="hero-actions">
            <button
              onClick={() => navigate(APP_ROUTES.menu)}
              className="btn-primary focus-ring btn-primary-base"
            >
              View Our Menu
            </button>
            <button
              onClick={() => navigate(APP_ROUTES.reservations)}
              className="btn-outline focus-ring btn-outline-base hero-outline-btn"
            >
              Reserve a Table
            </button>
          </div>
        </div>

        <img src={LOGO} alt="" className="hero-logo" />
      </section>

      <section className="feature-grid">
        {[
          {
            icon: "menu",
            title: "Handcrafted Daily",
            desc: "Every drink made fresh by skilled baristas serving bold brews.",
          },
          {
            icon: "clock",
            title: "Quick Pickup",
            desc: "Order ahead and skip the line. Your order ready when you arrive.",
          },
          {
            icon: "gift",
            title: "Earn Rewards",
            desc: "Members earn points on every purchase. Redeem free drinks and crepes.",
          },
        ].map((v, i) => (
          <div
            key={v.title}
            className={`fade-in feature-item ${i === 0 ? "delay-0" : i === 1 ? "delay-1" : "delay-2"}`}
          >
            <div className="feature-icon-wrap">
              <Ic name={v.icon} size={24} color={Tokens.green} />
            </div>
            <h3 className="feature-title">{v.title}</h3>
            <p className="feature-desc">{v.desc}</p>
          </div>
        ))}
      </section>

      <section className="popular-section">
        <div className="popular-header">
          <p className="section-kicker">Popular Right Now</p>
          <h2 className="section-title">What our regulars love</h2>
        </div>

        {loading ? (
          <div
            className="card-base"
            style={{ padding: 24, color: Tokens.mocha }}
          >
            Loading menu highlights...
          </div>
        ) : error ? (
          <div
            className="card-base"
            style={{ padding: 24, color: Tokens.mocha }}
          >
            {error}
          </div>
        ) : featured.length === 0 ? (
          <div
            className="card-base"
            style={{ padding: 24, color: Tokens.mocha }}
          >
            No menu items are available yet.
          </div>
        ) : (
          <div className="popular-grid">
            <div
              onClick={() => {
                setSel(featured[0]);
                setQty(1);
                setNote("");
              }}
              className="card-base card-hover img-zoom featured-card"
            >
              <div className="featured-media">
                <ImageWithFallback
                  src={Tokens.icedImg}
                  alt={featured[0].name}
                  className="featured-image"
                />
                <div className="featured-overlay" />
                <span className="staff-pick">Staff Pick</span>
              </div>
              <div className="featured-content">
                <p className="item-kicker">{featured[0].category}</p>
                <h3 className="featured-title">{featured[0].name}</h3>
                <p className="featured-desc">{featured[0].desc}</p>
                <div className="item-footer">
                  <span className="featured-price">
                    ${featured[0].price.toFixed(2)}
                  </span>
                  <span className="item-cta">Add to order →</span>
                </div>
              </div>
            </div>

            {featured.slice(1).map((item, index) => (
              <div
                key={item.id}
                onClick={() => {
                  setSel(item);
                  setQty(1);
                  setNote("");
                }}
                className="card-base card-hover secondary-card"
              >
                <div className="secondary-media">
                  <ImageWithFallback
                    src={index === 0 ? Tokens.crepeImg : Tokens.cafeImg}
                    alt={item.name}
                    className="secondary-image"
                  />
                </div>
                <div className="secondary-content">
                  <p className="item-kicker item-kicker-tight">
                    {item.category}
                  </p>
                  <h3 className="secondary-title">{item.name}</h3>
                  <p className="secondary-desc">{item.desc}</p>
                  <div className="item-footer">
                    <span className="secondary-price">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="item-cta">View →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="lower-grid">
        <div>
          <div className="card-base reorder-card">
            <div className="reorder-media">
              <ImageWithFallback
                src={Tokens.latteImg}
                alt="Iced Latte"
                className="fill-image"
              />
            </div>
            <div className="flex-1">
              <p className="item-kicker item-kicker-xs">Order Again</p>
              <h4 className="reorder-title">Iced Latte</h4>
              <p className="reorder-copy">
                {reorderItem
                  ? `Your most ordered drink — $${reorderItem.price.toFixed(2)}`
                  : "Menu item unavailable right now"}
              </p>
            </div>
            <button
              onClick={() => {
                if (!reorderItem) {
                  return;
                }

                setCart([...cart, { ...reorderItem, qty: 1, note: "" }]);
              }}
              className="btn-primary focus-ring btn-primary-base"
              disabled={!reorderItem}
            >
              Reorder
            </button>
          </div>

          <div className="roast-banner">
            <ImageWithFallback
              src={Tokens.beansImg}
              alt="Fresh roasted beans"
              className="fill-image"
            />
            <div className="roast-overlay" />
            <div className="noise-overlay" />
            <div className="roast-content">
              <h3 className="roast-title">Freshly roasted daily</h3>
              <p className="roast-copy">
                Single-origin beans from Guatemala, Ethiopia & Colombia
              </p>
            </div>
          </div>
        </div>

        <div>
          <LoyaltyCard user={user} />

          <div className="card-base activity-card">
            <h4 className="activity-title">Your Activity</h4>
            {[
              { l: "Last Order", v: "Mar 21 — Iced Latte" },
              { l: "Reservation", v: "None upcoming" },
              { l: "Points This Month", v: "+55" },
            ].map((r, i, arr) => (
              <div
                key={r.l}
                className={`activity-row ${i < arr.length - 1 ? "activity-row-divided" : ""}`}
              >
                <span className="activity-label">{r.l}</span>
                <span className="activity-value">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
