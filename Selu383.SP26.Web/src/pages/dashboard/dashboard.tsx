import { Tokens } from "../../styles/tokens.ts";
import { Ic } from "../../components/icons.tsx";
import { useAppContext } from "../../api/context-providers/app-context.tsx";
import { ImageWithFallback } from "../../components/image-with-fallback.tsx";
import { useMenuCatalog } from "../../api/menu.ts";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../navigation/routes.ts";
import "./dashboard.css";
import FeaturedCarousel from "../../components/featured-carousel.tsx";

export function DashboardPage() {
  const { setSel, setQty, setNote } = useAppContext();
  const navigate = useNavigate();
  const { featuredItems, loading, error } = useMenuCatalog();

  // All items for the 3D carousel
  const carouselItems = featuredItems;

  // Strictly 4 items for the bottom grid (1 large + 3 small) to fill the empty space
  const popularItems = featuredItems.slice(0, 4);

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
          <div className="hero-text-content">
            <h1 className="hero-title">
              Bold brews to fuel the pride.
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

          <div className="hero-carousel-wrapper">
            {carouselItems.length > 0 && (
              <FeaturedCarousel data={carouselItems} />
            )}
          </div>
        </div>
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
            desc: "Order ahead and skip the line. Know when your order is ready.",
          },
          {
            icon: "gift",
            title: "Earn Rewards",
            desc: "Sign up for free. Earn points on every purchase. Redeem free drinks and crepes.",
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
          <h2 className="section-title">Popular Right Now</h2>
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
        ) : popularItems.length === 0 ? (
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
                setSel(popularItems[0]);
                setQty(1);
                setNote("");
              }}
              className="card-base card-hover img-zoom featured-card"
            >
              <div className="featured-media">
                <ImageWithFallback
                  src={Tokens.icedImg}
                  alt={popularItems[0].name}
                  className="featured-image"
                />
                <div className="featured-overlay" />
                <span className="staff-pick">Staff Pick</span>
              </div>
              <div className="featured-content">
                <p className="item-kicker">{popularItems[0].category}</p>
                <h3 className="featured-title">{popularItems[0].name}</h3>
                <p className="featured-desc">{popularItems[0].desc}</p>
                <div className="item-footer">
                  <span className="featured-price">
                    ${popularItems[0].price.toFixed(2)}
                  </span>
                  <span className="item-cta">View →</span>
                </div>
              </div>
            </div>

            {popularItems.slice(1).map((item, index) => (
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
    </div>
  );
}
