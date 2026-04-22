# Menu Item Images

This folder contains images for menu items and category icons.

## Folder Structure

```
menu-pics/
├── icons/       (Category default icons)
│   ├── drinks.svg
│   ├── sweet-crepes.svg
│   ├── savory-crepes.svg
│   └── bagels.svg
└── items/       (Item-specific images)
    ├── 1.jpg    (Item ID 1)
    ├── 2.jpg    (Item ID 2)
    └── ...
```

## Image Guidelines

### Category Icons (`icons/` folder)

- **Format:** SVG
- **Size:** 56px × 56px (or larger, will scale)
- **Naming:** Category name converted to lowercase with hyphens
  - Example: "Sweet Crepes" → `sweet-crepes.svg`
- **Purpose:** Default fallback image when item-specific image is not available

### Item Images (`items/` folder)

- **Format:** JPG (or PNG)
- **Size:** 56px × 56px for item cards, 220px × 180px for featured card
- **Naming:** Item ID as filename
  - Example: Item with ID `42` → `42.jpg`
- **Purpose:** Item-specific images displayed in the menu

## How It Works

1. Menu loads and tries to display item-specific image from `items/{itemId}.jpg`
2. If item image doesn't exist, falls back to category icon from `icons/{category}.svg`
3. If both fail, displays generic error icon

## Adding New Items

1. Create item image in `items/` folder
2. Name it with the item's database ID
3. No code changes needed - the menu will automatically pick it up

## Category Slugs

| Category      | Slug          |
| ------------- | ------------- |
| Drinks        | drinks        |
| Sweet Crepes  | sweet-crepes  |
| Savory Crepes | savory-crepes |
| Bagels        | bagels        |
