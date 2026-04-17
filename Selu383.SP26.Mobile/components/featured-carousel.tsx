import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { getMenuItemImage } from '@/constants/menu-item-images';
import { styles } from '@/styles/screens/featured-carousel.styles';

const BG_COLORS = ['#4A3B32', '#2A3C24', '#6B4423', '#382E29'];

const ALL_FEATURED_ITEMS = [
  { name: 'Caramel Macchiato', category: 'Drinks', desc: 'Rich espresso with vanilla and caramel drizzle over steamed milk.', price: 5.25 },
  { name: 'Iced Latte', category: 'Drinks', desc: 'Smooth espresso poured over cold milk and ice.', price: 4.75 },
  { name: 'Supernova', category: 'Drinks', desc: 'A bold energy blend with tropical fruit and sparkling refreshment.', price: 5.50 },
  { name: 'Roaring Frappe', category: 'Drinks', desc: 'Frozen blended coffee with whipped cream and chocolate drizzle.', price: 6.00 },
  { name: 'Strawberry Limeade', category: 'Drinks', desc: 'Fresh strawberry and lime shaken for a refreshing twist.', price: 5.00 },
  { name: 'Crepe Fromage', category: 'Crepes - Savory', desc: 'A warm crepe filled with melted cheese and herbs.', price: 8.00 },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.72;
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
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ isDark = false }) => {
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
            <View
              key={item.name}
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
              <Image source={getMenuItemImage(item.name)} style={styles.itemImage} />
              <View style={styles.imageShade} />
              <View style={styles.itemContent}>
                <Text style={styles.itemCategory}>{item.category.toUpperCase()}</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>{item.desc}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </View>
            </View>
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
              { backgroundColor: i === currentIndex ? '#4CAF50' : 'rgba(255,255,255,0.4)' },
            ]}
          />
        ))}
      </View>
    </View>
  );
};
