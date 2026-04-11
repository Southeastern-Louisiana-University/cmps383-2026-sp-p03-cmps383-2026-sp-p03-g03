import { useEffect, useState } from "react";
import { T } from "../../styles/tokens.ts";
import { ItemIcon } from "../../components/icons";
import { useAppContext } from "../../contexts/app-context.tsx";
import { ImageWithFallback } from "../../components/image-with-fallback";
import { useMenuCatalog } from "../../api/menu.ts";

const catImages: Record<string, string> = {
  Drinks: T.icedImg,
  "Sweet Crepes": T.crepeImg,
  "Savory Crepes": T.cafeImg,
  Bagels: T.latteImg,
};

export function MenuPage() {
  const { setSel, setQty, setNote } = useAppContext();
  const { categories, defaultCategory, loading, error } = useMenuCatalog();
  const [menuCat, setMenuCat] = useState("");

  useEffect(() => {
    if (!categories.length) {
      return;
    }

    const hasCurrentCategory = categories.some(
      (category) => category.name === menuCat,
    );
    if (!menuCat || !hasCurrentCategory) {
      setMenuCat(defaultCategory || categories[0].name);
    }
  }, [categories, defaultCategory, menuCat]);

  const activeCategory =
    categories.find((category) => category.name === menuCat) ?? categories[0];
  const items = activeCategory?.items ?? [];

  return (
    <div className="menu-page">
      <section className="menu-header">
        <p className="menu-kicker">Our Menu</p>
        <h1 className="menu-title">
          Handcrafted
          <br />
          with care
        </h1>
        <p className="menu-subtitle">
          From bold espresso to sweet crepes, every item is made fresh to order.
        </p>
      </section>

      <div className="menu-tabs">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setMenuCat(category.name)}
            className={`focus-ring menu-tab ${menuCat === category.name ? "menu-tab-active" : "menu-tab-inactive"}`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="menu-banner">
        <ImageWithFallback
          src={catImages[activeCategory?.name ?? "Drinks"] ?? T.icedImg}
          alt={activeCategory?.name ?? "Menu"}
          className="menu-banner-image"
        />
        <div className="menu-banner-overlay" />
        <div className="noise-overlay" />
        <div className="menu-banner-content">
          <h2 className="menu-banner-title">
            {activeCategory?.name ?? "Menu"}
          </h2>
          <p className="menu-banner-copy">{items.length} items available</p>
        </div>
      </div>

      {loading ? (
        <div className="card-base" style={{ padding: 24, color: T.mocha }}>
          Loading menu...
        </div>
      ) : error ? (
        <div className="card-base" style={{ padding: 24, color: T.mocha }}>
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="card-base" style={{ padding: 24, color: T.mocha }}>
          No items are available in this category.
        </div>
      ) : (
        <div className="menu-grid">
          <div
            onClick={() => {
              setSel(items[0]);
              setQty(1);
              setNote("");
            }}
            className="card-base card-hover menu-featured-card"
          >
            <div className="menu-featured-icon-wrap">
              <ItemIcon cat={activeCategory?.name ?? "Drinks"} size={80} />
            </div>
            <div className="menu-featured-content">
              <div className="menu-featured-head">
                <div>
                  <h3 className="menu-featured-title">{items[0].name}</h3>
                  <span className="menu-featured-price">
                    ${items[0].price.toFixed(2)}
                  </span>
                </div>
                <span className="menu-featured-badge">Featured</span>
              </div>
              <p className="menu-featured-desc">{items[0].desc}</p>
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
              className="card-base card-hover menu-item-card"
            >
              <ItemIcon cat={item.category} size={56} />
              <div className="menu-flex-1">
                <div className="menu-item-head">
                  <h3 className="menu-item-title">{item.name}</h3>
                  <span className="menu-item-price">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <p className="menu-item-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
