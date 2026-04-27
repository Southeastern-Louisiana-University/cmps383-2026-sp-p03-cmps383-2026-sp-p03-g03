import React, { useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { MenuCategoryDto } from '@/services/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors, FontFamily } from '@/constants/styles';

interface CategoryTabsProps {
  categories: MenuCategoryDto[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function CategoryTabs({ categories, selectedId, onSelect }: CategoryTabsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const scrollRef = useRef<ScrollView>(null);
  const itemRefs = useRef<Record<number, number>>({});

  useEffect(() => {
    if (selectedId != null && itemRefs.current[selectedId] != null) {
      scrollRef.current?.scrollTo({ x: Math.max(0, itemRefs.current[selectedId] - 16), animated: true });
    }
  }, [selectedId]);

  return (
    <View style={s.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {categories.map((cat) => {
          const active = cat.id === selectedId;
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.7}
              onLayout={(e) => { itemRefs.current[cat.id] = e.nativeEvent.layout.x; }}
              onPress={() => onSelect(cat.id)}
              style={[
                s.tab,
                {
                  backgroundColor: active ? colors.primary : 'transparent',
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  s.tabText,
                  {
                    color: active ? '#fff' : colors.text,
                    fontWeight: active ? '700' : '500',
                  },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FontFamily.bodySemiBold,
    letterSpacing: 0.1,
  },
});
