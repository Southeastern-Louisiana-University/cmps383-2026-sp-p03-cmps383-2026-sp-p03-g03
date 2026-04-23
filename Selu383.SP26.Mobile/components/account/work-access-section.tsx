import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CommonStyles, getColors } from '@/constants/styles';
import { styles } from '@/styles/screens/account.styles';
import type { UserDto } from '@/contexts/AuthContext';
import type { LocationDto } from '@/services/api-types';

type Props = {
  user: UserDto;
  colors: ReturnType<typeof getColors>;
  isAdmin: boolean;
  isManager: boolean;
  managedLocations: LocationDto[];
  assignableLocations: LocationDto[];
  teamMemberUserName: string;
  setTeamMemberUserName: (value: string) => void;
  teamMemberDisplayName: string;
  setTeamMemberDisplayName: (value: string) => void;
  teamMemberEmail: string;
  setTeamMemberEmail: (value: string) => void;
  teamMemberPassword: string;
  setTeamMemberPassword: (value: string) => void;
  teamRole: 'Staff' | 'Manager';
  setTeamRole: (value: 'Staff' | 'Manager') => void;
  selectedTeamLocationId: number | null;
  setSelectedTeamLocationId: (value: number) => void;
  creatingTeamMember: boolean;
  onCreateTeamMember: () => void;
};

export function WorkAccessSection({
  user,
  colors,
  isAdmin,
  isManager,
  managedLocations,
  assignableLocations,
  teamMemberUserName,
  setTeamMemberUserName,
  teamMemberDisplayName,
  setTeamMemberDisplayName,
  teamMemberEmail,
  setTeamMemberEmail,
  teamMemberPassword,
  setTeamMemberPassword,
  teamRole,
  setTeamRole,
  selectedTeamLocationId,
  setSelectedTeamLocationId,
  creatingTeamMember,
  onCreateTeamMember,
}: Props) {
  return (
    <View style={[CommonStyles.card, { backgroundColor: colors.cardBackground }]}>
      <ThemedText style={CommonStyles.cardTitle}>Work Access</ThemedText>

      <View style={[styles.workSummaryBox, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
        <ThemedText style={[styles.workSummaryText, { color: colors.text }]}>
          {isAdmin
            ? 'Create manager and staff accounts for any location directly from mobile.'
            : isManager
              ? 'Create staff accounts for the locations you manage and use the Orders and Menu tabs for daily operations.'
              : 'Use the Orders tab to process the assigned location orders you are allowed to handle.'}
        </ThemedText>

        {!!user.locationId && (
          <ThemedText style={[styles.helperText, { color: colors.textSecondary }]}>Assigned location ID: {user.locationId}</ThemedText>
        )}

        {isManager && managedLocations.length > 0 && (
          <ThemedText style={[styles.helperText, { color: colors.textSecondary }]}>Managed locations: {managedLocations.map((location) => location.name).join(', ')}</ThemedText>
        )}
      </View>

      {(isAdmin || isManager) && (
        <>
          <ThemedText style={[styles.sectionLabel, { color: colors.text }]}>Create Team Account</ThemedText>

          {isAdmin && (
            <View style={styles.pillRow}>
              {(['Staff', 'Manager'] as const).map((role) => {
                const selected = teamRole === role;
                return (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.pill,
                      {
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? `${colors.primary}22` : 'transparent',
                      },
                    ]}
                    onPress={() => setTeamRole(role)}
                    activeOpacity={0.85}
                  >
                    <ThemedText style={[styles.pillText, { color: selected ? colors.primary : colors.text }]}>{role}</ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.formStack}>
            <TextInput
              style={[
                CommonStyles.input,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                },
              ]}
              value={teamMemberUserName}
              onChangeText={setTeamMemberUserName}
              placeholder="Username"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />

            <TextInput
              style={[
                CommonStyles.input,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                },
              ]}
              value={teamMemberDisplayName}
              onChangeText={setTeamMemberDisplayName}
              placeholder="Display name"
              placeholderTextColor={colors.textSecondary}
            />

            <TextInput
              style={[
                CommonStyles.input,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                },
              ]}
              value={teamMemberEmail}
              onChangeText={setTeamMemberEmail}
              placeholder="Email (optional)"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={[
                CommonStyles.input,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                },
              ]}
              value={teamMemberPassword}
              onChangeText={setTeamMemberPassword}
              placeholder="Temporary password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />

            <ThemedText style={[styles.helperText, { color: colors.textSecondary }]}>
              {isAdmin && teamRole === 'Manager'
                ? 'Select the location that this new manager should control.'
                : 'Select the location this staff member should work at.'}
            </ThemedText>

            {assignableLocations.length === 0 ? (
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                {isManager
                  ? 'No managed locations are assigned to your account yet.'
                  : 'No locations are available right now.'}
              </ThemedText>
            ) : (
              <View style={styles.pillRow}>
                {assignableLocations.map((location) => {
                  const selected = selectedTeamLocationId === location.id;
                  return (
                    <TouchableOpacity
                      key={location.id}
                      style={[
                        styles.pill,
                        {
                          borderColor: selected ? colors.primary : colors.border,
                          backgroundColor: selected ? `${colors.primary}22` : 'transparent',
                        },
                      ]}
                      onPress={() => setSelectedTeamLocationId(location.id)}
                      activeOpacity={0.85}
                    >
                      <ThemedText style={[styles.pillText, { color: selected ? colors.primary : colors.text }]}>
                        {location.name}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: colors.primary,
                  opacity: creatingTeamMember ? 0.7 : 1,
                },
              ]}
              onPress={onCreateTeamMember}
              disabled={creatingTeamMember}
              activeOpacity={0.85}
            >
              <ThemedText style={styles.addButtonText}>
                {creatingTeamMember
                  ? 'Creating...'
                  : isAdmin && teamRole === 'Manager'
                    ? 'Create Manager'
                    : 'Create Staff Account'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}