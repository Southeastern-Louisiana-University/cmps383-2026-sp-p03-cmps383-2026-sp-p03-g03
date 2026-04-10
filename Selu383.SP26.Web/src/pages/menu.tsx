import { useState } from "react";
import { T, MENU } from "../components/tokens";
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
    <div className="cl-menu-page">
      <section className="cl-menu-header">
        <p className="cl-menu-kicker">Our Menu</p>
        <h1 className="cl-menu-title">
          Handcrafted
          <br />
          with care
        </h1>
        <p className="cl-menu-subtitle">
          From bold espresso to sweet crepes, every item is made fresh to order.
        </p>
      </section>

      <div className="cl-menu-tabs">
        {Object.keys(MENU).map((c) => (
          <button
            key={c}
            onClick={() => setMenuCat(c)}
            className={`cl-focus-ring cl-menu-tab ${menuCat === c ? "cl-menu-tab-active" : "cl-menu-tab-inactive"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="cl-menu-banner">
        <ImageWithFallback
          src={catImages[menuCat]}
          alt={menuCat}
          className="cl-menu-banner-image"
        />
        <div className="cl-menu-banner-overlay" />
        <div className="cl-noise-overlay" />
        <div className="cl-menu-banner-content">
          <h2 className="cl-menu-banner-title">{menuCat}</h2>
          <p className="cl-menu-banner-copy">{items.length} items available</p>
        </div>
      </div>

      <div className="cl-menu-grid">
        <div
          onClick={() => {
            setSel(items[0]);
            setQty(1);
            setNote("");
          }}
          className="cl-card-base cl-card-hover cl-menu-featured-card"
        >
          <div className="cl-menu-featured-icon-wrap">
            <ItemIcon cat={menuCat} size={80} />
          </div>
          <div className="cl-menu-featured-content">
            <div className="cl-menu-featured-head">
              <div>
                <h3 className="cl-menu-featured-title">{items[0].name}</h3>
                <span className="cl-menu-featured-price">
                  ${items[0].price.toFixed(2)}
                </span>
              </div>
              <span className="cl-menu-featured-badge">Featured</span>
            </div>
            <p className="cl-menu-featured-desc">{items[0].desc}</p>
          </div>
        </div>

        {items.slice(1).map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setSel(item);
              setQty(1);
              setNote("");
            }}
            className="cl-card-base cl-card-hover cl-menu-item-card"
          >
            <ItemIcon cat={menuCat} size={56} />
            <div className="cl-menu-flex-1">
              <div className="cl-menu-item-head">
                <h3 className="cl-menu-item-title">{item.name}</h3>
                <span className="cl-menu-item-price">
                  ${item.price.toFixed(2)}
                </span>
              </div>
              <p className="cl-menu-item-desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
