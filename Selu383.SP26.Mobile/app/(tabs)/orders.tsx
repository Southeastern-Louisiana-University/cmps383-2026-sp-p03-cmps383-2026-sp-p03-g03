import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CommonStyles, getColors } from "@/constants/styles";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function OrdersScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getColors(isDark);

  return (
    <SafeAreaView
      style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}
    >
      <ThemedView style={CommonStyles.container}>
        <View
          style={[
            CommonStyles.card,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <ThemedText style={CommonStyles.cardTitle}>Orders</ThemedText>
          <ThemedText style={CommonStyles.value}>
            Orders feature coming soon.
          </ThemedText>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}
