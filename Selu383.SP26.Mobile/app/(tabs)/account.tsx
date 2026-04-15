import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CommonStyles, getColors } from '@/constants/styles';
import { useThemeMode } from '@/contexts/ThemeContext';
import { PageHeaderActions } from '@/components/page-header-actions';
import {
  addPaymentMethod,
  createUserAccount,
  deletePaymentMethod,
  getLocations,
  getMyLoyalty,
  getPaymentMethods,
  getRewards,
  redeemReward,
  setDefaultPaymentMethod,
  updateLocationManager,
  type LocationDto,
  type LoyaltySummaryDto,
  type PaymentMethodDto,
  type RewardDto,
} from '@/services/api';

function formatHistoryDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatCardLabel(method: PaymentMethodDto) {
  return `${method.brand} •••• ${method.last4}`;
}

function getDigitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function detectCardBrand(cardNumber: string) {
  if (/^4/.test(cardNumber)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(cardNumber)) return 'MasterCard';
  if (/^3[47]/.test(cardNumber)) return 'American Express';
  if (/^6(?:011|5)/.test(cardNumber)) return 'Discover';
  return 'Card';
}

function formatCardNumberInput(value: string) {
  const digits = getDigitsOnly(value).slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function getRewardImageSource(name: string) {
  const normalized = name.toLowerCase();
  
  if (normalized.includes('iced latte') || normalized.includes('latte')) {
    return require('@/assets/images/featured-caramel-latte.jpg');
  }
  if (normalized.includes('mannino honey crepe') || normalized.includes('mannino')) {
    return require('@/assets/images/mannino honey crape.png');
  }
  if (normalized.includes('turkey club') || normalized.includes('turkey')) {
    return require('@/assets/images/turkeyclub.png');
  }
  if (normalized.includes('classic') || normalized.includes('bagel')) {
    return require('@/assets/images/classic.png');
  }
  if (normalized.includes('supernova')) {
    return require('@/assets/images/supernova.png');
  }
  if (normalized.includes('roaring') || normalized.includes('frappe')) {
    return require('@/assets/images/roaringfrape.png');
  }
  if (normalized.includes('strawberry') || normalized.includes('lemonade') || normalized.includes('lemond') || normalized.includes('limeade')) {
    return require('@/assets/images/strawberry.png');
  }
  if (normalized.includes('shaken')) {
    return require('@/assets/images/shaken.png');
  }
  if (normalized.includes('black') || normalized.includes('cold brew')) {
    return require('@/assets/images/blackwhitecoldbrew.png');
  }
  if (normalized.includes('turkey')) {
    return require('@/assets/images/turkeyclub.png');
  }

  return require('@/assets/images/ConceptLogo2-FpjOWRtT.png');
}

function getRewardItemName(name: string, description?: string) {
  const combined = `${name} ${description ?? ''}`.toLowerCase();

  if (combined.includes('supernova')) return 'Supernova';
  if (combined.includes('strawberry') && (combined.includes('lemonade') || combined.includes('lemond') || combined.includes('limeade'))) return 'Strawberry Lemonade';
  if (combined.includes('strawberry')) return 'Strawberry Lemonade';
  if (combined.includes('the classic')) return 'The Classic';
  if (combined.includes('bagel')) return 'The Classic';
  if (combined.includes('10%')) return 'Any menu item';
  return name;
}

export default function AccountScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const { user, checkAuth, isLoading: authLoading } = useAuth();
  const isFocused = useIsFocused();
  const { toggleMode } = useThemeMode();

  const normalizedRoles = user?.roles?.map((role) => role.toLowerCase()) ?? [];
  const isAdmin = normalizedRoles.includes('admin');
  const isManager = normalizedRoles.includes('manager');
  const isStaff = normalizedRoles.includes('staff');
  const hasWorkAccess = isAdmin || isManager || isStaff;

  const [loyalty, setLoyalty] = useState<LoyaltySummaryDto | null>(null);
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [rewards, setRewards] = useState<RewardDto[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDto[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState(''); // stores raw digits only
  const [cvv, setCvv] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);

  const [addingMethod, setAddingMethod] = useState(false);
  const [updatingMethodId, setUpdatingMethodId] = useState<number | null>(null);
  const [redeemingRewardId, setRedeemingRewardId] = useState<number | null>(null);
  const [selectedRedemption, setSelectedRedemption] = useState<LoyaltySummaryDto['history'][number] | null>(null);
  const [teamMemberUserName, setTeamMemberUserName] = useState('');
  const [teamMemberDisplayName, setTeamMemberDisplayName] = useState('');
  const [teamMemberEmail, setTeamMemberEmail] = useState('');
  const [teamMemberPassword, setTeamMemberPassword] = useState('');
  const [teamRole, setTeamRole] = useState<'Staff' | 'Manager'>('Staff');
  const [selectedTeamLocationId, setSelectedTeamLocationId] = useState<number | null>(null);
  const [creatingTeamMember, setCreatingTeamMember] = useState(false);

  const managedLocations = useMemo(() => {
    if (!user) return [];
    if (isAdmin) return locations;
    if (isManager) return locations.filter((location) => location.managerId === user.id);
    return [];
  }, [isAdmin, isManager, locations, user]);

  const assignableLocations = useMemo(() => {
    if (isAdmin) return locations;
    return managedLocations;
  }, [isAdmin, locations, managedLocations]);

  const visibleHistory = useMemo(() => {
    return loyalty?.history?.slice(0, 8) ?? [];
  }, [loyalty]);

  const resolveRewardName = useCallback((entry: LoyaltySummaryDto['history'][number]) => {
    if (entry.rewardName?.trim()) {
      return entry.rewardName;
    }

    if (entry.rewardId) {
      const fromRewards = rewards.find((r) => r.id === entry.rewardId);
      if (fromRewards) {
        return fromRewards.name;
      }

      return `Reward #${entry.rewardId}`;
    }

    // Fallback for older ledger rows that only stored points redeemed.
    const matchesByCost = rewards.filter((r) => r.pointsCost === entry.pointsRedeemed);
    if (matchesByCost.length === 1) {
      return matchesByCost[0].name;
    }

    if (matchesByCost.length > 1) {
      return `${matchesByCost[0].name} (or similar reward)`;
    }

    return 'Reward Redemption';
  }, [rewards]);

  const selectedRewardName = selectedRedemption ? resolveRewardName(selectedRedemption) : 'Reward Redemption';
  const selectedRewardImage = useMemo(
    () => getRewardImageSource(selectedRewardName),
    [selectedRewardName],
  );

  const loadAccountData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    const warnings: string[] = [];

    try {
      const rewardsResult = await getRewards()
        .then((data) => ({ ok: true as const, data }))
        .catch((e: any) => ({ ok: false as const, error: e }));

      if (rewardsResult.ok) {
        setRewards(rewardsResult.data);
      } else {
        setRewards([]);
        warnings.push('Rewards are temporarily unavailable');
      }

      if (!user) {
        setLoyalty(null);
        setPaymentMethods([]);
        setLocations([]);
      }

      if (user) {
        const requests = [getMyLoyalty(), getPaymentMethods()] as const;
        const results = await Promise.allSettled(
          hasWorkAccess ? [...requests, getLocations()] : requests,
        );

        const loyaltyResult = results[0];
        const methodsResult = results[1];
        const locationsResult = hasWorkAccess ? results[2] : null;

        if (loyaltyResult.status === 'fulfilled') {
          setLoyalty(loyaltyResult.value);
        } else {
          console.error('[Account] Loyalty load failed:', loyaltyResult.reason);
          setLoyalty(null);
          warnings.push('Loyalty details could not be loaded');
        }

        if (methodsResult.status === 'fulfilled') {
          console.log('[Account] Payment methods loaded:', methodsResult.value);
          setPaymentMethods(methodsResult.value);
        } else {
          console.error('[Account] Payment methods load failed:', methodsResult.reason);
          setPaymentMethods([]);
          warnings.push('Saved payment methods are temporarily unavailable');
        }

        if (locationsResult && locationsResult.status === 'fulfilled') {
          setLocations(locationsResult.value);
        } else if (hasWorkAccess) {
          console.error('[Account] Location load failed:', locationsResult && 'reason' in locationsResult ? locationsResult.reason : null);
          setLocations([]);
          warnings.push('Location access could not be loaded');
        }
      }

      if (warnings.length > 0) {
        setError(warnings.join('. ') + '.');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load account data.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [hasWorkAccess, user]);

  useEffect(() => {
    if (authLoading || !isFocused) {
      return;
    }

    loadAccountData();
  }, [authLoading, isFocused, loadAccountData]);

  const handleAddPaymentMethod = async () => {
    if (addingMethod) return;

    const cleanCardholder = cardholderName.trim();
    const cardDigits = cardNumber; // already raw digits
    const cleanLast4 = cardDigits.slice(-4);
    const inferredBrand = detectCardBrand(cardDigits);
    const month = Number(expMonth);
    const rawYear = expYear.trim();
    const year = rawYear.length === 2 ? 2000 + Number(rawYear) : Number(rawYear);

    if (!cleanCardholder || !cardDigits || !expMonth || !expYear) {
      setError('Fill out all payment method fields.');
      return;
    }

    if (cardDigits.length < 13 || cardDigits.length > 19) {
      setError('Card number must be between 13 and 19 digits.');
      return;
    }

    if (cvv.trim().length < 3 || cvv.trim().length > 4 || !/^\d+$/.test(cvv.trim())) {
      setError('CVV must be 3 or 4 digits.');
      return;
    }

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      setError('Expiration month must be between 1 and 12.');
      return;
    }

    if (!Number.isInteger(year) || year < new Date().getFullYear()) {
      setError('Expiration year is invalid.');
      return;
    }

    try {
      setAddingMethod(true);
      setError(null);

      console.log('[Account] Adding payment method:', {
        cardholderName: cleanCardholder,
        cardNumber: cardDigits, // Send full card number for Stripe tokenization
        cvc: cvv.trim(), // Send CVV for Stripe tokenization
        brand: inferredBrand,
        last4: cleanLast4,
        expMonth: month,
        expYear: year,
        isDefault: setAsDefault,
      });

      await addPaymentMethod({
        cardholderName: cleanCardholder,
        cardNumber: cardDigits, // Full card number for tokenization
        cvc: cvv.trim(), // CVV for tokenization
        brand: inferredBrand,
        last4: cleanLast4,
        expMonth: month,
        expYear: year,
        isDefault: setAsDefault,
      });

      console.log('[Account] Payment method added successfully');
      setCardholderName('');
      setCardNumber(''); // reset raw digits
      setCvv('');
      setExpMonth('');
      setExpYear('');
      setSetAsDefault(false);

      await loadAccountData(true);
    } catch (e: any) {
      console.error('[Account] Failed to add payment method:', e);
      setError(e instanceof Error ? e.message : 'Could not add payment method.');
    } finally {
      setAddingMethod(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      setUpdatingMethodId(id);
      setError(null);
      await setDefaultPaymentMethod(id);
      await loadAccountData(true);
    } catch (e: any) {
      setError(e.message || 'Could not update default card.');
    } finally {
      setUpdatingMethodId(null);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Remove Payment Method', 'Delete this saved card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setUpdatingMethodId(id);
            setError(null);
            await deletePaymentMethod(id);
            await loadAccountData(true);
          } catch (e: any) {
            setError(e.message || 'Could not delete payment method.');
          } finally {
            setUpdatingMethodId(null);
          }
        },
      },
    ]);
  };

  const handleRedeemReward = async (reward: RewardDto) => {
    if (redeemingRewardId) return;

    const points = loyalty?.points ?? user?.loyaltyPoints ?? 0;
    if (points < reward.pointsCost) {
      setError('Not enough points to redeem this reward.');
      return;
    }

    try {
      setRedeemingRewardId(reward.id);
      setError(null);
      await redeemReward(reward.id);
      await loadAccountData(true);

      // Refresh auth-derived user fields (like loyalty points) without
      // flipping the global app loader or failing redemption UX.
      void checkAuth(true).catch(() => {
        // Best effort only; account data is already refreshed.
      });
    } catch (e: any) {
      setError(e.message || 'Could not redeem reward.');
    } finally {
      setRedeemingRewardId(null);
    }
  };

  useEffect(() => {
    if (selectedTeamLocationId && assignableLocations.some((location) => location.id === selectedTeamLocationId)) {
      return;
    }

    setSelectedTeamLocationId(assignableLocations[0]?.id ?? null);
  }, [assignableLocations, selectedTeamLocationId]);

  useEffect(() => {
    if (!isAdmin && teamRole !== 'Staff') {
      setTeamRole('Staff');
    }
  }, [isAdmin, teamRole]);

  const handleCreateTeamMember = async () => {
    if (!user || (!isAdmin && !isManager)) {
      return;
    }

    const trimmedUserName = teamMemberUserName.trim();
    const trimmedDisplayName = teamMemberDisplayName.trim();
    const trimmedEmail = teamMemberEmail.trim();
    const trimmedPassword = teamMemberPassword.trim();
    const roleToCreate = isAdmin ? teamRole : 'Staff';
    const selectedLocation = assignableLocations.find((location) => location.id === selectedTeamLocationId);

    if (!trimmedUserName || !trimmedPassword) {
      setError('Enter a username and password for the work account.');
      return;
    }

    if (!selectedLocation) {
      setError(isManager
        ? 'Your manager account must be assigned to a location before you can create staff.'
        : 'Select a location first.');
      return;
    }

    try {
      setCreatingTeamMember(true);
      setError(null);

      const createdUser = await createUserAccount({
        userName: trimmedUserName,
        password: trimmedPassword,
        displayName: trimmedDisplayName || undefined,
        email: trimmedEmail || undefined,
        roles: [roleToCreate],
        locationId: roleToCreate === 'Staff' ? selectedLocation.id : undefined,
      });

      if (roleToCreate === 'Manager' && isAdmin) {
        await updateLocationManager(selectedLocation, createdUser.id);
      }

      setTeamMemberUserName('');
      setTeamMemberDisplayName('');
      setTeamMemberEmail('');
      setTeamMemberPassword('');
      if (isAdmin) {
        setTeamRole('Staff');
      }

      Alert.alert(
        'Work account created',
        roleToCreate === 'Manager'
          ? `${trimmedUserName} is now the manager for ${selectedLocation.name}.`
          : `${trimmedUserName} can now sign in as staff for ${selectedLocation.name}.`,
      );

      await loadAccountData(true);
    } catch (e: any) {
      setError(e.message || 'Could not create the work account.');
    } finally {
      setCreatingTeamMember(false);
    }
  };

  return (
    <SafeAreaView style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={CommonStyles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAccountData(true)} />}
      >
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

          {error && (
            <View style={[CommonStyles.card, { backgroundColor: colors.cardBackground, borderColor: colors.error, borderWidth: 1 }]}> 
              <ThemedText style={[styles.inlineError, { color: colors.error }]}>{error}</ThemedText>
            </View>
          )}

          {isLoading ? (
            <View style={[CommonStyles.card, { backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center' }]}> 
              <ActivityIndicator size="large" color={colors.primary} />
              <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>Loading account data...</ThemedText>
            </View>
          ) : null}

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

          {user && hasWorkAccess && (
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
                  <ThemedText style={[styles.helperText, { color: colors.textSecondary }]}>
                    Assigned location ID: {user.locationId}
                  </ThemedText>
                )}

                {isManager && managedLocations.length > 0 && (
                  <ThemedText style={[styles.helperText, { color: colors.textSecondary }]}>
                    Managed locations: {managedLocations.map((location) => location.name).join(', ')}
                  </ThemedText>
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
                      onPress={handleCreateTeamMember}
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
          )}

          <View style={[CommonStyles.card, { backgroundColor: colors.cardBackground }]}> 
            <ThemedText style={CommonStyles.cardTitle}>Loyalty</ThemedText>

            <View style={[styles.pointsBanner, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}> 
              <ThemedText style={[styles.pointsLabel, { color: colors.textSecondary }]}>Current Points</ThemedText>
              <ThemedText style={[styles.pointsValue, { color: colors.primary }]}>{loyalty?.points ?? user?.loyaltyPoints ?? 0}</ThemedText>
            </View>

            <ThemedText style={[styles.sectionLabel, { color: colors.text }]}>Available Rewards</ThemedText>
            {rewards.length === 0 ? (
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>No active rewards yet.</ThemedText>
            ) : (
              <View style={styles.stack}>
                {rewards.map((reward) => {
                  const canRedeem = (loyalty?.points ?? user?.loyaltyPoints ?? 0) >= reward.pointsCost;
                  const isRedeeming = redeemingRewardId === reward.id;
                  const rewardItemName = getRewardItemName(reward.name, reward.description);
                  const rewardImage = getRewardImageSource(`${reward.name} ${reward.description}`);

                  return (
                    <View key={reward.id} style={[styles.rewardCard, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}> 
                      <Image source={rewardImage} style={styles.rewardItemImage} resizeMode="cover" />
                      <View style={styles.rewardTextWrap}>
                        <ThemedText style={[styles.rewardName, { color: colors.text }]}>{reward.name}</ThemedText>
                        <ThemedText style={[styles.rewardItemName, { color: colors.textSecondary }]}>Item: {rewardItemName}</ThemedText>
                        <ThemedText style={[styles.rewardDescription, { color: colors.textSecondary }]}>{reward.description}</ThemedText>
                        <ThemedText style={[styles.rewardCost, { color: colors.primary }]}>{reward.pointsCost} pts</ThemedText>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          {
                            backgroundColor: canRedeem ? colors.primary : colors.border,
                            opacity: isRedeeming ? 0.7 : 1,
                          },
                        ]}
                        onPress={() => handleRedeemReward(reward)}
                        disabled={!canRedeem || isRedeeming}
                        activeOpacity={0.85}
                      >
                        <ThemedText style={styles.actionButtonText}>{isRedeeming ? 'Redeeming...' : 'Redeem'}</ThemedText>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            <ThemedText style={[styles.sectionLabel, { color: colors.text }]}>Recent Loyalty Activity</ThemedText>
            {visibleHistory.length === 0 ? (
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>No loyalty activity yet.</ThemedText>
            ) : (
              <View style={styles.stack}>
                {visibleHistory.map((entry) => {
                  const isRewardRedemption = !entry.orderId && entry.pointsRedeemed > 0;
                  const activityRewardName = isRewardRedemption ? resolveRewardName(entry) : '';

                  return (
                  <TouchableOpacity
                    key={entry.id}
                    style={[styles.historyRow, { borderColor: colors.border }]}
                    activeOpacity={isRewardRedemption ? 0.85 : 1}
                    disabled={!isRewardRedemption}
                    onPress={() => {
                      if (isRewardRedemption) {
                        setSelectedRedemption(entry);
                      }
                    }}
                  >
                    {isRewardRedemption && (
                      <Image
                        source={getRewardImageSource(activityRewardName)}
                        style={styles.historyRewardImage}
                        resizeMode="cover"
                      />
                    )}
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.historyDate, { color: colors.textSecondary }]}>{formatHistoryDate(entry.createdAt)}</ThemedText>
                      <ThemedText style={[styles.historyMeta, { color: colors.text }]}>
                        {entry.orderId
                          ? `Order #${entry.orderId}`
                          : `Reward: ${activityRewardName} (${entry.pointsRedeemed} pts)`}
                      </ThemedText>
                      {isRewardRedemption && (
                        <ThemedText style={[styles.tapHint, { color: colors.textSecondary }]}>Tap to view redeemed item details</ThemedText>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <ThemedText style={[styles.historyPoints, { color: entry.pointsEarned > 0 ? colors.success : colors.error }]}>
                        {entry.pointsEarned > 0 ? `+${entry.pointsEarned}` : `-${entry.pointsRedeemed}`}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                );})}
              </View>
            )}
          </View>

          <View style={[CommonStyles.card, { backgroundColor: colors.cardBackground }]}> 
            <ThemedText style={CommonStyles.cardTitle}>Saved Payment Methods</ThemedText>

            {paymentMethods.length === 0 ? (
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>No saved cards yet.</ThemedText>
            ) : (
              <View style={styles.stack}>
                {paymentMethods.map((method) => {
                  const isBusy = updatingMethodId === method.id;
                  return (
                    <View key={method.id} style={[styles.methodCard, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}> 
                      <View style={styles.methodHead}>
                        <ThemedText style={[styles.methodTitle, { color: colors.text }]}>{formatCardLabel(method)}</ThemedText>
                        {method.isDefault && (
                          <View style={[styles.defaultBadge, { backgroundColor: `${colors.primary}22`, borderColor: colors.primary }]}> 
                            <ThemedText style={[styles.defaultBadgeText, { color: colors.primary }]}>Default</ThemedText>
                          </View>
                        )}
                      </View>

                      <ThemedText style={[styles.methodSub, { color: colors.textSecondary }]}>Cardholder: {method.cardholderName}</ThemedText>
                      <ThemedText style={[styles.methodSub, { color: colors.textSecondary }]}>Exp: {String(method.expMonth).padStart(2, '0')}/{method.expYear}</ThemedText>

                      <View style={styles.methodActions}>
                        {!method.isDefault && (
                          <TouchableOpacity
                            style={[styles.secondaryButton, { borderColor: colors.border }]}
                            onPress={() => handleSetDefault(method.id)}
                            disabled={isBusy}
                            activeOpacity={0.85}
                          >
                            <ThemedText style={[styles.secondaryButtonText, { color: colors.text }]}>{isBusy ? 'Saving...' : 'Set Default'}</ThemedText>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          style={[styles.secondaryButton, { borderColor: colors.error }]}
                          onPress={() => handleDelete(method.id)}
                          disabled={isBusy}
                          activeOpacity={0.85}
                        >
                          <ThemedText style={[styles.secondaryButtonText, { color: colors.error }]}>Delete</ThemedText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <ThemedText style={[styles.sectionLabel, { color: colors.text }]}>Add Payment Method</ThemedText>
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
                value={cardholderName}
                onChangeText={setCardholderName}
                placeholder="Cardholder name"
                placeholderTextColor={colors.textSecondary}
              />

              <TextInput
                style={[
                  CommonStyles.input,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.inputBackground,
                    color: colors.text,
                    letterSpacing: 2,
                  },
                ]}
                value={formatCardNumberInput(cardNumber)}
                onChangeText={(text) => setCardNumber(getDigitsOnly(text).slice(0, 19))}
                placeholder="Card number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={23}
              />
              {cardNumber.length >= 1 && (
                <ThemedText style={[styles.brandHint, { color: colors.textSecondary }]}>
                  {detectCardBrand(cardNumber)} · {cardNumber.length} digits
                </ThemedText>
              )}

              <View style={styles.formRow}>
                <TextInput
                  style={[
                    CommonStyles.input,
                    styles.flexInput,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                    },
                  ]}
                  value={cvv}
                  onChangeText={(text) => setCvv(getDigitsOnly(text).slice(0, 4))}
                  placeholder="CVV"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  maxLength={4}
                />

                <TextInput
                  style={[
                    CommonStyles.input,
                    styles.flexInput,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                    },
                  ]}
                  value={expMonth}
                  onChangeText={setExpMonth}
                  placeholder="MM"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  maxLength={2}
                />

                <TextInput
                  style={[
                    CommonStyles.input,
                    styles.flexInput,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                    },
                  ]}
                  value={expYear}
                  onChangeText={setExpYear}
                  placeholder="YYYY"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>

              <TouchableOpacity
                style={[styles.checkboxRow, { borderColor: colors.border }]}
                onPress={() => setSetAsDefault((prev) => !prev)}
                activeOpacity={0.85}
              >
                <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: setAsDefault ? colors.primary : 'transparent' }]} />
                <ThemedText style={[styles.checkboxLabel, { color: colors.text }]}>Set as default payment method</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary, opacity: addingMethod ? 0.7 : 1 }]}
                onPress={handleAddPaymentMethod}
                disabled={addingMethod}
                activeOpacity={0.85}
              >
                <ThemedText style={styles.addButtonText}>{addingMethod ? 'Adding...' : 'Add Payment Method'}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

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

      <Modal
        visible={!!selectedRedemption}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedRedemption(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Redeemed Item</ThemedText>
            <ThemedText style={[styles.modalSubtitle, { color: colors.textSecondary }]}> 
              {selectedRewardName}
            </ThemedText>
            <ThemedText style={[styles.modalMeta, { color: colors.textSecondary }]}> 
              {selectedRedemption ? `${selectedRedemption.pointsRedeemed} pts · ${formatHistoryDate(selectedRedemption.createdAt)}` : ''}
            </ThemedText>

            <Image source={selectedRewardImage} style={styles.rewardImage} resizeMode="cover" />

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
              onPress={() => setSelectedRedemption(null)}
              activeOpacity={0.85}
            >
              <ThemedText style={styles.closeButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  workSummaryBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  workSummaryText: {
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pillText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 12,
  },
  helperText: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Corben_400Regular',
    fontSize: 14,
  },
  inlineError: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
  },
  pointsBanner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  pointsLabel: {
    fontFamily: 'Corben_700Bold',
    fontSize: 12,
    marginBottom: 2,
  },
  pointsValue: {
    fontFamily: 'Oregano_400Regular',
    fontSize: 34,
    lineHeight: 38,
  },
  sectionLabel: {
    fontFamily: 'Corben_700Bold',
    fontSize: 15,
    marginBottom: 8,
    marginTop: 6,
  },
  emptyText: {
    fontFamily: 'Corben_400Regular',
    fontSize: 14,
    marginBottom: 10,
  },
  stack: {
    gap: 10,
    marginBottom: 12,
  },
  rewardCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  rewardTextWrap: {
    flex: 1,
  },
  rewardItemImage: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  rewardName: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
    marginBottom: 2,
  },
  rewardItemName: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
    marginBottom: 2,
  },
  rewardDescription: {
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
    marginBottom: 4,
  },
  rewardCost: {
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
  },
  actionButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  actionButtonText: {
    color: '#ffffff',
    fontFamily: 'Corben_700Bold',
    fontSize: 12,
  },
  historyRow: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyRewardImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  historyDate: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
  },
  historyMeta: {
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
  },
  tapHint: {
    fontFamily: 'Corben_400Regular',
    fontSize: 11,
    marginTop: 6,
  },
  historyPoints: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Corben_700Bold',
    fontSize: 18,
  },
  modalSubtitle: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  modalMeta: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
    textAlign: 'center',
  },
  rewardImage: {
    width: 220,
    height: 220,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  closeButton: {
    marginTop: 14,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
  },
  methodCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  methodHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  methodTitle: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
    flex: 1,
  },
  methodSub: {
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
    marginBottom: 2,
  },
  defaultBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  defaultBadgeText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 11,
  },
  methodActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 12,
  },
  formStack: {
    gap: 9,
  },
  brandHint: {
    fontSize: 12,
    marginTop: -4,
    paddingLeft: 4,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flexInput: {
    flex: 1,
  },
  checkboxRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderRadius: 4,
  },
  checkboxLabel: {
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
  },
  addButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonText: {
    color: '#ffffff',
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
  },
});

