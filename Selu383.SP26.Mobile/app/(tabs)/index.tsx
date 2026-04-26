import React from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PageHeaderActions } from '@/components/page-header-actions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { CommonStyles, getColors } from '@/constants/styles';
import { getUserPermissions } from '@/utils/role-helpers';
import { styles } from '@/styles/screens/index.styles';

const BENEFITS = [
  { icon: 'cafe-outline' as const, title: 'Made Fresh', desc: 'Made fresh by our baristas.' },
  { icon: 'timer-outline' as const, title: 'Quick Pickup', desc: 'Order ahead, skip the line.' },
  { icon: 'gift-outline' as const, title: 'Rewards', desc: 'Earn points on every sip.' },
];

type QuickAction = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  badge?: number;
  accent?: boolean;
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const { user, isGuest } = useAuth();
  const { cart } = useCart();
  const router = useRouter();

  const { isPrivileged: hasWorkPortal } = getUserPermissions(user?.roles);

  const quickActions: QuickAction[] = hasWorkPortal
    ? [
        { icon: 'briefcase-outline' as const, label: 'Portal', route: '/(tabs)/portal', accent: true },
      ]
    : [
        { icon: 'cart-outline', label: 'Cart', route: '/(tabs)/cart', badge: cart.reduce((s, c) => s + c.quantity, 0) },
        { icon: 'receipt-outline', label: 'Orders', route: '/(tabs)/orders' },
        { icon: 'star-outline', label: 'Rewards', route: '/(tabs)/account' },
        { icon: 'calendar-outline' as const, label: 'Book', route: '/(tabs)/reservations' },
      ];

  const greetingText = user
    ? `Welcome back, ${user.displayName || user.userName}`
    : isGuest
      ? 'Browsing as Guest'
      : '';

  return (
    <SafeAreaView style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={CommonStyles.scrollContent}>
        <ThemedView style={CommonStyles.container}>
          <View style={styles.topBarRow}>
            <TouchableOpacity
              style={styles.brandTouchable}
              onPress={() => router.push('/splash?manual=1' as any)}
              activeOpacity={0.7}
            >
              <Image
                source={require('@/assets/images/ConceptLogo2-FpjOWRtT.png')}
                style={styles.brandLogo}
                resizeMode="contain"
              />
              <ThemedText style={[styles.brandName, { color: colors.text }]}>Caffeinated Lions</ThemedText>
            </TouchableOpacity>
            <PageHeaderActions showHome={false} showLogout inline />
          </View>

          <View style={styles.heroWrap}>
            <Image
              source={require('@/assets/images/featured-caramel-latte.jpg')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={[styles.heroOverlay, { backgroundColor: 'rgba(44,36,25,0.55)' }]} />

            <View style={styles.heroContent}>
              {greetingText !== '' && (
                <ThemedText style={styles.greeting}>{greetingText}</ThemedText>
              )}
              <ThemedText style={styles.heroTitle}>Bold brews to fuel the pride.</ThemedText>
              <ThemedText style={styles.heroSubtitle}>Fresh coffee, crepes & bagels — made with love.</ThemedText>
              <View style={styles.heroCtas}>
                <TouchableOpacity
                  style={[styles.heroPrimaryBtn, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/(tabs)/menu')}
                  activeOpacity={0.85}
                >
                  <ThemedText style={styles.heroPrimaryText}>View Menu</ThemedText>
                </TouchableOpacity>
                {!hasWorkPortal && (
                  <TouchableOpacity
                    style={styles.heroOutlineBtn}
                    onPress={() => router.push('/(tabs)/account')}
                    activeOpacity={0.85}
                  >
                    <ThemedText style={styles.heroOutlineText}>Account</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View style={styles.quickActionsRow}>
            {quickActions.map((qa) => (
              <TouchableOpacity
                key={qa.label}
                style={styles.quickActionItem}
                onPress={() => router.push(qa.route as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionCircle, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <Ionicons name={qa.icon} size={24} color={qa.accent ? colors.primary : colors.text} />
                  {(qa.badge ?? 0) > 0 && (
                    <View style={[styles.quickActionBadge, { backgroundColor: colors.primary }]}>
                      <ThemedText style={styles.quickActionBadgeText}>{qa.badge}</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={[styles.quickActionLabel, { color: qa.accent ? colors.primary : colors.textSecondary }]}>
                  {qa.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {!hasWorkPortal && (
          <View style={styles.featureBenefitsRow}>
            {BENEFITS.map((b) => (
              <View key={b.title} style={[styles.featureBenefitCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <View style={[styles.featureBenefitIconWrap, { backgroundColor: isDark ? 'rgba(101,163,13,0.15)' : 'rgba(101,163,13,0.1)' }]}>
                  <Ionicons name={b.icon} size={20} color={colors.primary} />
                </View>
                <ThemedText style={[styles.featureBenefitTitle, { color: colors.text }]}>{b.title}</ThemedText>
                <ThemedText style={[styles.featureBenefitDesc, { color: colors.textSecondary }]}>{b.desc}</ThemedText>
              </View>
            ))}
          </View>
          )}

          {!hasWorkPortal && (
          <TouchableOpacity
            style={[styles.rewardsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/account')}
            activeOpacity={0.85}
          >
            <View style={[styles.rewardsIconWrap, { backgroundColor: isDark ? 'rgba(101,163,13,0.15)' : 'rgba(101,163,13,0.1)' }]}>
              <Ionicons name="trophy" size={26} color={colors.primary} />
            </View>
            <View style={styles.rewardsTextWrap}>
              <ThemedText style={[styles.rewardsTitle, { color: colors.text }]}>
                {user && !isGuest ? 'Rewards' : 'Join Rewards'}
              </ThemedText>
              <ThemedText style={[styles.rewardsSubtitle, { color: colors.textSecondary }]}>
                {user && !isGuest
                  ? 'Earn points on every order. Redeem for free drinks & crepes.'
                  : 'Sign in to earn points on every purchase and unlock free items.'}
              </ThemedText>
            </View>
            {user && !isGuest && (
              <View style={styles.rewardsPoints}>
                <ThemedText style={[styles.rewardsPointsValue, { color: colors.primary }]}>{user.loyaltyPoints ?? 0}</ThemedText>
                <ThemedText style={[styles.rewardsPointsLabel, { color: colors.textSecondary }]}>Points</ThemedText>
              </View>
            )}
          </TouchableOpacity>
          )}

          {!hasWorkPortal && (
            <View style={[styles.reservationCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={styles.reservationImageWrap}>
                <Image
                  source={require('@/assets/images/table.jpg')}
                  style={styles.reservationImage}
                  resizeMode="cover"
                />
                <View style={[styles.reservationOverlay, { backgroundColor: 'rgba(44,36,25,0.45)' }]} />
              </View>
              <View style={[styles.reservationContent, { backgroundColor: colors.cardBackground }]}>
                <ThemedText style={[styles.reservationTitle, { color: colors.text }]}>Dine with the Pride</ThemedText>
                <ThemedText style={[styles.reservationSubtitle, { color: colors.textSecondary }]}>
                  Reserve a table at any Caffeinated Lions location.
                </ThemedText>
                <TouchableOpacity
                  style={[styles.reservationBtn, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/(tabs)/reservations')}
                  activeOpacity={0.85}
                >
                  <ThemedText style={styles.reservationBtnText}>Reserve a Table</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={[styles.footerCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.footerRow}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <ThemedText style={[styles.footerCopy, { color: colors.textSecondary }]}>Open 6:00 AM – 6:00 PM</ThemedText>
            </View>
            <View style={styles.footerRow}>
              <Ionicons name="refresh-outline" size={16} color={colors.textSecondary} />
              <ThemedText style={[styles.footerCopy, { color: colors.textSecondary }]}>Fresh brews and bites served daily</ThemedText>
            </View>
            <View style={styles.footerRow}>
              <Ionicons name="phone-portrait-outline" size={16} color={colors.textSecondary} />
              <ThemedText style={[styles.footerCopy, { color: colors.textSecondary }]}>Mobile pickup available</ThemedText>
            </View>
          </View>

        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
