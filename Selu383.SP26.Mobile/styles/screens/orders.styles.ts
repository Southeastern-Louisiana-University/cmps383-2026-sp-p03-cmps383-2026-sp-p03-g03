import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  titleLogo: {
    width: 34,
    height: 34,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 14,
  },
  badgeText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 12,
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'Oregano_400Regular',
    fontSize: 26,
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: 'Corben_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  retryBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  retryText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
  },
  menuBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  menuBtnText: {
    color: '#fff',
    fontFamily: 'Corben_700Bold',
    fontSize: 15,
  },
  orderCard: {
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  orderHeaderInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  orderCode: {
    fontFamily: 'Corben_700Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  orderDate: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
  },
  badges: {
    flexDirection: 'column',
    gap: 4,
    alignItems: 'flex-end',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 11,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  metaText: {
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
  },
  total: {
    fontFamily: 'Corben_700Bold',
    fontSize: 16,
  },
  itemsBlock: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemQty: {
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
    minWidth: 24,
  },
  itemName: {
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
    flex: 1,
  },
  itemPrice: {
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
  },
  manageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  actionButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#2563eb',
  },
  dangerButton: {
    backgroundColor: '#dc2626',
  },
  actionButtonText: {
    color: '#fff',
    fontFamily: 'Corben_700Bold',
    fontSize: 12,
  },
  orderNote: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
