import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/constants/styles';

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText style={[styles.title, { color: colors.text }]}>Page Not Found</ThemedText>
      <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
        This screen doesn&apos;t exist.
      </ThemedText>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => router.replace('/(tabs)' as any)}
      >
        <ThemedText style={styles.buttonText}>Go Home</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontFamily: 'Alegreya_700Bold',
    fontSize: 22,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Alegreya_400Regular',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Alegreya_700Bold',
    fontSize: 14,
  },
});
