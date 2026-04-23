import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CommonStyles, getColors } from '@/constants/styles';
import { styles } from '@/styles/screens/account.styles';
import type { UserDto } from '@/contexts/AuthContext';
import type { LoyaltySummaryDto, RewardDto } from '@/services/api-types';
import { formatHistoryDate, getRewardImageSource, getRewardItemName } from './account-formatters';

type Props = {
  colors: ReturnType<typeof getColors>;
  user: UserDto | null;
  loyalty: LoyaltySummaryDto | null;
  rewards: RewardDto[];
  redeemingRewardId: number | null;
  visibleHistory: LoyaltySummaryDto['history'];
  resolveRewardName: (entry: LoyaltySummaryDto['history'][number]) => string;
  onRedeemReward: (reward: RewardDto) => void;
  onSelectRedemption: (entry: LoyaltySummaryDto['history'][number]) => void;
};

export function RewardsSection({
  colors,
  user,
  loyalty,
  rewards,
  redeemingRewardId,
  visibleHistory,
  resolveRewardName,
  onRedeemReward,
  onSelectRedemption,
}: Props) {
  const availablePoints = loyalty?.points ?? user?.loyaltyPoints ?? 0;

  return (
    <View style={[CommonStyles.card, { backgroundColor: colors.cardBackground }]}>
      <ThemedText style={CommonStyles.cardTitle}>Rewards</ThemedText>

      <View style={[styles.pointsBanner, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
        <ThemedText style={[styles.pointsLabel, { color: colors.textSecondary }]}>Your Points</ThemedText>
        <ThemedText style={[styles.pointsValue, { color: colors.primary }]}>{availablePoints}</ThemedText>
      </View>

      <ThemedText style={[styles.sectionLabel, { color: colors.text }]}>Redeemable Perks</ThemedText>
      {rewards.length === 0 ? (
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>No perks available yet — keep earning!</ThemedText>
      ) : (
        <View style={styles.stack}>
          {rewards.map((reward) => {
            const canRedeem = availablePoints >= reward.pointsCost;
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
                  onPress={() => onRedeemReward(reward)}
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

      <ThemedText style={[styles.sectionLabel, { color: colors.text }]}>Recent Activity</ThemedText>
      {visibleHistory.length === 0 ? (
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>No reward activity yet — start earning!</ThemedText>
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
                    onSelectRedemption(entry);
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
                    <ThemedText style={[styles.tapHint, { color: colors.textSecondary }]}>Tap to view perk details</ThemedText>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <ThemedText style={[styles.historyPoints, { color: entry.pointsEarned > 0 ? colors.success : colors.error }]}>
                    {entry.pointsEarned > 0 ? `+${entry.pointsEarned}` : `-${entry.pointsRedeemed}`}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}