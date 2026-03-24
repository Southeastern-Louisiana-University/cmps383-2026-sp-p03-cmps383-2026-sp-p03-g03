import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { login, isLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  
  const handleLogin = async () => {
    
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

    try {
      console.log('Login attempt with:', username);
      
      await login(username, password);
      console.log('Login successful, navigating to home');

      
      router.replace('/(tabs)');
    } catch (err: any) {
      console.log('Login error:', err);
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);

    
      Alert.alert('Login Failed', errorMessage, [
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

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                {
                  backgroundColor: Colors.brandGreen,
                  opacity: isLoading ? 0.6 : 1,
                },
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <ThemedText style={styles.loginButtonText}>
                  🍃 Start Order ⚡
                </ThemedText>
              )}
            </TouchableOpacity>

            {/* Info Text */}
            <ThemedText style={styles.infoText}>
              Enter your credentials to access your account
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  container: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Oregano_400Regular',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
    fontFamily: 'Corben_400Regular',
  },
  errorContainer: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  errorText: {
    color: '#c62828',
    fontWeight: '600',
    fontFamily: 'Corben_700Bold',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Corben_700Bold',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 20,
    minHeight: 48,
    fontFamily: 'Corben_400Regular',
  },
  loginButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 30, 
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    minHeight: 50,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Corben_700Bold',
  },
  infoText: {
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
    fontFamily: 'Corben_400Regular',
  },
});
