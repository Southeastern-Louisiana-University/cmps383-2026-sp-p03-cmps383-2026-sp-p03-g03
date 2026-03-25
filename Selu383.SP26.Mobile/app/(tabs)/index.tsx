import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedButton } from '@/components/animated-button';
import { PageHeaderActions } from '@/components/page-header-actions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { CommonStyles, getColors } from '@/constants/styles';
import { getMenuItems, type MenuItemDto } from '@/services/api';

const FEATURED_IMAGES = [
  require('@/assets/images/featured-caramel-latte.jpg'),
  require('@/assets/images/featured-iced-matcha.jpg.jpg'),
  require('@/assets/images/featured-croissant.jpg.jpg'),
];

type FeaturedItem = {
  id: string;
  image: any;
  name: string;
  price: string;
};

const FALLBACK_FEATURED_ITEMS: FeaturedItem[] = [
  {
    id: '1',
    image: FEATURED_IMAGES[0],
    name: 'Caramel Latte',
    price: '$4.95',
  },
  {
    id: '2',
    image: FEATURED_IMAGES[1],
    name: 'Iced Matcha',
    price: '$5.25',
  },
  {
    id: '3',
    image: FEATURED_IMAGES[2],
    name: 'Butter Croissant',
    price: '$3.50',
  },
];

function getDaySeed() {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function buildDailyFeatured(menuItems: MenuItemDto[]): FeaturedItem[] {
  const available = menuItems.filter((item) => item.isAvailable);
  if (available.length === 0) {
    return FALLBACK_FEATURED_ITEMS;
  }

  const picksCount = Math.min(3, available.length);
  const seed = getDaySeed();
  const startIndex = seed % available.length;

  return Array.from({ length: picksCount }, (_, index) => {
    const item = available[(startIndex + index) % available.length];
    return {
      id: String(item.id),
      image: FEATURED_IMAGES[index % FEATURED_IMAGES.length],
      name: item.name,
      price: `$${item.basePrice.toFixed(2)}`,
    };
  });
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const { user } = useAuth();
  const router = useRouter();
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>(FALLBACK_FEATURED_ITEMS);

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedItems = async () => {
      try {
        const menuItems = await getMenuItems();
        const dailyItems = buildDailyFeatured(menuItems);
        if (isMounted) {
          setFeaturedItems(dailyItems);
        }
      } catch {
        if (isMounted) {
          setFeaturedItems(FALLBACK_FEATURED_ITEMS);
        }
      }
    };

    loadFeaturedItems();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={CommonStyles.scrollContent}>
        <ThemedView style={CommonStyles.container}>
          <PageHeaderActions showHome={false} showLogout />
          <View style={styles.heroWrap}>
            <Image
              source={require('@/assets/images/ConceptLogo2-FpjOWRtT.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <ThemedText style={[styles.welcome, { color: colors.primary }]}>Caffeinated Lions</ThemedText>
            <ThemedText style={[styles.tagline, { color: colors.textSecondary }]}>Pouring pride into every cup.</ThemedText>

            {user && (
              <ThemedText style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back, {user.displayName || user.userName}</ThemedText>
            )}
          </View>

          <AnimatedButton
            style={[styles.primaryAction, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/menu')}
          >
            <ThemedText style={[styles.primaryActionText, { color: '#ffffff' }]}>Start Order</ThemedText>
          </AnimatedButton>

          <AnimatedButton
            style={[styles.secondaryAction, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/reservations')}
          >
            <ThemedText style={[styles.secondaryActionText, { color: colors.text }]}>Book a Table</ThemedText>
          </AnimatedButton>

          <View style={styles.quickRow}>
            <TouchableOpacity
              style={[styles.quickPill, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => router.push('/(tabs)/cart')}
              activeOpacity={0.85}
            >
              <ThemedText style={[styles.quickPillText, { color: colors.text }]}>Cart</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickPill, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => router.push('/(tabs)/orders')}
              activeOpacity={0.85}
            >
              <ThemedText style={[styles.quickPillText, { color: colors.text }]}>Orders</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickPill, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => router.push('/(tabs)/account')}
              activeOpacity={0.85}
            >
              <ThemedText style={[styles.quickPillText, { color: colors.text }]}>Account</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
            <View style={styles.summaryRow}>
              <View style={styles.summaryBlock}>
                <ThemedText style={styles.summaryLabel}>Points</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: colors.primary }]}>{user?.loyaltyPoints ?? 0} pts</ThemedText>
              </View>

              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

              <View style={styles.summaryBlock}>
                <ThemedText style={styles.summaryLabel}>Status</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: colors.text }]}>Ready</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Featured Today</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/menu')} activeOpacity={0.8}>
              <ThemedText style={[styles.sectionLink, { color: colors.primary }]}>See all</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.featuredList}>
            {featuredItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.featuredCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={() => router.push('/(tabs)/menu')}
                activeOpacity={0.85}
              >
                <Image source={item.image} style={styles.featuredImage} resizeMode="cover" />
                <View style={styles.featuredInfo}>
                  <ThemedText style={[styles.featuredName, { color: colors.text }]}>{item.name}</ThemedText>
                  <ThemedText style={[styles.featuredPrice, { color: colors.primary }]}>{item.price}</ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.footerCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
            <ThemedText style={[styles.footerTitle, { color: colors.text }]}>Today</ThemedText>
            <ThemedText style={[styles.footerCopy, { color: colors.textSecondary }]}>Open 7:00 AM - 9:00 PM</ThemedText>
            <ThemedText style={[styles.footerCopy, { color: colors.textSecondary }]}>Featured picks refresh daily</ThemedText>
            <ThemedText style={[styles.footerCopy, { color: colors.textSecondary }]}>Mobile pickup available</ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 2,
  },
  logo: {
    width: 108,
    height: 108,
    marginBottom: 4,
  },
  welcome: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Oregano_400Regular',
    textAlign: 'center',
    marginBottom: 0,
  },
  tagline: {
    fontSize: 17,
    fontFamily: 'Corben_400Regular',
    textAlign: 'center',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 15,
    fontFamily: 'Corben_400Regular',
    textAlign: 'center',
  },
  primaryAction: {
    borderRadius: 14,
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryActionText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 22,
  },
  secondaryAction: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryActionText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 20,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 12,
  },
  quickPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPillText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryBlock: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 46,
    marginHorizontal: 14,
    opacity: 0.9,
  },
  summaryLabel: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
    opacity: 0.85,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 26,
    fontFamily: 'Oregano_400Regular',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Corben_700Bold',
    fontSize: 18,
  },
  sectionLink: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
  },
  featuredList: {
    gap: 8,
    marginBottom: 14,
  },
  featuredCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredImage: {
    width: 34,
    height: 34,
    borderRadius: 8,
    marginRight: 10,
  },
  featuredInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  featuredName: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
  },
  featuredPrice: {
    fontFamily: 'Corben_700Bold',
    fontSize: 16,
  },
  footerCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  footerTitle: {
    fontFamily: 'Corben_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  footerCopy: {
    fontFamily: 'Corben_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
});

