import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getColors } from "@/constants/styles";
import { getMenuItemImage } from "@/constants/menu-item-images";
import type { MenuItemDto } from "@/services/api";

interface MenuItemCardProps {
  item: MenuItemDto;
  onPress: (item: MenuItemDto) => void;
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
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          opacity: item.isAvailable ? 1 : 0.75,
        },
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
              {item.unavailableReason || "Currently unavailable"}
            </ThemedText>
          )}
        </View>
      </View>

      <View
        style={[
          styles.addButton,
          {
            backgroundColor: item.isAvailable
              ? colors.primary
              : colors.border,
          },
        ]}
      >
        <ThemedText style={styles.addButtonText}>
          {item.isAvailable ? "Add to Cart" : "Unavailable"}
        </ThemedText>
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