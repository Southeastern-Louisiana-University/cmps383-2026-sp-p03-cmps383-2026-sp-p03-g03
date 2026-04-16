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
    padding: 20,
    alignItems: 'center',
  },
  headline: {
    fontFamily: 'Oregano_400Regular',
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  copy: {
    fontFamily: 'Corben_400Regular',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  menuButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  menuButtonText: {
    color: '#fff',
    fontFamily: 'Corben_700Bold',
    fontSize: 15,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
    marginBottom: 2,
  },
  itemNote: {
    fontFamily: 'Corben_400Regular',
    fontSize: 12,
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: 'Corben_700Bold',
    fontSize: 15,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
    minWidth: 22,
    textAlign: 'center',
  },
  removeBtn: {
    marginLeft: 4,
    padding: 2,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 6,
    marginBottom: 10,
  },
  addMoreButtonText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
  },
  totalsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    marginBottom: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalRowFinal: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontFamily: 'Corben_400Regular',
    fontSize: 14,
  },
  totalValue: {
    fontFamily: 'Corben_400Regular',
    fontSize: 14,
  },
  totalLabelBold: {
    fontFamily: 'Corben_700Bold',
    fontSize: 16,
  },
  totalValueBold: {
    fontFamily: 'Corben_700Bold',
    fontSize: 18,
  },
  checkoutButton: {
    borderRadius: 14,
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkoutButtonText: {
    color: '#fff',
    fontFamily: 'Corben_700Bold',
    fontSize: 18,
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  clearText: {
    fontFamily: 'Corben_400Regular',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
