import { useEffect, useState } from "react";
import { Tokens } from "../../styles/tokens.ts";
import { useAppContext } from "../../api/context-providers/app-context.tsx";
import { ImageWithFallback } from "../../components/image-with-fallback";
import { useMenuCatalog } from "../../api/menu.ts";
import {
  getMenuItemImagePath,
  getMenuItemFallbackPath,
} from "../../api/menu-item-images.ts";
import "./menu.css";

const catImages: Record<string, string> = {
  Drinks: Tokens.latteImg,
  "Crepes - Sweet": Tokens.sweetCrepeImg,
  "Crepes - Savory": Tokens.savoryCrepeImg,
  Bagels: Tokens.bagelImg,
};

export function MenuPage() {
  const { setSel, setQty, setNote } = useAppContext();
  const { categories, defaultCategory, loading, error } = useMenuCatalog();
  const [menuCat, setMenuCat] = useState("");
  const activeCategory =
    categories.find((category) => category.name === menuCat) ?? categories[0];
  const items = activeCategory?.items ?? [];

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
  }, [categories, defaultCategory, menuCat, activeCategory]);

  return (
    <div className="menu-page">
      <section className="menu-header">
        <h1 className="menu-title">Menu</h1>
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
          src={
            activeCategory?.iconPath ||
            catImages[activeCategory?.name ?? "Drinks"] ||
            Tokens.icedImg
          }
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
        <div className="card-base" style={{ padding: 24, color: Tokens.mocha }}>
          Loading menu...
        </div>
      ) : error ? (
        <div className="card-base" style={{ padding: 24, color: Tokens.mocha }}>
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="card-base" style={{ padding: 24, color: Tokens.mocha }}>
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
            <ImageWithFallback
              src={(() => {
                const foo = getMenuItemImagePath( // for debugging purposes, to see the generated path in the console
                  items[0].name,
                  items[0].imagePath,
                );
                console.log("Generated image path for featured item:", foo);
                return foo;
              })()}
              fallbackSrc={getMenuItemFallbackPath(
                items[0].category,
                activeCategory?.iconPath,
              )}
              alt={items[0].name}
              className="menu-featured-image"
            />
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
              <ImageWithFallback
                src={getMenuItemImagePath(item.name, item.imagePath)}
                fallbackSrc={getMenuItemFallbackPath(
                  item.category,
                  activeCategory?.iconPath,
                )}
                alt={item.name}
                className="menu-item-image"
              />
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
