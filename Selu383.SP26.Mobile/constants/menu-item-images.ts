import type { ImageSourcePropType } from "react-native";

const MENU_ITEM_IMAGES: Record<string, ImageSourcePropType> = {
  "House Roast": require("@/assets/images/featured-caramel-latte.jpg"),
  "Earl Grey": require("@/assets/images/featured-iced-matcha.jpg.jpg"),
  "Caramel Macchiato": require("@/assets/images/featured-caramel-latte.jpg"),
  "Build Your Own Bagel": require("@/assets/images/breakfest.png"),
  "Custom Savory Crepe": require("@/assets/images/crepe fromage.png"),

  "Iced Latte": require("@/assets/images/featured-caramel-latte.jpg"),
  Supernova: require("@/assets/images/supernova.png"),
  "Roaring Frappe": require("@/assets/images/roaringfrape.png"),
  "Black & White Cold Brew": require("@/assets/images/blackwhitecoldbrew.png"),
  "Strawberry Limeade": require("@/assets/images/strawberry.png"),
  "Shaken Lemonade": require("@/assets/images/shaken.png"),
  "Mannino Honey Crepe": require("@/assets/images/mannino honey crape.png"),
  Downtowner: require("@/assets/images/downtowner.png"),
  "Funky Monkey": require("@/assets/images/funky monkey.png"),
  "Le S'mores": require("@/assets/images/le'smores.png"),
  "Strawberry Fields": require("@/assets/images/s-fileds.png"),
  Bonjour: require("@/assets/images/bonjour.png"),
  "Banana Foster": require("@/assets/images/bannana foster.png"),
  "Matt's Scrambled Eggs": require("@/assets/images/matts.png"),
  "Meanie Mushroom": require("@/assets/images/meanie.png"),
  "Turkey Club": require("@/assets/images/turkeyclub.png"),
  "Green Machine": require("@/assets/images/freenmachince.png"),
  "Perfect Pair": require("@/assets/images/perfectpair.png"),
  "Crepe Fromage": require("@/assets/images/crepe fromage.png"),
  "Farmers Market Crepe": require("@/assets/images/farmermarket.png"),
  "Travis Special": require("@/assets/images/travis sp.png"),
  "Crème Brulage": require("@/assets/images/creme brulage.png"),
  "Creme Brulage": require("@/assets/images/creme brulage.png"),
  "The Fancy One": require("@/assets/images/tfo.png"),
  "Breakfast Bagel": require("@/assets/images/breakfest.png"),
  "The Classic": require("@/assets/images/classic.png"),
};

export const DEFAULT_MENU_IMAGE: ImageSourcePropType = require("@/assets/images/featured-croissant.jpg.jpg");

export function getMenuItemImage(name: string): ImageSourcePropType {
  return MENU_ITEM_IMAGES[name] ?? DEFAULT_MENU_IMAGE;
}
