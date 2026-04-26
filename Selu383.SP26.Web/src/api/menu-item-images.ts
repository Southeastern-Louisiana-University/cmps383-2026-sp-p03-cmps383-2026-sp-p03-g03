export function getCategorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/[^\w-]/g, "");
}

export function getItemSlug(itemName: string): string {
  return itemName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/[^\w-]/g, "");
}

export function getItemImagePath(itemName: string): string {
  const slug = getItemSlug(itemName);
  return `/menu-pics/items/${slug}.png`;
}

export function getCategoryIconPath(category: string): string {
  const slug = getCategorySlug(category);
  return `/menu-pics/icons/${slug}.png`;
}

export function getMenuItemImagePath(
  itemName: string,
  itemImagePath?: string,
): string {
  if (itemImagePath) {
    return itemImagePath;
  }
  return getItemImagePath(itemName);
}

export function getMenuItemFallbackPath(
  category: string,
  categoryIconPath?: string,
): string {
  if (categoryIconPath) {
    return categoryIconPath;
  }
  return getCategoryIconPath(category);
}
