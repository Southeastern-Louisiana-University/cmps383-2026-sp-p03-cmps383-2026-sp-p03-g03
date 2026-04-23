import { useMemo } from "react";
import useApiReadOrDelete from "../hooks/useApiReadOrDelete";
import type {
  ApiMenuCategoryDto,
  ApiMenuItemDto,
  MenuCatalog,
  MenuItem,
} from "./dto-interfaces";

const CATEGORY_ORDER = ["Drinks", "Sweet Crepes", "Savory Crepes", "Bagels"];

function compareCategoryNames(left: string, right: string) {
  const leftIndex = CATEGORY_ORDER.indexOf(left);
  const rightIndex = CATEGORY_ORDER.indexOf(right);

  if (leftIndex >= 0 && rightIndex >= 0) {
    return leftIndex - rightIndex;
  }

  if (leftIndex >= 0) {
    return -1;
  }

  if (rightIndex >= 0) {
    return 1;
  }

  return left.localeCompare(right);
}

function toMenuItem(
  item: ApiMenuItemDto,
  categoryName: string,
  categoryIconPath?: string,
): MenuItem {
  return {
    id: item.id,
    name: item.name,
    price: Number(item.basePrice),
    desc: item.description?.trim() || "Freshly prepared to order.",
    category: categoryName,
    imagePath: item.imagePath,
    categoryIconPath,
  };
}

export function useMenuCatalog() {
  // Fire off both hooks concurrently
  const {
    data: categoryDtos,
    loading: catLoading,
    error: catError,
  } = useApiReadOrDelete<ApiMenuCategoryDto[]>("GET", "menu/categories");
  const {
    data: itemDtos,
    loading: itemLoading,
    error: itemError,
  } = useApiReadOrDelete<ApiMenuItemDto[]>("GET", "menu/items");

  const catalog = useMemo<MenuCatalog>(() => {
    if (!categoryDtos || !itemDtos) {
      return {
        categories: [],
        items: [],
        featuredItems: [],
        defaultCategory: "",
      };
    }

    // Sort active categories
    const activeCategories = [...categoryDtos]
      .filter((category) => category.isActive)
      .sort((left, right) => compareCategoryNames(left.name, right.name));

    const categoryNames = new Map(
      activeCategories.map((category) => [category.id, category.name]),
    );

    const categoryIcons = new Map(
      activeCategories.map((category) => [category.id, category.iconPath]),
    );

    // Group items
    const itemsByCategoryId = new Map<number, MenuItem[]>();
    for (const item of itemDtos) {
      if (!item.isAvailable) {
        continue;
      }

      const categoryName = categoryNames.get(item.categoryId);
      if (!categoryName) {
        continue;
      }

      const categoryIconPath = categoryIcons.get(item.categoryId);
      const categoryItems = itemsByCategoryId.get(item.categoryId) ?? [];
      categoryItems.push(toMenuItem(item, categoryName, categoryIconPath));
      itemsByCategoryId.set(item.categoryId, categoryItems);
    }

    // Build final category array
    const categories = activeCategories
      .map((category) => ({
        id: category.id,
        name: category.name,
        iconPath: category.iconPath,
        isSeasonal: category.isSeasonal,
        isActive: category.isActive,
        items: (itemsByCategoryId.get(category.id) ?? []).sort((left, right) =>
          left.name.localeCompare(right.name),
        ),
      }))
      .filter((category) => category.items.length > 0);

    // Flatten all items
    const allItems = categories.flatMap((category) => category.items);

    // Shuffle and grab 5 random items for the carousel
    const featuredItems = [...allItems]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    return {
      categories,
      items: allItems,
      featuredItems,
      defaultCategory: categories[0]?.name ?? "",
    };
  }, [categoryDtos, itemDtos]);

  return {
    ...catalog,
    loading: catLoading || itemLoading,
    error: catError || itemError,
  };
}
