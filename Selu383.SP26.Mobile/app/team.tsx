import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PageHeaderActions } from '@/components/page-header-actions';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CommonStyles, getColors } from '@/constants/styles';
import { getUserPermissions } from '@/utils/role-helpers';
import {
  deleteStaff,
  disableStaff,
  enableStaff,
  getLocations,
  listStaff,
  resetStaffPassword,
  updateStaff,
} from '@/services/api';
import type { LocationDto, StaffUserDto } from '@/services/api-types';

interface EditDraft {
  id: number;
  displayName: string;
  email: string;
  phoneNumber: string;
  locationId: number;
}

export default function TeamScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark');
  const { user } = useAuth();
  const { isPrivileged, isAdmin } = getUserPermissions(user?.roles);

  const [staff, setStaff] = useState<StaffUserDto[]>([]);
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const [resetTarget, setResetTarget] = useState<StaffUserDto | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetSaving, setResetSaving] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [staffList, locationList] = await Promise.all([
        listStaff(),
        getLocations(),
      ]);
      setStaff(staffList);
      setLocations(locationList);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Could not load staff list.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isPrivileged) load();
  }, [isPrivileged, load]);

  const locationLookup = useMemo(() => {
    const map = new Map<number, string>();
    locations.forEach((loc) => map.set(loc.id, loc.name));
    return map;
  }, [locations]);

  const assignableLocations = useMemo(() => {
    if (isAdmin) return locations;
    const myId = user?.id;
    if (myId == null) return [];
    return locations.filter((loc) => loc.managerId === myId);
  }, [isAdmin, locations, user?.id]);

  if (!isPrivileged) {
    return <Redirect href="/(tabs)" />;
  }

  const handleToggleDisabled = (member: StaffUserDto) => {
    const action = member.isDisabled ? 'Re-enable' : 'Disable';
    Alert.alert(
      `${action} ${member.displayName || member.userName}?`,
      member.isDisabled
        ? 'This account will be able to sign in again.'
        : 'This staff member will be locked out and unable to sign in until you re-enable them.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          style: member.isDisabled ? 'default' : 'destructive',
          onPress: async () => {
            setBusyId(member.id);
            try {
              const updated = member.isDisabled
                ? await enableStaff(member.id)
                : await disableStaff(member.id);
              setStaff((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
            } catch (err: any) {
              Alert.alert('Update failed', err?.message || 'Please try again.');
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  };

  const openEdit = (member: StaffUserDto) => {
    setEditDraft({
      id: member.id,
      displayName: member.displayName || '',
      email: member.email || '',
      phoneNumber: member.phoneNumber || '',
      locationId: member.locationId,
    });
  };

  const saveEdit = async () => {
    if (!editDraft) return;
    setEditSaving(true);
    try {
      const updated = await updateStaff(editDraft.id, {
        displayName: editDraft.displayName.trim() || undefined,
        email: editDraft.email.trim() || undefined,
        phoneNumber: editDraft.phoneNumber.trim() || undefined,
        locationId: editDraft.locationId,
      });
      setStaff((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setEditDraft(null);
    } catch (err: any) {
      Alert.alert('Update failed', err?.message || 'Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  const submitReset = async () => {
    if (!resetTarget) return;
    if (resetPassword.length < 8) {
      Alert.alert('Password too short', 'Use at least 8 characters.');
      return;
    }
    setResetSaving(true);
    try {
      await resetStaffPassword(resetTarget.id, resetPassword);
      Alert.alert('Password updated', `${resetTarget.userName} can now sign in with the new password.`);
      setResetTarget(null);
      setResetPassword('');
    } catch (err: any) {
      Alert.alert('Reset failed', err?.message || 'Please try again.');
    } finally {
      setResetSaving(false);
    }
  };

  const handleDelete = (member: StaffUserDto) => {
    Alert.alert(
      `Delete ${member.displayName || member.userName}?`,
      'This permanently removes the account. If they have order or reservation history, the server will refuse and you should disable instead.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusyId(member.id);
            try {
              await deleteStaff(member.id);
              setStaff((prev) => prev.filter((x) => x.id !== member.id));
            } catch (err: any) {
              Alert.alert('Delete failed', err?.message || 'Please try again.');
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={CommonStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load(true);
            }}
            tintColor={colors.primary}
          />
        }
      >
        <ThemedView style={CommonStyles.container}>
          <PageHeaderActions showHome showLogout showPortal />

          <ThemedText style={CommonStyles.title}>My Team</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isAdmin
              ? 'All staff and managers across every location.'
              : 'Staff at the locations you manage.'}
          </ThemedText>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : error ? (
            <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <ThemedText style={{ color: colors.text }}>{error}</ThemedText>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 10 }]}
                onPress={() => load()}
              >
                <ThemedText style={styles.primaryBtnText}>Try again</ThemedText>
              </TouchableOpacity>
            </View>
          ) : staff.length === 0 ? (
            <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <ThemedText style={{ color: colors.textSecondary }}>
                No staff accounts yet. Use the Account tab to create one.
              </ThemedText>
            </View>
          ) : (
            staff.map((member) => {
              const locationName = member.locationName || locationLookup.get(member.locationId) || '—';
              const isManager = member.roles.some((r) => r.toLowerCase() === 'manager');
              const isBusy = busyId === member.id;
              return (
                <View
                  key={member.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.border,
                      opacity: member.isDisabled ? 0.65 : 1,
                    },
                  ]}
                >
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <ThemedText style={[styles.name, { color: colors.text }]}>
                        {member.displayName || member.userName}
                      </ThemedText>
                      <ThemedText style={[styles.meta, { color: colors.textSecondary }]}>
                        @{member.userName} · {isManager ? 'Manager' : 'Staff'}
                      </ThemedText>
                      <ThemedText style={[styles.meta, { color: colors.textSecondary }]}>
                        Location: {locationName}
                      </ThemedText>
                      {!!member.email && (
                        <ThemedText style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
                          {member.email}
                        </ThemedText>
                      )}
                    </View>
                    {member.isDisabled && (
                      <View style={[styles.badge, { borderColor: colors.warning, backgroundColor: colors.warning + '22' }]}>
                        <ThemedText style={[styles.badgeText, { color: colors.warning }]}>Disabled</ThemedText>
                      </View>
                    )}
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.smallBtn, { borderColor: colors.border }]}
                      onPress={() => openEdit(member)}
                      disabled={isBusy}
                    >
                      <MaterialIcons name="edit" size={16} color={colors.text} />
                      <ThemedText style={[styles.smallBtnText, { color: colors.text }]}>Edit</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.smallBtn, { borderColor: colors.border }]}
                      onPress={() => {
                        setResetTarget(member);
                        setResetPassword('');
                      }}
                      disabled={isBusy}
                    >
                      <MaterialIcons name="lock-reset" size={16} color={colors.text} />
                      <ThemedText style={[styles.smallBtnText, { color: colors.text }]}>Reset password</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.smallBtn,
                        {
                          borderColor: member.isDisabled ? colors.success : colors.warning,
                          backgroundColor: (member.isDisabled ? colors.success : colors.warning) + '18',
                        },
                      ]}
                      onPress={() => handleToggleDisabled(member)}
                      disabled={isBusy}
                    >
                      {isBusy ? (
                        <ActivityIndicator color={colors.text} size="small" />
                      ) : (
                        <>
                          <MaterialIcons
                            name={member.isDisabled ? 'check-circle' : 'block'}
                            size={16}
                            color={member.isDisabled ? colors.success : colors.warning}
                          />
                          <ThemedText
                            style={[
                              styles.smallBtnText,
                              { color: member.isDisabled ? colors.success : colors.warning },
                            ]}
                          >
                            {member.isDisabled ? 'Enable' : 'Disable'}
                          </ThemedText>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.smallBtn,
                        {
                          borderColor: colors.error,
                          backgroundColor: colors.error + '18',
                        },
                      ]}
                      onPress={() => handleDelete(member)}
                      disabled={isBusy}
                    >
                      <MaterialIcons name="delete-outline" size={16} color={colors.error} />
                      <ThemedText style={[styles.smallBtnText, { color: colors.error }]}>Delete</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ThemedView>
      </ScrollView>

      {/* Edit modal */}
      <Modal
        visible={editDraft !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditDraft(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.cardBackground }]}>
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Edit Staff Member</ThemedText>

            <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Display name</ThemedText>
            <TextInput
              value={editDraft?.displayName ?? ''}
              onChangeText={(v) => setEditDraft((d) => (d ? { ...d, displayName: v } : d))}
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground }]}
              placeholderTextColor={colors.textSecondary}
            />

            <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Email</ThemedText>
            <TextInput
              value={editDraft?.email ?? ''}
              onChangeText={(v) => setEditDraft((d) => (d ? { ...d, email: v } : d))}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground }]}
              placeholderTextColor={colors.textSecondary}
            />

            <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Phone</ThemedText>
            <TextInput
              value={editDraft?.phoneNumber ?? ''}
              onChangeText={(v) => setEditDraft((d) => (d ? { ...d, phoneNumber: v } : d))}
              keyboardType="phone-pad"
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground }]}
              placeholderTextColor={colors.textSecondary}
            />

            <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Location</ThemedText>
            {assignableLocations.length === 0 ? (
              <ThemedText style={[styles.meta, { color: colors.textSecondary }]}>No assignable locations.</ThemedText>
            ) : (
              <View style={styles.pillRow}>
                {assignableLocations.map((loc) => {
                  const active = editDraft?.locationId === loc.id;
                  return (
                    <TouchableOpacity
                      key={loc.id}
                      onPress={() => setEditDraft((d) => (d ? { ...d, locationId: loc.id } : d))}
                      style={[
                        styles.pill,
                        {
                          borderColor: active ? colors.primary : colors.border,
                          backgroundColor: active ? colors.primary + '22' : 'transparent',
                        },
                      ]}
                    >
                      <ThemedText style={{ color: active ? colors.primary : colors.text }}>{loc.name}</ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.smallBtn, { borderColor: colors.border, flex: 1 }]}
                onPress={() => setEditDraft(null)}
                disabled={editSaving}
              >
                <ThemedText style={[styles.smallBtnText, { color: colors.text }]}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary, flex: 1 }]}
                onPress={saveEdit}
                disabled={editSaving}
              >
                {editSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.primaryBtnText}>Save</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reset password modal */}
      <Modal
        visible={resetTarget !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setResetTarget(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.cardBackground }]}>
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
              Reset password for {resetTarget?.userName}
            </ThemedText>
            <ThemedText style={[styles.meta, { color: colors.textSecondary, marginBottom: 8 }]}>
              The new password takes effect immediately.
            </ThemedText>

            <TextInput
              value={resetPassword}
              onChangeText={setResetPassword}
              placeholder="New password (min 8 chars)"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground }]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.smallBtn, { borderColor: colors.border, flex: 1 }]}
                onPress={() => {
                  setResetTarget(null);
                  setResetPassword('');
                }}
                disabled={resetSaving}
              >
                <ThemedText style={[styles.smallBtnText, { color: colors.text }]}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary, flex: 1 }]}
                onPress={submitReset}
                disabled={resetSaving}
              >
                {resetSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.primaryBtnText}>Update password</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = {
  subtitle: {
    fontFamily: 'Alegreya_400Regular',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 14,
  },
  loadingWrap: {
    paddingVertical: 32,
    alignItems: 'center' as const,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    justifyContent: 'space-between' as const,
  },
  name: {
    fontFamily: 'Alegreya_700Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  meta: {
    fontFamily: 'Alegreya_400Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: 'Alegreya_700Bold',
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
  },
  actionRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginTop: 12,
  },
  smallBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  smallBtnText: {
    fontFamily: 'Alegreya_500Medium',
    fontSize: 12,
  },
  primaryBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  primaryBtnText: {
    color: '#fff',
    fontFamily: 'Alegreya_700Bold',
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center' as const,
    paddingHorizontal: 18,
  },
  modalCard: {
    borderRadius: 16,
    padding: 18,
  },
  modalTitle: {
    fontFamily: 'Alegreya_700Bold',
    fontSize: 17,
    marginBottom: 8,
  },
  label: {
    fontFamily: 'Alegreya_500Medium',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Alegreya_400Regular',
    fontSize: 14,
  },
  pillRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginTop: 4,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  modalActions: {
    flexDirection: 'row' as const,
    gap: 10,
    marginTop: 16,
  },
};
