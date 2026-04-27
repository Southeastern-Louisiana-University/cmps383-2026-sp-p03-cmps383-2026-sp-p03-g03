import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CommonStyles, getColors } from '@/constants/styles';
import type { UserDto } from '@/contexts/AuthContext';

type Props = {
  user: UserDto;
  colors: ReturnType<typeof getColors>;
};

export function AccountProfileSection({ user, colors }: Props) {
  return (
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
        <ThemedText style={CommonStyles.label}>Rewards Points:</ThemedText>
        <ThemedText style={[CommonStyles.value, { color: colors.primary, fontWeight: 'bold', fontFamily: 'Alegreya_700Bold' }]}>
          {user.loyaltyPoints} 🦁
        </ThemedText>
      </View>

      {user.roles && user.roles.length > 0 && (
        <View style={CommonStyles.infoRow}>
          <ThemedText style={CommonStyles.label}>Role:</ThemedText>
          <ThemedText style={CommonStyles.value}>{user.roles.join(', ')}</ThemedText>
        </View>
      )}
    </View>
  );
}