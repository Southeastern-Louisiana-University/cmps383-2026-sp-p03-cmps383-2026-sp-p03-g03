export function getCategorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace whitespace runs with single hyphen
    .replace(/-+/g, "-") // Collapse multiple hyphens to single hyphen
    .replace(/[^\w-]/g, ""); // Remove non-word characters except hyphen
}

export function getItemImagePath(itemId: number): string {
  return `/menu-pics/items/${itemId}.png`;
}

export function getCategoryIconPath(category: string): string {
  const slug = getCategorySlug(category);
  return `/menu-pics/icons/${slug}.png`;
}

export function getMenuItemImagePath(itemId: number, category: string): string {
  return getItemImagePath(itemId);
}

export function getMenuItemFallbackPath(category: string): string {
  return getCategoryIconPath(category);
}
