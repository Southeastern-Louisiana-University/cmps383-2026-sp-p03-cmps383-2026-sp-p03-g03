import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PageHeaderActions } from '@/components/page-header-actions';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getUserPermissions } from '@/utils/role-helpers';
import { CommonStyles, getColors } from '@/constants/styles';
import { styles } from '@/styles/screens/portal.styles';

type Role = 'admin' | 'manager' | 'staff';

interface PortalAction {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: '/(tabs)/orders' | '/(tabs)/reservations' | '/(tabs)/menu' | '/(tabs)/account' | '/team';
  roles: Role[];
}

const ACTIONS: PortalAction[] = [
  {
    id: 'orders',
    title: 'Order Queue',
    subtitle: 'Advance order status and keep tickets moving.',
    icon: 'receipt-long',
    route: '/(tabs)/orders',
    roles: ['admin', 'manager', 'staff'],
  },
  {
    id: 'reservations',
    title: 'Reservation Desk',
    subtitle: 'Manage table bookings for your location.',
    icon: 'event-seat',
    route: '/(tabs)/reservations',
    roles: ['admin', 'manager', 'staff'],
  },
  {
    id: 'menu-ops',
    title: 'Menu Availability',
    subtitle: 'Enable or disable menu items for service.',
    icon: 'restaurant-menu',
    route: '/(tabs)/menu',
    roles: ['admin', 'manager'],
  },
  {
    id: 'team-manage',
    title: 'My Team',
    subtitle: 'Edit, disable, or reset passwords for your staff.',
    icon: 'badge',
    route: '/team',
    roles: ['admin', 'manager'],
  },
  {
    id: 'team',
    title: 'Create Team Account',
    subtitle: 'Add new staff and manager accounts.',
    icon: 'group-add',
    route: '/(tabs)/account',
    roles: ['admin', 'manager'],
  },
];

export default function PortalScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark');
  const router = useRouter();
  const { user } = useAuth();

  const { isPrivileged } = getUserPermissions(user?.roles);
  const normalizedRoles = user?.roles?.map((r) => r.toLowerCase()) ?? [];

  if (!isPrivileged) {
    return <Redirect href="/(tabs)" />;
  }

  const visibleActions = ACTIONS.filter((action) =>
    action.roles.some((role) => normalizedRoles.includes(role)),
  );

  return (
    <SafeAreaView style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={CommonStyles.scrollContent}>
        <ThemedView style={CommonStyles.container}>
          <PageHeaderActions showHome showLogout />

          <View style={styles.headerRow}>
            <ThemedText style={CommonStyles.title}>Staff Portal</ThemedText>
          </View>

          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Quick actions for your role
          </ThemedText>

          {visibleActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: colors.primary + '18' }]}>
                <MaterialIcons name={action.icon} size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.actionTitle, { color: colors.text }]}>{action.title}</ThemedText>
                <ThemedText style={[styles.actionSubtitle, { color: colors.textSecondary }]}>{action.subtitle}</ThemedText>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
