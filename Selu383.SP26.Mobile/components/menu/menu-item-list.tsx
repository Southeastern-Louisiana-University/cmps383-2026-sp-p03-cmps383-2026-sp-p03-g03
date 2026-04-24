import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedButton } from '@/components/animated-button';
import { MenuItemCard } from '@/components/menu-item-card';
import { ThemedText } from '@/components/themed-text';
import { getColors } from '@/constants/styles';
import { styles } from '@/styles/screens/menu.styles';
import type { MenuItemDto } from '@/services/api';

type Props = {
  colors: ReturnType<typeof getColors>;
  filteredItems: MenuItemDto[];
  highlightedItemId: number | null;
  searchQuery: string;
  hasMenuOpsAccess: boolean;
  updatingItemId: number | null;
  onSelectItem: (item: MenuItemDto) => void;
  onDisableItem: (item: MenuItemDto) => void;
  onEnableItem: (item: MenuItemDto) => void;
  onDeleteItem: (item: MenuItemDto) => void;
};

export function MenuItemList({
  colors,
  filteredItems,
  highlightedItemId,
  searchQuery,
  hasMenuOpsAccess,
  updatingItemId,
  onSelectItem,
  onDisableItem,
  onEnableItem,
  onDeleteItem,
}: Props) {
  if (filteredItems.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="cafe-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {searchQuery
            ? `No results for "${searchQuery}"`
            : 'No items available in this category.'}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
        {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
      </Text>

      {highlightedItemId && filteredItems.some((item) => item.id === highlightedItemId) ? (
        <Text style={[styles.featuredHint, { color: colors.primary }]}>
          Showing your selected item first
        </Text>
      ) : null}

      {filteredItems.map((item) => (
        <View key={item.id}>
          <MenuItemCard
            item={item}
            onPress={onSelectItem}
            highlighted={highlightedItemId === item.id}
          />

          {hasMenuOpsAccess ? (
            <View style={styles.managerRow}>
              {item.isAvailable ? (
                <AnimatedButton
                  style={[
                    styles.managerButton,
                    {
                      backgroundColor: '#ef4444',
                      opacity: updatingItemId === item.id ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => onDisableItem(item)}
                  disabled={updatingItemId === item.id}
                >
                  <ThemedText style={styles.managerButtonText}>Disable</ThemedText>
                </AnimatedButton>
              ) : (
                <AnimatedButton
                  style={[
                    styles.managerButton,
                    {
                      backgroundColor: '#10b981',
                      opacity: updatingItemId === item.id ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => onEnableItem(item)}
                  disabled={updatingItemId === item.id}
                >
                  <ThemedText style={styles.managerButtonText}>Enable</ThemedText>
                </AnimatedButton>
              )}
              <AnimatedButton
                style={[
                  styles.managerButton,
                  {
                    backgroundColor: '#8b5cf6',
                    opacity: updatingItemId === item.id ? 0.7 : 1,
                  },
                ]}
                onPress={() => onDeleteItem(item)}
                disabled={updatingItemId === item.id}
              >
                <ThemedText style={styles.managerButtonText}>Delete</ThemedText>
              </AnimatedButton>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}
