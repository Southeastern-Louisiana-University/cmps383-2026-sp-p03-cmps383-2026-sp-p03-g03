import React from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SplashScreen() {
  const colorScheme = useColorScheme();
  const { isLoading } = useAuth();

  const backgroundColor = colorScheme === 'dark' 
    ? Colors.dark.background 
    : Colors.light.background;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={require('@/assets/images/ConceptLogo2.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Loading Spinner */}
        <View style={styles.spinnerContainer}>
          <ActivityIndicator
            size="large"
            color={colorScheme === 'dark' ? Colors.dark.text : Colors.light.text}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  spinnerContainer: {
    marginTop: 20,
  },
});

