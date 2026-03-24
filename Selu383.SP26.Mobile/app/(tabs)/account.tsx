import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CommonStyles, getColors } from '@/constants/styles';
import { useThemeMode } from '@/contexts/ThemeContext';
import { PageHeaderActions } from '@/components/page-header-actions';

export default function AccountScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const { user } = useAuth();
  const { toggleMode } = useThemeMode();

  return (
    <SafeAreaView style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={CommonStyles.scrollContent}>
        <ThemedView style={CommonStyles.container}>
          <PageHeaderActions showLogout />
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Image
                source={require('@/assets/images/ConceptLogo2-FpjOWRtT.png')}
                style={styles.titleLogo}
                resizeMode="contain"
              />
              <ThemedText style={CommonStyles.title}>Account</ThemedText>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={toggleMode}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.icon}>{isDark ? '☀️' : '🌙'}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleLogo: {
    width: 34,
    height: 34,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    fontFamily: 'Corben_400Regular',
  },
});

