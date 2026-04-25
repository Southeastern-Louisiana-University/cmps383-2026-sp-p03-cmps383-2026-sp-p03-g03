import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CommonStyles, getColors } from '@/constants/styles';
import { styles } from '@/styles/screens/account.styles';
import { useThemeMode } from '@/contexts/ThemeContext';
import { PageHeaderActions } from '@/components/page-header-actions';
import { getUserPermissions } from '@/utils/role-helpers';
import { AccountProfileSection } from '../../components/account/account-profile-section';
import { WorkAccessSection } from '../../components/account/work-access-section';
import { RewardsSection } from '../../components/account/rewards-section';
import { PaymentMethodsSection } from '../../components/account/payment-methods-section';
import {
  detectCardBrand,
  formatHistoryDate,
  getRewardImageSource,
} from '../../components/account/account-formatters';
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

export default function AccountScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const router = useRouter();
  const { user, checkAuth, isLoading: authLoading, isGuest } = useAuth();
  const isFocused = useIsFocused();
  const { toggleMode } = useThemeMode();

  const { isAdmin, isManager, isPrivileged } = getUserPermissions(user?.roles);
  const hasWorkAccess = isPrivileged;

  const [loyalty, setLoyalty] = useState<LoyaltySummaryDto | null>(null);
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [rewards, setRewards] = useState<RewardDto[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDto[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // payment method form state
  // TODO: payment form has grown – consider breaking into its own modal or screen
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState(''); // raw digits, no spaces
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

    // older ledger rows only recorded points redeemed, not the reward ID
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
      // Only show the full-screen loader on the very first load— keep prior data
      // visible during silent refetches so the screen doesn't flash empty.
      setIsLoading((prev) => (prev ? prev : false));
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

  const addCard = async () => {
    if (addingMethod) return;

    const cleanCardholder = cardholderName.trim();
    const cardDigits = cardNumber;
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

      await addPaymentMethod({
        cardholderName: cleanCardholder,
        cardNumber: cardDigits, // full number for tokenization only
        cvc: cvv.trim(),
        brand: inferredBrand,
        last4: cleanLast4,
        expMonth: month,
        expYear: year,
        isDefault: setAsDefault,
      });

      setCardholderName('');
      setCardNumber('');
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

  const setDefault = async (id: number) => {
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

  const deleteMethod = (id: number) => {
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

  const claimReward = async (reward: RewardDto) => {
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

      void checkAuth(true).catch(() => {
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

  const createTeamMember = async () => {
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

          {isGuest && !user && (
            <View style={[CommonStyles.card, { backgroundColor: colors.cardBackground, alignItems: 'center', paddingVertical: 32 }]}>
              <MaterialIcons name="person-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
              <ThemedText style={[CommonStyles.cardTitle, { color: colors.text, textAlign: 'center' }]}>
                Browsing as Guest
              </ThemedText>
              <ThemedText style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 16 }}>
                Sign in to unlock Rewards, saved payment methods, and your order history.
              </ThemedText>
              <TouchableOpacity
                style={[{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }]}
                onPress={() => router.push('/login')}
              >
                <ThemedText style={{ color: '#fff', fontWeight: '600', fontFamily: 'Inter_700Bold' }}>Sign In / Register</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {user && <AccountProfileSection user={user} colors={colors} />}

          {user && hasWorkAccess && (
            <WorkAccessSection
              user={user}
              colors={colors}
              isAdmin={isAdmin}
              isManager={isManager}
              managedLocations={managedLocations}
              assignableLocations={assignableLocations}
              teamMemberUserName={teamMemberUserName}
              setTeamMemberUserName={setTeamMemberUserName}
              teamMemberDisplayName={teamMemberDisplayName}
              setTeamMemberDisplayName={setTeamMemberDisplayName}
              teamMemberEmail={teamMemberEmail}
              setTeamMemberEmail={setTeamMemberEmail}
              teamMemberPassword={teamMemberPassword}
              setTeamMemberPassword={setTeamMemberPassword}
              teamRole={teamRole}
              setTeamRole={setTeamRole}
              selectedTeamLocationId={selectedTeamLocationId}
              setSelectedTeamLocationId={setSelectedTeamLocationId}
              creatingTeamMember={creatingTeamMember}
              onCreateTeamMember={createTeamMember}
            />
          )}

          <RewardsSection
            colors={colors}
            user={user}
            loyalty={loyalty}
            rewards={rewards}
            redeemingRewardId={redeemingRewardId}
            visibleHistory={visibleHistory}
            resolveRewardName={resolveRewardName}
            onRedeemReward={claimReward}
            onSelectRedemption={setSelectedRedemption}
          />

          <PaymentMethodsSection
            colors={colors}
            paymentMethods={paymentMethods}
            updatingMethodId={updatingMethodId}
            onSetDefault={setDefault}
            onDelete={deleteMethod}
            cardholderName={cardholderName}
            setCardholderName={setCardholderName}
            cardNumber={cardNumber}
            setCardNumber={setCardNumber}
            cvv={cvv}
            setCvv={setCvv}
            expMonth={expMonth}
            setExpMonth={setExpMonth}
            expYear={expYear}
            setExpYear={setExpYear}
            setAsDefault={setAsDefault}
            setSetAsDefault={setSetAsDefault}
            addingMethod={addingMethod}
            onAddPaymentMethod={addCard}
          />

          <View style={[CommonStyles.card, { backgroundColor: colors.cardBackground }]}>
            <ThemedText style={CommonStyles.cardTitle}>About</ThemedText>
            <ThemedText style={styles.description}>
              Caffeinated Lions v1.0.0
            </ThemedText>
            <ThemedText style={[styles.description, { marginTop: 8 }]}>
              Fuel the pride — one sip at a time. ☕
            </ThemedText>
            <ThemedText style={[styles.description, { marginTop: 8 }]}>
              Notifications: coming soon (placeholder enabled).
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
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Redeemed Perk</ThemedText>
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
