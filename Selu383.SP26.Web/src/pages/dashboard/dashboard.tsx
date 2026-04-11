import { T, LOGO } from "../../styles/tokens.ts";
import { Ic } from "../../components/icons.tsx";
import { LoyaltyCard } from "../../components/loyalty-card.tsx";
import { useAppContext } from "../../contexts/app-context.tsx";
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
      <section className="dashboard-hero">
        <ImageWithFallback
          src={T.heroImg}
          alt="Caffeinated Lions coffee shop"
          className="dashboard-hero-image"
        />
        <div className="dashboard-hero-overlay" />
        <div className="noise-overlay" />

        <div className="dashboard-hero-content">
          <p className="dashboard-hero-kicker">Welcome back, {user.name}</p>
          <h1 className="dashboard-hero-title">
            Every cup is
            <br />a moment worth savoring.
          </h1>
          <p className="dashboard-hero-subtitle">
            Handcrafted drinks, delicate crepes, fresh bagels, all made with
            love.
          </p>
          <div className="dashboard-hero-actions">
            <button
              onClick={() => navigate(APP_ROUTES.menu)}
              className="btn-primary focus-ring btn-primary-base"
            >
              View Our Menu
            </button>
            <button
              onClick={() => navigate(APP_ROUTES.reservations)}
              className="btn-outline focus-ring btn-outline-base dashboard-hero-outline-btn"
            >
              Reserve a Table
            </button>
          </div>
        </div>

        <img src={LOGO} alt="" className="dashboard-hero-logo" />
      </section>

      <section className="dashboard-feature-grid">
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
            className={`fade-in dashboard-feature-item ${i === 0 ? "delay-0" : i === 1 ? "delay-1" : "delay-2"}`}
          >
            <div className="dashboard-feature-icon-wrap">
              <Ic name={v.icon} size={24} color={T.green} />
            </div>
            <h3 className="dashboard-feature-title">{v.title}</h3>
            <p className="dashboard-feature-desc">{v.desc}</p>
          </div>
        ))}
      </section>

      <section className="dashboard-popular-section">
        <div className="dashboard-popular-header">
          <p className="dashboard-section-kicker">Popular Right Now</p>
          <h2 className="dashboard-section-title">What our regulars love</h2>
        </div>

        {loading ? (
          <div className="card-base" style={{ padding: 24, color: T.mocha }}>
            Loading menu highlights...
          </div>
        ) : error ? (
          <div className="card-base" style={{ padding: 24, color: T.mocha }}>
            {error}
          </div>
        ) : featured.length === 0 ? (
          <div className="card-base" style={{ padding: 24, color: T.mocha }}>
            No menu items are available yet.
          </div>
        ) : (
          <div className="dashboard-popular-grid">
            <div
              onClick={() => {
                setSel(featured[0]);
                setQty(1);
                setNote("");
              }}
              className="card-base card-hover img-zoom dashboard-featured-card"
            >
              <div className="dashboard-featured-media">
                <ImageWithFallback
                  src={T.icedImg}
                  alt={featured[0].name}
                  className="dashboard-featured-image"
                />
                <div className="dashboard-featured-overlay" />
                <span className="dashboard-staff-pick">Staff Pick</span>
              </div>
              <div className="dashboard-featured-content">
                <p className="dashboard-item-kicker">{featured[0].category}</p>
                <h3 className="dashboard-featured-title">{featured[0].name}</h3>
                <p className="dashboard-featured-desc">{featured[0].desc}</p>
                <div className="dashboard-item-footer">
                  <span className="dashboard-featured-price">
                    ${featured[0].price.toFixed(2)}
                  </span>
                  <span className="dashboard-item-cta">Add to order →</span>
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
                className="card-base card-hover dashboard-secondary-card"
              >
                <div className="dashboard-secondary-media">
                  <ImageWithFallback
                    src={index === 0 ? T.crepeImg : T.cafeImg}
                    alt={item.name}
                    className="dashboard-secondary-image"
                  />
                </div>
                <div className="dashboard-secondary-content">
                  <p className="dashboard-item-kicker dashboard-item-kicker-tight">
                    {item.category}
                  </p>
                  <h3 className="dashboard-secondary-title">{item.name}</h3>
                  <p className="dashboard-secondary-desc">{item.desc}</p>
                  <div className="dashboard-item-footer">
                    <span className="dashboard-secondary-price">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="dashboard-item-cta">View →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-lower-grid">
        <div>
          <div className="card-base dashboard-reorder-card">
            <div className="dashboard-reorder-media">
              <ImageWithFallback
                src={T.latteImg}
                alt="Iced Latte"
                className="dashboard-fill-image"
              />
            </div>
            <div className="dashboard-flex-1">
              <p className="dashboard-item-kicker dashboard-item-kicker-xs">
                Order Again
              </p>
              <h4 className="dashboard-reorder-title">Iced Latte</h4>
              <p className="dashboard-reorder-copy">
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

          <div className="dashboard-roast-banner">
            <ImageWithFallback
              src={T.beansImg}
              alt="Fresh roasted beans"
              className="dashboard-fill-image"
            />
            <div className="dashboard-roast-overlay" />
            <div className="noise-overlay" />
            <div className="dashboard-roast-content">
              <h3 className="dashboard-roast-title">Freshly roasted daily</h3>
              <p className="dashboard-roast-copy">
                Single-origin beans from Guatemala, Ethiopia & Colombia
              </p>
            </div>
          </div>
        </div>

        <div>
          <LoyaltyCard user={user} />

          <div className="card-base dashboard-activity-card">
            <h4 className="dashboard-activity-title">Your Activity</h4>
            {[
              { l: "Last Order", v: "Mar 21 — Iced Latte" },
              { l: "Reservation", v: "None upcoming" },
              { l: "Points This Month", v: "+55" },
            ].map((r, i, arr) => (
              <div
                key={r.l}
                className={`dashboard-activity-row ${i < arr.length - 1 ? "dashboard-activity-row-divided" : ""}`}
              >
                <span className="dashboard-activity-label">{r.l}</span>
                <span className="dashboard-activity-value">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
