import { T, LOGO, MENU, getCat } from "../components/tokens";
import { Ic } from "../components/icons";
import { LoyaltyCard } from "../components/loyalty-card";
import { useAppContext } from "../components/app-context";
import { ImageWithFallback } from "../components/ImageWithFallback";

export function DashboardPage() {
  const { user, setTab, setSel, setQty, setNote, cart, setCart } =
    useAppContext();

  const featured = [MENU.Drinks[2], MENU["Sweet Crepes"][1], MENU.Bagels[0]];

  return (
    <div className="cl-dashboard-page">
      <section className="cl-dashboard-hero">
        <ImageWithFallback
          src={T.heroImg}
          alt="Caffeinated Lions coffee shop"
          className="cl-dashboard-hero-image"
        />
        <div className="cl-dashboard-hero-overlay" />
        <div className="cl-noise-overlay" />

        <div className="cl-dashboard-hero-content">
          <p className="cl-dashboard-hero-kicker">Welcome back, {user.name}</p>
          <h1 className="cl-dashboard-hero-title">
            Every cup,
            <br />a moment worth savoring.
          </h1>
          <p className="cl-dashboard-hero-subtitle">
            Handcrafted drinks and fresh crepes, made with love in the heart of
            downtown.
          </p>
          <div className="cl-dashboard-hero-actions">
            <button
              onClick={() => setTab("order")}
              className="cl-btn-primary cl-focus-ring cl-btn-primary-base"
            >
              View Our Menu
            </button>
            <button
              onClick={() => setTab("reserve")}
              className="cl-btn-outline cl-focus-ring cl-btn-outline-base cl-dashboard-hero-outline-btn"
            >
              Reserve a Table
            </button>
          </div>
        </div>

        <img src={LOGO} alt="" className="cl-dashboard-hero-logo" />
      </section>

      <section className="cl-dashboard-feature-grid">
        {[
          {
            icon: "menu",
            title: "Handcrafted Daily",
            desc: "Every drink made fresh by skilled baristas using locally roasted beans.",
          },
          {
            icon: "clock",
            title: "Quick Pickup",
            desc: "Order ahead and skip the line. Your order ready when you arrive.",
          },
          {
            icon: "gift",
            title: "Earn Rewards",
            desc: "Earn points on every purchase. Redeem for free drinks and crepes.",
          },
        ].map((v, i) => (
          <div
            key={v.title}
            className={`cl-fade-in cl-dashboard-feature-item ${i === 0 ? "cl-delay-0" : i === 1 ? "cl-delay-1" : "cl-delay-2"}`}
          >
            <div className="cl-dashboard-feature-icon-wrap">
              <Ic name={v.icon} size={24} color={T.green} />
            </div>
            <h3 className="cl-dashboard-feature-title">{v.title}</h3>
            <p className="cl-dashboard-feature-desc">{v.desc}</p>
          </div>
        ))}
      </section>

      <section className="cl-dashboard-popular-section">
        <div className="cl-dashboard-popular-header">
          <p className="cl-dashboard-section-kicker">Popular Right Now</p>
          <h2 className="cl-dashboard-section-title">What our regulars love</h2>
        </div>

        <div className="cl-dashboard-popular-grid">
          <div
            onClick={() => {
              setSel(featured[0]);
              setQty(1);
              setNote("");
            }}
            className="cl-card-base cl-card-hover cl-img-zoom cl-dashboard-featured-card"
          >
            <div className="cl-dashboard-featured-media">
              <ImageWithFallback
                src={T.icedImg}
                alt={featured[0].name}
                className="cl-dashboard-featured-image"
              />
              <div className="cl-dashboard-featured-overlay" />
              <span className="cl-dashboard-staff-pick">Staff Pick</span>
            </div>
            <div className="cl-dashboard-featured-content">
              <p className="cl-dashboard-item-kicker">
                {getCat(featured[0].id)}
              </p>
              <h3 className="cl-dashboard-featured-title">
                {featured[0].name}
              </h3>
              <p className="cl-dashboard-featured-desc">{featured[0].desc}</p>
              <div className="cl-dashboard-item-footer">
                <span className="cl-dashboard-featured-price">
                  ${featured[0].price.toFixed(2)}
                </span>
                <span className="cl-dashboard-item-cta">Add to order →</span>
              </div>
            </div>
          </div>

          {featured.slice(1).map((item, i) => (
            <div
              key={item.id}
              onClick={() => {
                setSel(item);
                setQty(1);
                setNote("");
              }}
              className="cl-card-base cl-card-hover cl-dashboard-secondary-card"
            >
              <div className="cl-dashboard-secondary-media">
                <ImageWithFallback
                  src={i === 0 ? T.crepeImg : T.cafeImg}
                  alt={item.name}
                  className="cl-dashboard-secondary-image"
                />
              </div>
              <div className="cl-dashboard-secondary-content">
                <p className="cl-dashboard-item-kicker cl-dashboard-item-kicker-tight">
                  {getCat(item.id)}
                </p>
                <h3 className="cl-dashboard-secondary-title">{item.name}</h3>
                <p className="cl-dashboard-secondary-desc">{item.desc}</p>
                <div className="cl-dashboard-item-footer">
                  <span className="cl-dashboard-secondary-price">
                    ${item.price.toFixed(2)}
                  </span>
                  <span className="cl-dashboard-item-cta">View →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cl-dashboard-lower-grid">
        <div>
          <div className="cl-card-base cl-dashboard-reorder-card">
            <div className="cl-dashboard-reorder-media">
              <ImageWithFallback
                src={T.latteImg}
                alt="Iced Latte"
                className="cl-dashboard-fill-image"
              />
            </div>
            <div className="cl-dashboard-flex-1">
              <p className="cl-dashboard-item-kicker cl-dashboard-item-kicker-xs">
                Order Again
              </p>
              <h4 className="cl-dashboard-reorder-title">Iced Latte</h4>
              <p className="cl-dashboard-reorder-copy">
                Your most ordered drink — $5.50
              </p>
            </div>
            <button
              onClick={() =>
                setCart([...cart, { ...MENU.Drinks[0], qty: 1, note: "" }])
              }
              className="cl-btn-primary cl-focus-ring cl-btn-primary-base"
            >
              Reorder
            </button>
          </div>

          <div className="cl-dashboard-roast-banner">
            <ImageWithFallback
              src={T.beansImg}
              alt="Fresh roasted beans"
              className="cl-dashboard-fill-image"
            />
            <div className="cl-dashboard-roast-overlay" />
            <div className="cl-noise-overlay" />
            <div className="cl-dashboard-roast-content">
              <h3 className="cl-dashboard-roast-title">
                Freshly roasted daily
              </h3>
              <p className="cl-dashboard-roast-copy">
                Single-origin beans from Guatemala, Ethiopia & Colombia
              </p>
            </div>
          </div>
        </div>

        <div>
          <LoyaltyCard user={user} />

          <div className="cl-card-base cl-dashboard-activity-card">
            <h4 className="cl-dashboard-activity-title">Your Activity</h4>
            {[
              { l: "Last Order", v: "Mar 21 — Iced Latte" },
              { l: "Reservation", v: "None upcoming" },
              { l: "Points This Month", v: "+55" },
            ].map((r, i, arr) => (
              <div
                key={r.l}
                className={`cl-dashboard-activity-row ${i < arr.length - 1 ? "cl-dashboard-activity-row-divided" : ""}`}
              >
                <span className="cl-dashboard-activity-label">{r.l}</span>
                <span className="cl-dashboard-activity-value">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
