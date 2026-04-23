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
  const { featuredItems } = useMenuCatalog();
  const carouselItems = featuredItems;

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
            <h1 className="hero-title">Bold brews to fuel the pride.</h1>
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
              <FeaturedCarousel
                data={carouselItems}
                onAddToCart={(item) => {
                  setSel(item);
                  setQty(1);
                  setNote("");
                }}
              />
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

      <section className="landing-info">
        <h2 className="section-title">
          Filler Text
        </h2>
        <br />
        <p className="landing-info-desc">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel
          sapien eget ipsum efficitur tincidunt. Sed at nunc a enim commodo
          efficitur. Curabitur ac odio id ligula consectetur convallis. In hac
          habitasse platea dictumst. Proin ut dui sed metus pharetra hendrerit.
          Maecenas at nisl nec justo efficitur varius. Nulla facilisi. Donec in
          consectetur metus, a efficitur nisl. Suspendisse potenti. Phasellus
          eget sapien sed lectus fermentum convallis. Vestibulum ante ipsum
          primis in faucibus orci luctus et ultrices posuere cubilia curae;
          Donec ut ex a metus efficitur tincidunt. Sed at nunc a enim commodo
          efficitur. Curabitur ac odio id ligula consectetur convallis. In hac
          habitasse platea dictumst. Proin ut dui sed metus pharetra hendrerit.
          Maecenas at nisl nec justo efficitur varius. Nulla facilisi. Donec in
          consectetur metus, a efficitur nisl. Suspendisse potenti. <br />
          <br />
          Phasellus eget sapien sed lectus fermentum convallis. Vestibulum ante
          ipsum primis in faucibus orci luctus et ultrices posuere cubilia
          curae; Donec ut ex a metus efficitur tincidunt. Sed at nunc a enim
          commodo efficitur. Curabitur ac odio id ligula consectetur convallis.
          In hac habitasse platea dictumst. Proin ut dui sed metus pharetra
          hendrerit. Maecenas at nisl nec justo efficitur varius. Nulla
          facilisi. Donec in consectetur metus, a efficitur nisl. Suspendisse
          potenti. Phasellus eget sapien sed lectus fermentum convallis.
          Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
          posuere cubilia curae; Donec ut ex a metus efficitur tincidunt. Sed at
          nunc a enim commodo efficitur. Curabitur ac odio id ligula consectetur
          convallis. In hac habitasse platea dictumst. Proin ut dui sed metus
          pharetra hendrerit. Maecenas at nisl nec justo efficitur varius. Nulla
          facilisi. Donec in consectetur metus, a efficitur nisl. Suspendisse
          potenti. Phasellus eget sapien sed lectus fermentum convallis.
          Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
          posuere cubilia curae;
        </p>
      </section>
    </div>
  );
}
