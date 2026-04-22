import { useState, useEffect } from "react";
import { useLocations } from "../../api/locations";
import { useMenuCatalog } from "../../api/menu";
import { Tokens } from "../../styles/tokens";
import { ItemIcon } from "../../components/icons";
import { ImageWithFallback } from "../../components/image-with-fallback";
import {
  getMenuItemImagePath,
  getMenuItemFallbackPath,
} from "../../utils/menu-item-images";
import { useAppContext } from "../../api/context-providers/app-context";
import "./orders.css";

export function OrdersPage() {
  const { locations, loading: locLoading, error: locError } = useLocations();
  const {
    categories,
    defaultCategory,
    loading: menuLoading,
    error: menuError,
  } = useMenuCatalog();
  const { setSel, setQty, setNote, selectedLocation, handleLocationChange } =
    useAppContext();
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
    <div className="orders-page">
      <section className="orders-header">
        <h1 className="orders-title">Order Online</h1>
      </section>

      <div className="location-selection">
        <h2 className="location-title">Select a Location</h2>
        {locLoading ? (
          <div className="card-base" style={{ padding: 24 }}>
            Loading locations...
          </div>
        ) : locError ? (
          <div className="card-base" style={{ padding: 24 }}>
            {locError}
          </div>
        ) : (
          <div className="location-grid">
            {locations
              .filter((loc) => loc.isActive)
              .map((location) => (
                <div
                  key={location.id}
                  onClick={() => handleLocationChange(location.id)}
                  className={`card-base card-hover location-card ${selectedLocation === location.id ? "selected" : ""}`}
                >
                  <h3 className="location-name">{location.name}</h3>
                  <p className="location-address">{location.address}</p>
                  <p className="location-city">
                    {location.city}, {location.state} {location.zip}
                  </p>
                  {location.phone && (
                    <p className="location-phone">{location.phone}</p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {selectedLocation && (
        <div className="menu-section">
          <h2 className="menu-section-title">Menu</h2>
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

          {menuLoading ? (
            <div
              className="card-base"
              style={{ padding: 24, color: Tokens.mocha }}
            >
              Loading menu...
            </div>
          ) : menuError ? (
            <div
              className="card-base"
              style={{ padding: 24, color: Tokens.mocha }}
            >
              {menuError}
            </div>
          ) : items.length === 0 ? (
            <div
              className="card-base"
              style={{ padding: 24, color: Tokens.mocha }}
            >
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
                  src={getMenuItemImagePath(items[0].id, items[0].category)}
                  fallbackSrc={getMenuItemFallbackPath(items[0].category)}
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
      )}
    </div>
  );
}
