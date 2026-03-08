import { useState, useEffect } from "react";
import type { MenuCategoryInterface, MenuItemInterface } from "../Interfaces";

function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItemInterface[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategoryInterface[]>(
    [],
  );

  useEffect(() => {
    fetch("/api/menu/categories")
      .then((response) => response.json() as Promise<MenuCategoryInterface[]>)
      .then((data) => setMenuCategories(data));

    fetch("/api/menu/items")
      .then((response) => response.json() as Promise<MenuItemInterface[]>)
      .then((data) => setMenuItems(data));
  }, []);

  return (
    <div>
      <h1>Menu</h1>
      <p>Currently displaying menu items from location 1 for testing.</p>
      {menuCategories.map((category) => (
        <>
          <h1>{category.name}</h1>
          <div key={category.id} className="menu-category card">
            <div className="menu-items">
              {menuItems
                .filter((item) => item.categoryId === category.id)
                .map((item) => (
                  <div key={item.id} className="menu-item">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <p>${item.basePrice.toFixed(2)}</p>
                  </div>
                ))}
            </div>
          </div>
        </>
      ))}
    </div>
  );
}

export default Menu;
