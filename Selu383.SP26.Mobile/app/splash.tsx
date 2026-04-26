import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Modal,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { getColors } from '@/constants/styles';
import { getMenuItemImage } from '@/constants/menu-item-images';
import { ThemedText } from '@/components/themed-text';
import { Header } from '@/components/splash-header';
import { styles } from '@/styles/screens/splash.styles';
import { getMenuItems, getMenuCategories, type MenuItemDto, type MenuCategoryDto } from '@/services/api';
import { getUserPermissions } from '@/utils/role-helpers';

type PopularItem = {
  id: number;
  name: string;
  category: string;
  desc: string;
  price: number;
  image: any;
};

const FALLBACK_POPULAR: PopularItem[] = [
  { id: 0, name: 'Black & White Cold Brew', category: 'Drinks', desc: 'Smooth cold brew with a swirl of sweet cream.', price: 5.25, image: getMenuItemImage('Black & White Cold Brew') },
  { id: 1, name: 'Supernova', category: 'Drinks', desc: 'A bold energy blend with tropical fruit and sparkling refreshment.', price: 5.50, image: getMenuItemImage('Supernova') },
  { id: 2, name: 'Roaring Frappe', category: 'Drinks', desc: 'Frozen blended coffee with whipped cream and chocolate drizzle.', price: 6.00, image: getMenuItemImage('Roaring Frappe') },
  { id: 3, name: 'Crepe Fromage', category: 'Crepes', desc: 'A warm crepe filled with melted cheese and herbs.', price: 8.00, image: getMenuItemImage('Crepe Fromage') },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PICK_CARD_WIDTH = Math.min(SCREEN_WIDTH - 72, 310);
const PICK_CARD_SPACING = 14;
const PICK_AUTO_SCROLL_INTERVAL = 4000;

function getDaySeed() {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function createSeededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function buildPopularItems(menuItems: MenuItemDto[], categories: MenuCategoryDto[]): PopularItem[] {
  const available = menuItems.filter((item) => item.isAvailable);
  if (available.length === 0) return FALLBACK_POPULAR;

  const catMap = new Map(categories.map((category) => [category.id, category.name]));
  const count = Math.min(4, available.length);
  const random = createSeededRandom(getDaySeed());
  const shuffled = [...available];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, count).map((item) => {
    return {
      id: item.id,
      name: item.name,
      category: catMap.get(item.categoryId) ?? '',
      desc: item.description ?? '',
      price: item.basePrice,
      image: getMenuItemImage(item.name),
    };
  });
}

export default function SplashScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const { user, isLoading, isGuest, login, register, continueAsGuest } = useAuth();
  const router = useRouter();
  const { manual } = useLocalSearchParams<{ manual?: string }>();
  const isManualVisit = manual === '1';
  const { isPrivileged } = getUserPermissions(user?.roles);

  const [loginVisible, setLoginVisible] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [popularItems, setPopularItems] = useState<PopularItem[]>(FALLBACK_POPULAR);
  const picksScrollRef = useRef<ScrollView>(null);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const currentPickIndexRef = useRef(0);
  const isUserScrollingPicks = useRef(false);

  // auto-navigate if already logged in (unless user manually came back here)
  const pendingRoute = useRef<string | null>(null);

  useEffect(() => {
    if (isManualVisit) return;
    if ((user || isGuest) && !isLoading) {
      const defaultRoute = isPrivileged ? '/(tabs)/portal' : '/(tabs)';
      const dest = pendingRoute.current || defaultRoute;
      pendingRoute.current = null;
      router.replace(dest as any);
    }
  }, [user, isGuest, isLoading, router, isManualVisit, isPrivileged]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [items, categories] = await Promise.all([getMenuItems(), getMenuCategories()]);
        if (alive) {
          setPopularItems(buildPopularItems(items, categories));
        }
      } catch {
        /* keep fallback */
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    currentPickIndexRef.current = 0;
    setCurrentPickIndex(0);
  }, [popularItems]);

  useEffect(() => {
    if (popularItems.length <= 1) {
      return () => {};
    }

    const timer = setInterval(() => {
      if (isUserScrollingPicks.current) return;
      const next = (currentPickIndexRef.current + 1) % popularItems.length;
      currentPickIndexRef.current = next;
      setCurrentPickIndex(next);
      picksScrollRef.current?.scrollTo({
        x: next * (PICK_CARD_WIDTH + PICK_CARD_SPACING),
        animated: true,
      });
    }, PICK_AUTO_SCROLL_INTERVAL);

    return () => clearInterval(timer);
  }, [popularItems.length]);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS !== 'android') {
        return () => {};
      }

      const onBackPress = () => {
        if (router.canGoBack()) {
          router.back();
          return true;
        }

        Alert.alert('Exit App', 'Are you sure you want to close the app?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [router]),
  );

  const handleStartOrder = () => {
    if (user || isGuest) {
      router.replace('/(tabs)/menu' as any);
    } else {
      pendingRoute.current = '/(tabs)/menu';
      continueAsGuest();
    }
  };

  const handleContinueAsGuest = () => {
    if (user || isGuest) {
      router.replace('/(tabs)' as any);
    } else {
      pendingRoute.current = '/(tabs)';
      continueAsGuest();
    }
  };

  const handleHandcraftedPickPress = (itemId: number) => {
    const dest = `/(tabs)/menu?itemId=${itemId}`;
    if (user || isGuest) {
      router.replace(dest as any);
    } else {
      pendingRoute.current = dest;
      continueAsGuest();
    }
  };

  const scrollToPickIndex = (index: number) => {
    currentPickIndexRef.current = index;
    setCurrentPickIndex(index);
    picksScrollRef.current?.scrollTo({
      x: index * (PICK_CARD_WIDTH + PICK_CARD_SPACING),
      animated: true,
    });
  };

  const handlePicksScrollEnd = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const rawIndex = event.nativeEvent.contentOffset.x / (PICK_CARD_WIDTH + PICK_CARD_SPACING);
    const nextIndex = Math.max(0, Math.min(Math.round(rawIndex), popularItems.length - 1));
    currentPickIndexRef.current = nextIndex;
    setCurrentPickIndex(nextIndex);
    isUserScrollingPicks.current = false;
  };

  const handleSignIn = () => {
    setLoginVisible(true);
  };

  const handleCloseLogin = () => {
    setLoginVisible(false);
    setError('');
    setFormError('');
    setIsRegisterMode(false);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async () => {
    setError('');
    setFormError('');

    if (!username.trim()) {
      setFormError('Please enter your username');
      return;
    }
    if (!password.trim()) {
      setFormError('Please enter your password');
      return;
    }
    if (isRegisterMode && password.trim().length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }
    if (isRegisterMode && password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const userData = isRegisterMode
        ? await register(username, password, displayName.trim() || undefined)
        : await login(username, password);
      handleCloseLogin();

      const { isPrivileged: privileged } = getUserPermissions(userData?.roles);
      router.replace((privileged ? '/(tabs)/portal' : '/(tabs)') as any);
    } catch (err: any) {
      const errorMessage =
        err.message ||
        (isRegisterMode
          ? 'Registration failed. Please try again.'
          : 'Login failed. Please try again.');
      setError(errorMessage);
      Alert.alert(
        isRegisterMode ? 'Sign Up Failed' : 'Login Failed',
        errorMessage,
        [{ text: 'OK', onPress: () => setError('') }],
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Suppress the marketing splash UI whenever we're about to redirect — this prevents
  // the brief "flash" of the splash content right after login/signup.
  const willRedirect = !isManualVisit && (user || isGuest);

  if (isLoading || willRedirect) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Image
            source={require('@/assets/images/ConceptLogo2-FpjOWRtT.png')}
            style={styles.loadingLogo}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color={Colors.brandGreen} style={styles.loadingSpinner} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['bottom', 'left', 'right']}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header */}
      <Header
        onSignInPress={handleSignIn}
        isDark={isDark}
        showSignIn
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroImageWrap}>
            <Image
              source={require('@/assets/images/featured-caramel-latte.jpg')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <ThemedText style={styles.heroTitle}>Bold brews to fuel the pride</ThemedText>
              <ThemedText style={styles.heroSlogan}>
                Fresh coffee, crepes, and bagels crafted for fast pickup.
              </ThemedText>

              <TouchableOpacity
                style={styles.startOrderButton}
                onPress={handleStartOrder}
                activeOpacity={0.85}
              >
                <ThemedText style={styles.startOrderText}>Start Order</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.carouselSection}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={[styles.featuredLabel, { color: colors.text }]}>Handcrafted Picks</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/menu')} activeOpacity={0.8}>
              <ThemedText style={[styles.sectionLink, { color: colors.primary }]}>See all</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={picksScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.picksScroll}
            contentContainerStyle={[
              styles.picksScrollContent,
              { paddingHorizontal: Math.max((SCREEN_WIDTH - PICK_CARD_WIDTH) / 2 - 20, 0) },
            ]}
            snapToInterval={PICK_CARD_WIDTH + PICK_CARD_SPACING}
            decelerationRate="fast"
            disableIntervalMomentum
            scrollEnabled={popularItems.length > 1}
            onScrollBeginDrag={() => {
              isUserScrollingPicks.current = true;
            }}
            onMomentumScrollEnd={handlePicksScrollEnd}
            onScrollEndDrag={handlePicksScrollEnd}
          >
            {popularItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.pickCard,
                  {
                    width: PICK_CARD_WIDTH,
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    opacity: index === currentPickIndex ? 1 : 0.9,
                    transform: [{ scale: index === currentPickIndex ? 1 : 0.98 }],
                  },
                ]}
                onPress={() => handleHandcraftedPickPress(item.id)}
                activeOpacity={0.85}
              >
                <View style={styles.pickImageWrap}>
                  <Image source={item.image} style={styles.pickImage} resizeMode="cover" />
                  <View style={styles.pickImageOverlay} />
                  {index === 0 && (
                    <View style={[styles.staffPickBadge, { backgroundColor: colors.primary }]}>
                      <ThemedText style={styles.staffPickBadgeText}>Lions Pick</ThemedText>
                    </View>
                  )}
                </View>

                <View style={styles.pickContent}>
                  <ThemedText style={[styles.pickCategory, { color: colors.primary }]}>{item.category}</ThemedText>
                  <ThemedText style={[styles.pickName, { color: colors.text }]}>{item.name}</ThemedText>
                  <ThemedText style={[styles.pickDescription, { color: colors.textSecondary }]} numberOfLines={2}>{item.desc}</ThemedText>
                  <View style={styles.pickFooter}>
                    <ThemedText style={[styles.pickPrice, { color: colors.primary }]}>${item.price.toFixed(2)}</ThemedText>
                    <ThemedText style={[styles.pickCta, { color: colors.primary }]}>View →</ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {popularItems.length > 1 && (
            <View style={styles.carouselNavRow}>
              <TouchableOpacity
                style={[styles.carouselNavButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={() => scrollToPickIndex((currentPickIndex - 1 + popularItems.length) % popularItems.length)}
                activeOpacity={0.85}
              >
                <ThemedText style={[styles.carouselNavText, { color: colors.text }]}>←</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.carouselNavButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={() => scrollToPickIndex((currentPickIndex + 1) % popularItems.length)}
                activeOpacity={0.85}
              >
                <ThemedText style={[styles.carouselNavText, { color: colors.text }]}>→</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {popularItems.length > 1 && (
            <View style={styles.carouselDotsRow}>
              {popularItems.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.carouselDot,
                    { backgroundColor: index === currentPickIndex ? Colors.brandGreen : 'rgba(139,115,85,0.28)' },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.authFooter}>
          <ThemedText style={[styles.authFooterText, { color: colors.textSecondary }]}>Sign in to save favorites, earn rewards, and track orders</ThemedText>

          <View style={styles.authFooterActions}>
            <TouchableOpacity
              style={styles.createAccountBtn}
              onPress={() => {
                setIsRegisterMode(true);
                setLoginVisible(true);
              }}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.createAccountText}>Create Account</ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.guestBtn}
            onPress={handleContinueAsGuest}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.guestText}>Continue as Guest</ThemedText>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Login / Register Modal */}
      <Modal
        visible={loginVisible}
        animationType="slide"
        transparent
        onRequestClose={handleCloseLogin}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            {/* Close button */}
            <TouchableOpacity style={styles.modalCloseX} onPress={handleCloseLogin}>
              <ThemedText style={[styles.modalCloseText, { color: colors.textSecondary }]}>X</ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.modalHeader}>
              {isRegisterMode ? 'Create Account' : 'Sign In'}
            </ThemedText>

            {/* Error Messages */}
            {(formError || error) ? (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{formError || error}</ThemedText>
              </View>
            ) : null}

            {/* Username */}
            <TextInput
              style={[styles.modalInput, {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.inputBackground,
              }]}
              placeholder="Username"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!submitting}
            />

            {/* Display Name (register only) */}
            {isRegisterMode && (
              <TextInput
                style={[styles.modalInput, {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.inputBackground,
                }]}
                placeholder="Display Name (optional)"
                placeholderTextColor={colors.textSecondary}
                value={displayName}
                onChangeText={setDisplayName}
                editable={!submitting}
              />
            )}

            {/* Password */}
            <View style={[styles.passwordRow, {
              borderColor: colors.border,
              backgroundColor: colors.inputBackground,
            }]}
            >
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!submitting}
              />
              <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                <ThemedText style={styles.passwordToggle}>{showPassword ? 'Hide' : 'Show'}</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Confirm Password (register only) */}
            {isRegisterMode && (
              <View style={[styles.passwordRow, {
                borderColor: colors.border,
                backgroundColor: colors.inputBackground,
              }]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  placeholder="Confirm Password"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitting}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
                  <ThemedText style={styles.passwordToggle}>{showConfirmPassword ? 'Hide' : 'Show'}</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.modalSubmitBtn, { opacity: submitting ? 0.6 : 1 }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <ThemedText style={styles.modalSubmitText}>
                  {isRegisterMode ? 'Create Account' : 'Sign In'}
                </ThemedText>
              )}
            </TouchableOpacity>

            {/* Toggle mode */}
            <TouchableOpacity
              onPress={() => {
                setIsRegisterMode((prev) => !prev);
                setError('');
                setFormError('');
              }}
              disabled={submitting}
            >
              <ThemedText style={styles.toggleText}>
                {isRegisterMode
                  ? 'Already have an account? Sign In'
                  : 'New here? Create an account'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}


