import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { getMenuItemImage } from '@/constants/menu-item-images';
import { styles } from '@/styles/screens/featured-carousel.styles';

const BG_COLORS = ['#4A3B32', '#3B4A2E', '#6B4423', '#2a2018', '#3d2e1f', '#2e3b22'];

const ALL_FEATURED_ITEMS = [
  { name: 'Black & White Cold Brew', category: 'Drinks', desc: 'Smooth cold brew with a swirl of sweet cream.', price: 5.25 },
  { name: 'Crepe Fromage', category: 'Crepes - Savory', desc: 'A warm crepe filled with melted cheese and herbs.', price: 8.00 },
  { name: 'Supernova', category: 'Drinks', desc: 'A bold energy blend with tropical fruit and sparkling refreshment.', price: 5.50 },
  { name: 'Breakfast Bagel', category: 'Bagels', desc: 'Toasted bagel with egg, cheese, and your choice of protein.', price: 7.50 },
  { name: 'Roaring Frappe', category: 'Drinks', desc: 'Frozen blended coffee with whipped cream and chocolate drizzle.', price: 6.00 },
  { name: 'Mannino Honey Crepe', category: 'Crepes - Sweet', desc: 'Sweet crepe drizzled with local honey and powdered sugar.', price: 9.00 },
  { name: 'Shaken Lemonade', category: 'Drinks', desc: 'Hand-shaken lemonade with a bright citrus kick.', price: 4.50 },
  { name: 'Downtowner', category: 'Bagels', desc: 'A hearty downtown-inspired bagel loaded with savory toppings.', price: 8.50 },
  { name: 'Strawberry Limeade', category: 'Drinks', desc: 'Fresh strawberry and lime shaken for a refreshing twist.', price: 5.00 },
  { name: 'Le S\'mores', category: 'Crepes - Sweet', desc: 'Graham cracker, chocolate, and toasted marshmallow crepe.', price: 9.50 },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.74;
const CARD_SPACING = 14;
const AUTO_SCROLL_INTERVAL = 4000;

/** Rotate the list so a different item is first each day */
function getDailyItems() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const offset = dayOfYear % ALL_FEATURED_ITEMS.length;
  return [...ALL_FEATURED_ITEMS.slice(offset), ...ALL_FEATURED_ITEMS.slice(0, offset)];
}

interface FeaturedCarouselProps {
  isDark?: boolean;
  onItemPress?: (itemName: string) => void;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ isDark = false, onItemPress }) => {
  const items = useRef(getDailyItems()).current;
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const isUserScrolling = useRef(false);

  const scrollToIndex = (index: number) => {
    scrollRef.current?.scrollTo({
      x: index * (CARD_WIDTH + CARD_SPACING),
      animated: true,
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (isUserScrolling.current) return;
      const next = (currentIndexRef.current + 1) % items.length;
      currentIndexRef.current = next;
      setCurrentIndex(next);
      scrollToIndex(next);
    }, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(timer);
  }, [items.length]);

  const handleScrollEnd = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_SPACING));
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    currentIndexRef.current = clamped;
    setCurrentIndex(clamped);
    isUserScrolling.current = false;
  };

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        onScrollBeginDrag={() => { isUserScrolling.current = true; }}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{ paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 }}
      >
        {items.map((item, index) => {
          const bgColor = BG_COLORS[index % BG_COLORS.length];
          const isActive = index === currentIndex;
          return (
            <TouchableOpacity
              key={item.name}
              activeOpacity={0.9}
              onPress={() => onItemPress?.(item.name)}
              style={[
                styles.itemCard,
                {
                  width: CARD_WIDTH,
                  marginRight: CARD_SPACING,
                  backgroundColor: bgColor,
                  shadowColor: bgColor,
                  opacity: isActive ? 1 : 0.9,
                  transform: [{ scale: isActive ? 1 : 0.98 }],
                },
              ]}
            >
              <View style={styles.cardInner}>
                <View style={styles.imageWrap}>
                  <Image source={getMenuItemImage(item.name)} style={styles.itemImage} />
                  <View style={styles.imageShade} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemCategory}>{item.category.toUpperCase()}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDesc} numberOfLines={2}>{item.desc}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => {
            const prev = (currentIndex - 1 + items.length) % items.length;
            currentIndexRef.current = prev;
            setCurrentIndex(prev);
            scrollToIndex(prev);
          }}
        >
          <Text style={styles.navBtnText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => {
            const next = (currentIndex + 1) % items.length;
            currentIndexRef.current = next;
            setCurrentIndex(next);
            scrollToIndex(next);
          }}
        >
          <Text style={styles.navBtnText}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dotsContainer}>
        {items.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === currentIndex ? '#65a30d' : 'rgba(255,255,255,0.35)' },
            ]}
          />
        ))}
      </View>
    </View>
  );
};
