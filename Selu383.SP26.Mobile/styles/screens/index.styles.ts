import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  topBarActions: {
    flex: 1,
    minWidth: 0,
  },
  topMenuButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topMenuButtonText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
  },
  heroWrap: {
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 2,
  },
  logo: {
    width: 108,
    height: 108,
    marginBottom: 4,
  },
  welcome: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Oregano_400Regular',
    textAlign: 'center',
    marginBottom: 0,
  },
  tagline: {
    fontSize: 17,
    fontFamily: 'Corben_400Regular',
    textAlign: 'center',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 15,
    fontFamily: 'Corben_400Regular',
    textAlign: 'center',
  },
  primaryAction: {
    borderRadius: 14,
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryActionText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 22,
  },
  secondaryAction: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryActionText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 20,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 12,
  },
  quickPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPillText: {
    fontFamily: 'Corben_700Bold',
    fontSize: 13,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryBlock: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 46,
    marginHorizontal: 14,
    opacity: 0.9,
  },
  summaryLabel: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
    opacity: 0.85,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 26,
    fontFamily: 'Oregano_400Regular',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Corben_700Bold',
    fontSize: 18,
  },
  sectionLink: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
  },
  featuredList: {
    gap: 8,
    marginBottom: 14,
  },
  featuredCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredImage: {
    width: 34,
    height: 34,
    borderRadius: 8,
    marginRight: 10,
  },
  featuredInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  featuredName: {
    fontFamily: 'Corben_700Bold',
    fontSize: 14,
  },
  featuredPrice: {
    fontFamily: 'Corben_700Bold',
    fontSize: 16,
  },
  footerCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  footerTitle: {
    fontFamily: 'Corben_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  footerCopy: {
    fontFamily: 'Corben_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
});
