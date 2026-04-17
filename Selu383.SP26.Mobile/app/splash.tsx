import React, { useEffect, useState } from 'react';
import {
  View,
  Modal,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { getColors } from '@/constants/styles';
import { ThemedText } from '@/components/themed-text';
import { Header } from '@/components/splash-header';
import { FeaturedCarousel } from '@/components/featured-carousel';
import { styles } from '@/styles/screens/splash.styles';

export default function SplashScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const { user, isLoading, login, register } = useAuth();
  const router = useRouter();

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

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.replace('/(tabs)' as any);
    }
  }, [user, isLoading, router]);

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
    router.replace('/(tabs)/menu');
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
      if (isRegisterMode) {
        await register(username, password, displayName.trim() || undefined);
      } else {
        await login(username, password);
      }
      handleCloseLogin();
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

  // Show loading spinner while auth state resolves
  if (isLoading) {
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
        showBack={router.canGoBack()}
        onBackPress={() => router.back()}
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

        {/* Featured Section Label */}
        <View style={styles.carouselSection}>
          <ThemedText style={[styles.featuredLabel, { color: colors.text }]}>Featured Picks</ThemedText>

          {/* Featured Carousel */}
          <FeaturedCarousel isDark={isDark} />
        </View>

        <View style={styles.authFooter}>
          <ThemedText style={[styles.authFooterText, { color: isDark ? '#a3a3a3' : '#6b7280' }]}>Sign in to save favorites, earn rewards, and track orders</ThemedText>

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
            onPress={handleStartOrder}
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
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}>
            {/* Close button */}
            <TouchableOpacity style={styles.modalCloseX} onPress={handleCloseLogin}>
              <ThemedText style={[styles.modalCloseText, { color: isDark ? '#ccc' : '#666' }]}>X</ThemedText>
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
                borderColor: isDark ? '#555' : '#ddd',
                color: isDark ? '#fff' : '#333',
                backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
              }]}
              placeholder="Username"
              placeholderTextColor={isDark ? '#666' : '#999'}
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
                  borderColor: isDark ? '#555' : '#ddd',
                  color: isDark ? '#fff' : '#333',
                  backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                }]}
                placeholder="Display Name (optional)"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={displayName}
                onChangeText={setDisplayName}
                editable={!submitting}
              />
            )}

            {/* Password */}
            <View style={[styles.passwordRow, {
              borderColor: isDark ? '#555' : '#ddd',
              backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
            }]}
            >
              <TextInput
                style={[styles.passwordInput, { color: isDark ? '#fff' : '#333' }]}
                placeholder="Password"
                placeholderTextColor={isDark ? '#666' : '#999'}
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
                borderColor: isDark ? '#555' : '#ddd',
                backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
              }]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: isDark ? '#fff' : '#333' }]}
                  placeholder="Confirm Password"
                  placeholderTextColor={isDark ? '#666' : '#999'}
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


