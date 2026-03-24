import React from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/constants/styles';
import { useAuth } from '@/hooks/useAuth';

type PageHeaderActionsProps = {
  showHome?: boolean;
  showLogout?: boolean;
};

export function PageHeaderActions({ showHome = true, showLogout = false }: PageHeaderActionsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const router = useRouter();
  const { logout } = useAuth();

  const performLogout = async () => {
    try {
      await logout();
      router.replace('/splash');
    } catch {
      Alert.alert('Logout Failed', 'Failed to logout. Please try again.');
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = confirm('Are you sure you want to logout?');
      if (confirmed) {
        await performLogout();
      }
      return;
    }

    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: performLogout },
    ]);
  };

  return (
    <View style={styles.row}>
      {showHome ? (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="home" size={16} color={colors.text} style={styles.actionIcon} />
          <ThemedText style={styles.actionText}>Home</ThemedText>
        </TouchableOpacity>
      ) : null}

      <View style={styles.spacer} />

      {showLogout ? (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <MaterialIcons name="logout" size={16} color={colors.text} style={styles.actionIcon} />
          <ThemedText style={styles.actionText}>Logout</ThemedText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionIcon: {
    marginRight: 6,
  },
  actionText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
  },
  spacer: {
    flex: 1,
  },
});
