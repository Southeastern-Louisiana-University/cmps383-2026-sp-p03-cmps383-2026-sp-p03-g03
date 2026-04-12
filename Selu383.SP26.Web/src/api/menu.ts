import { useEffect, useState } from "react";
import type {
  ApiMenuCategoryDto,
  ApiMenuItemDto,
  MenuCatalog,
  MenuCategory,
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

function toMenuItem(item: ApiMenuItemDto, categoryName: string): MenuItem {
  return {
    id: item.id,
    name: item.name,
    price: Number(item.basePrice),
    desc: item.description?.trim() || "Freshly prepared to order.",
    category: categoryName,
  };
}

function getFeaturedItems(categories: MenuCategory[]): MenuItem[] {
  const featured: MenuItem[] = [];
  const seen = new Set<number>();

  for (const categoryName of [
    "Drinks",
    "Sweet Crepes",
    "Bagels",
    "Savory Crepes",
  ]) {
    const match = categories.find((category) => category.name === categoryName)
      ?.items[0];
    if (match && !seen.has(match.id)) {
      featured.push(match);
      seen.add(match.id);
    }
    if (featured.length === 3) {
      return featured;
    }
  }

  for (const item of categories.flatMap((category) => category.items)) {
    if (!seen.has(item.id)) {
      featured.push(item);
      seen.add(item.id);
    }
    if (featured.length === 3) {
      break;
    }
  }

  return featured;
}

async function readJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchMenuCatalog(
  signal?: AbortSignal,
): Promise<MenuCatalog> {
  const [categoryDtos, itemDtos] = await Promise.all([
    readJson<ApiMenuCategoryDto[]>("/api/menu/categories", signal),
    readJson<ApiMenuItemDto[]>("/api/menu/items", signal),
  ]);

  const activeCategories = [...categoryDtos]
    .filter((category) => category.isActive)
    .sort((left, right) => compareCategoryNames(left.name, right.name));

  const categoryNames = new Map(
    activeCategories.map((category) => [category.id, category.name]),
  );

  const itemsByCategoryId = new Map<number, MenuItem[]>();
  for (const item of itemDtos) {
    if (!item.isAvailable) {
      continue;
    }

    const categoryName = categoryNames.get(item.categoryId);
    if (!categoryName) {
      continue;
    }

    const categoryItems = itemsByCategoryId.get(item.categoryId) ?? [];
    categoryItems.push(toMenuItem(item, categoryName));
    itemsByCategoryId.set(item.categoryId, categoryItems);
  }

  const categories = activeCategories
    .map((category) => ({
      id: category.id,
      name: category.name,
      isSeasonal: category.isSeasonal,
      isActive: category.isActive,
      items: (itemsByCategoryId.get(category.id) ?? []).sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    }))
    .filter((category) => category.items.length > 0);

  const items = categories.flatMap((category) => category.items);

  return {
    categories,
    items,
    featuredItems: getFeaturedItems(categories),
    defaultCategory: categories[0]?.name ?? "",
  };
}

export function useMenuCatalog() {
  const [catalog, setCatalog] = useState<MenuCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    fetchMenuCatalog(controller.signal)
      .then((nextCatalog) => {
        setCatalog(nextCatalog);
      })
      .catch((nextError: unknown) => {
        if ((nextError as Error).name === "AbortError") {
          return;
        }

        setError("Unable to load the menu right now.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  return {
    categories: catalog?.categories ?? [],
    items: catalog?.items ?? [],
    featuredItems: catalog?.featuredItems ?? [],
    defaultCategory: catalog?.defaultCategory ?? "",
    loading,
    error,
  };
}
