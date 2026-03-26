import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getColors } from "@/constants/styles";
import type { MenuItemDto } from "@/services/api";

const MENU_ITEM_IMAGES: Record<string, any> = {
  // Current seeded backend items
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

const DEFAULT_MENU_IMAGE = require("@/assets/images/featured-croissant.jpg.jpg");

interface MenuItemCardProps {
  item: MenuItemDto;
  onPress: (item: MenuItemDto) => void;
}

function getMenuItemImage(name: string) {
  return MENU_ITEM_IMAGES[name] ?? DEFAULT_MENU_IMAGE;
}

export function MenuItemCard({ item, onPress }: MenuItemCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getColors(isDark);
  const itemImage = getMenuItemImage(item.name);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <Image source={itemImage} style={styles.thumbnail} resizeMode="cover" />

        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={styles.name}>{item.name}</ThemedText>
            <ThemedText style={[styles.price, { color: colors.primary }]}>
              ${item.basePrice.toFixed(2)}
            </ThemedText>
          </View>

          {item.description ? (
            <ThemedText
              style={[styles.description, { color: colors.textSecondary }]}
            >
              {item.description}
            </ThemedText>
          ) : null}

          {!item.isAvailable && (
            <ThemedText style={[styles.unavailable, { color: colors.error }]}>
              Currently unavailable
            </ThemedText>
          )}
        </View>
      </View>

      <View style={[styles.addButton, { backgroundColor: colors.primary }]}>
        <ThemedText style={styles.addButtonText}>View Item</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  thumbnail: {
    width: 78,
    height: 78,
    borderRadius: 12,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  unavailable: {
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 8,
  },
  addButton: {
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 6,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
