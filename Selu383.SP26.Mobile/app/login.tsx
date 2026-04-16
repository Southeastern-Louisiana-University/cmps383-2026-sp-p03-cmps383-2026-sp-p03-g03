import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { styles } from '@/styles/screens/login.styles';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { login, register, isLoading, user } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  useEffect(() => {
    if (user && !isLoading) {
      router.replace('/(tabs)' as any);
    }
  }, [user, isLoading, router]);

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

    try {
      if (isRegisterMode) {
        await register(username, password, displayName.trim() || undefined);
      } else {
        await login(username, password);
      }
    } catch (err: any) {
      const errorMessage = err.message || (isRegisterMode ? 'Registration failed. Please try again.' : 'Login failed. Please try again.');
      setError(errorMessage);

      Alert.alert(isRegisterMode ? 'Sign Up Failed' : 'Login Failed', errorMessage, [
        {
          text: 'OK',
          onPress: () => setError(''),
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.container}>
            {/* Logo */}
            <Image
              source={require('@/assets/images/ConceptLogo2-FpjOWRtT.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            {/* Title */}
            <ThemedText style={styles.title}>
              Caffeinated Lions
            </ThemedText>

            <ThemedText style={[styles.subtitle, { color: Colors.brandGreen }]}>
              🍵 Pouring pride into every cup. 🍵
            </ThemedText>

            {/* Error Messages */}
            {formError ? (
              <View style={[styles.errorContainer, { backgroundColor: '#ffebee' }]}>
                <ThemedText style={styles.errorText}>
                  {formError}
                </ThemedText>
              </View>
            ) : null}

            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: '#ffebee' }]}>
                <ThemedText style={styles.errorText}>
                  {error}
                </ThemedText>
              </View>
            ) : null}

            <ThemedText style={[styles.modeTitle, { color: colors.text }]}>
              {isRegisterMode ? 'Create Account' : 'Sign In'}
            </ThemedText>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Username</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.text,
                    color: colors.text,
                    backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                  },
                ]}
                placeholder="Enter your username"
                placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                value={username}
                onChangeText={setUsername}
                editable={!isLoading}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {isRegisterMode && (
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Display Name (Optional)</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: colors.text,
                      color: colors.text,
                      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                    },
                  ]}
                  placeholder="How your name appears"
                  placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                  value={displayName}
                  onChangeText={setDisplayName}
                  editable={!isLoading}
                />
              </View>
            )}

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.text,
                    color: colors.text,
                    backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                  },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {isRegisterMode && (
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Confirm Password</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: colors.text,
                      color: colors.text,
                      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                    },
                  ]}
                  placeholder="Re-enter password"
                  placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!isLoading}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                {
                  backgroundColor: Colors.brandGreen,
                  opacity: isLoading ? 0.6 : 1,
                },
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <ThemedText style={styles.loginButtonText}>
                  {isRegisterMode ? 'Create My Account' : '🍃 Start Order ⚡'}
                </ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsRegisterMode((prev) => !prev);
                setError('');
                setFormError('');
              }}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <ThemedText style={[styles.toggleText, { color: Colors.brandGreen }]}> 
                {isRegisterMode ? 'Already have an account? Sign In' : 'New here? Create an account'}
              </ThemedText>
            </TouchableOpacity>

            {/* Info Text */}
            <ThemedText style={styles.infoText}>
              {isRegisterMode
                ? 'Create a customer account to start ordering'
                : 'Enter your credentials to access your account'}
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
