import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedButton } from '@/components/animated-button';
import { PageHeaderActions } from '@/components/page-header-actions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { CommonStyles, getColors } from '@/constants/styles';
import { getMenuItemImage } from '@/constants/menu-item-images';
import { getMenuItems, type MenuItemDto } from '@/services/api';
import { styles } from '@/styles/screens/index.styles';

type FeaturedItem = {
  id: string;
  image: any;
  name: string;
  price: string;
};

const FALLBACK_FEATURED_ITEMS: FeaturedItem[] = [
  {
    id: '1',
    name: 'Iced Latte',
    image: getMenuItemImage('Iced Latte'),
    price: '$4.95',
  },
  {
    id: '2',
    name: 'Supernova',
    image: getMenuItemImage('Supernova'),
    price: '$6.50',
  },
  {
    id: '3',
    name: 'The Classic',
    image: getMenuItemImage('The Classic'),
    price: '$8.95',
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
      image: getMenuItemImage(item.name),
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
  const hasWorkPortal = !!user?.roles?.some((role) =>
    ['admin', 'manager', 'staff'].includes(role.toLowerCase()),
  );
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
          <View style={styles.topBarRow}>
            <TouchableOpacity
              style={[styles.topMenuButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => router.push('/(tabs)/menu')}
              activeOpacity={0.85}
            >
              <ThemedText style={[styles.topMenuButtonText, { color: colors.text }]}>Menu</ThemedText>
            </TouchableOpacity>

            <View style={styles.topBarActions}>
              <PageHeaderActions showHome={false} showLogout />
            </View>
          </View>

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

            {hasWorkPortal && (
              <TouchableOpacity
                style={[styles.quickPill, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={() => router.push('/portal')}
                activeOpacity={0.85}
              >
                <ThemedText style={[styles.quickPillText, { color: colors.primary }]}>Portal</ThemedText>
              </TouchableOpacity>
            )}
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
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/menu',
                    params: { itemId: item.id },
                  })
                }
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
            <ThemedText style={[styles.footerCopy, { color: colors.textSecondary }]}>Open 6:00 AM - 6:00 PM</ThemedText>
            <ThemedText style={[styles.footerCopy, { color: colors.textSecondary }]}>Featured picks refresh daily</ThemedText>
            <ThemedText style={[styles.footerCopy, { color: colors.textSecondary }]}>Mobile pickup available</ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
