import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
