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
import { CommonStyles, getColors } from '@/constants/styles';
import { styles } from '@/styles/screens/portal.styles';

type Role = 'admin' | 'manager' | 'staff';

interface PortalAction {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: '/(tabs)/orders' | '/(tabs)/reservations' | '/(tabs)/menu' | '/(tabs)/account';
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
    id: 'team',
    title: 'Team Accounts',
    subtitle: 'Create staff and manager accounts from mobile.',
    icon: 'groups',
    route: '/(tabs)/account',
    roles: ['admin', 'manager'],
  },
];

export default function PortalScreen() {
  return (
    <SafeAreaView>
      <ThemedText>Portal Page</ThemedText>
    </SafeAreaView>
  );
}
