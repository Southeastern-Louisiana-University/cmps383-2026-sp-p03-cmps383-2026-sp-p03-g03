import React from "react";
import { View, StyleSheet, TouchableOpacity, Image, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getColors, FontFamily } from "@/constants/styles";
import { getMenuItemImage } from "@/constants/menu-item-images";
import type { MenuItemDto } from "@/services/api";

interface MenuItemCardProps {
  item: MenuItemDto;
  onPress: (item: MenuItemDto) => void;
  highlighted?: boolean;
  categoryName?: string;
}

export function MenuItemCard({ item, onPress, highlighted, categoryName }: MenuItemCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getColors(isDark);
  const remoteImageUri = item.imagePath?.trim();
  const itemImage = remoteImageUri
    ? { uri: remoteImageUri }
    : getMenuItemImage(item.name, categoryName);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: highlighted ? colors.primary : colors.border,
          opacity: item.isAvailable ? 1 : 0.65,
        },
        highlighted && { borderWidth: 2 },
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <Image source={itemImage} style={styles.thumbnail} resizeMode="cover" />

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.name, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={[styles.price, { color: colors.primary }]}>
            ${item.basePrice.toFixed(2)}
          </Text>
        </View>

        {item.description ? (
          <Text
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        ) : null}

        {!item.isAvailable && (
          <Text style={[styles.unavailable, { color: colors.error }]}>
            {item.unavailableReason || "Currently unavailable"}
          </Text>
        )}

        <View style={styles.footer}>
          {item.isAvailable ? (
            <View style={[styles.addChip, { backgroundColor: colors.primary }]}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addText}>Add</Text>
            </View>
          ) : (
            <View style={[styles.addChip, { backgroundColor: colors.border }]}>
              <Text style={[styles.addText, { color: colors.textSecondary }]}>Unavailable</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    height: 115,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: 'rgba(58,46,31,0.8)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  thumbnail: {
    width: 105,
    height: 115,
  },
  body: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: FontFamily.bodyBold,
    flex: 1,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: FontFamily.bodyBold,
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: FontFamily.body,
    marginBottom: 6,
  },
  unavailable: {
    fontSize: 11,
    fontStyle: "italic",
    fontFamily: FontFamily.body,
    marginBottom: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  addChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    gap: 3,
  },
  addText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: FontFamily.bodySemiBold,
  },
});