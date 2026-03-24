import React from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedButton } from '@/components/animated-button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CommonStyles, getColors } from '@/constants/styles';

export default function AccountScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    console.error('🔴 LOGOUT BUTTON CLICKED - THIS SHOULD APPEAR IN CONSOLE');
    console.log('[Account] Logout button pressed - showing confirmation');
    
    // Use browser confirm on web, Alert on native
    const confirmed = confirm('Are you sure you want to logout?');
    
    if (confirmed) {
      try {
        console.log('[Account] User confirmed logout, calling logout function...');
        await logout();
        console.log('[Account] Logout successful - user state should be cleared');
      } catch (error) {
        console.log('[Account] Logout error:', error);
        alert('Failed to logout. Please try again.');
      }
    } else {
      console.log('[Account] User cancelled logout');
    }
  };

  return (
    <SafeAreaView style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={CommonStyles.scrollContent}>
        <ThemedView style={CommonStyles.container}>
          <ThemedText style={CommonStyles.title}>👤 Account</ThemedText>

          {user && (
            <View style={[CommonStyles.card, { backgroundColor: colors.cardBackground }]}>
              <ThemedText style={CommonStyles.cardTitle}>Profile Information</ThemedText>

              <View style={CommonStyles.infoRow}>
                <ThemedText style={CommonStyles.label}>Username:</ThemedText>
                <ThemedText style={CommonStyles.value}>{user.userName}</ThemedText>
              </View>

              {user.email && (
                <View style={CommonStyles.infoRow}>
                  <ThemedText style={CommonStyles.label}>Email:</ThemedText>
                  <ThemedText style={CommonStyles.value}>{user.email}</ThemedText>
                </View>
              )}

              <View style={CommonStyles.infoRow}>
                <ThemedText style={CommonStyles.label}>Loyalty Points:</ThemedText>
                <ThemedText style={[CommonStyles.value, { color: colors.primary, fontWeight: 'bold' }]}>
                  {user.loyaltyPoints} ⭐
                </ThemedText>
              </View>

              {user.roles && user.roles.length > 0 && (
                <View style={CommonStyles.infoRow}>
                  <ThemedText style={CommonStyles.label}>Role:</ThemedText>
                  <ThemedText style={CommonStyles.value}>{user.roles.join(', ')}</ThemedText>
                </View>
              )}
            </View>
          )}

           {/* Logout Button */}
            <AnimatedButton
              style={[
                CommonStyles.dangerButton,
                { marginBottom: 16 },
              ]}
              onPress={handleLogout}
            >
              <ThemedText style={CommonStyles.buttonText}>
                🚪 Logout
              </ThemedText>
            </AnimatedButton>

          <View style={[CommonStyles.card, { backgroundColor: colors.cardBackground }]}>
            <ThemedText style={CommonStyles.cardTitle}>App Info</ThemedText>
            <ThemedText style={styles.description}>
              Caffeinated Lions Mobile App v1.0.0
            </ThemedText>
            <ThemedText style={[styles.description, { marginTop: 8 }]}>
              Thank you for using our app! Enjoy your coffee! ☕
            </ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});

