import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POPULAR_CARD_WIDTH = SCREEN_WIDTH * 0.72;

export const POPULAR_CARD_DIMENSIONS = {
  width: POPULAR_CARD_WIDTH,
  spacing: 14,
};

export const styles = StyleSheet.create({
  /* ─── Top bar ─── */
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  brandTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 30,
    height: 30,
  },
  brandName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    letterSpacing: 0.2,
  },

  /* ─── Hero ─── */
  heroWrap: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 24,
    minHeight: 240,
    position: 'relative',
    shadowColor: 'rgba(58,46,31,0.8)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: 240,
    borderRadius: 22,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 22,
    paddingBottom: 26,
  },
  heroTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    color: '#ffffff',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontFamily: 'Lato_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 18,
    lineHeight: 21,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroCtas: {
    flexDirection: 'row',
    gap: 10,
  },
  heroPrimaryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
    minWidth: 140,
    alignItems: 'center',
  },
  heroPrimaryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  heroOutlineBtn: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
  },
  heroOutlineText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#ffffff',
  },
  greeting: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },

  /* ─── Quick actions ─── */
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingHorizontal: 6,
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  quickActionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: 'rgba(58,46,31,0.8)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    textAlign: 'center',
  },
  quickActionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  quickActionBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#ffffff',
  },

  /* ─── Feature benefits row ─── */
  featureBenefitsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  featureBenefitCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: 'rgba(58,46,31,0.8)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  featureBenefitIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureBenefitTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
  featureBenefitDesc: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },

  /* ─── Section headers ─── */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
  },
  sectionLink: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },

  /* ─── Popular Right Now (horizontal scroll) ─── */
  popularScroll: {
    marginBottom: 28,
  },
  popularScrollContent: {
    paddingRight: 20,
  },
  popularCard: {
    width: POPULAR_CARD_WIDTH,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 14,
    borderWidth: 1,
    shadowColor: 'rgba(58,46,31,0.8)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  popularImageWrap: {
    width: '100%',
    height: 170,
    position: 'relative',
  },
  popularImage: {
    width: '100%',
    height: '100%',
  },
  popularImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  popularStaffPick: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  popularStaffPickText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#ffffff',
  },
  popularContent: {
    padding: 14,
    paddingTop: 12,
  },
  popularCategory: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  popularName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    marginBottom: 5,
  },
  popularDesc: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  popularFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
  },
  popularCta: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },

  /* ─── Rewards card ─── */
  rewardsCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: 'rgba(58,46,31,0.8)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  rewardsIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardsTextWrap: {
    flex: 1,
  },
  rewardsTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    marginBottom: 3,
  },
  rewardsSubtitle: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  rewardsPoints: {
    alignItems: 'center',
  },
  rewardsPointsValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    lineHeight: 32,
  },
  rewardsPointsLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    marginTop: 1,
  },

  /* ─── Reservation promo card ─── */
  reservationCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 24,
    marginTop: 4,
    borderWidth: 1,
    width: '100%',
    alignSelf: 'center',
    shadowColor: 'rgba(58,46,31,0.8)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  reservationImageWrap: {
    height: 140,
    position: 'relative',
  },
  reservationImage: {
    width: '100%',
    height: '100%',
  },
  reservationOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  reservationContent: {
    padding: 20,
    paddingTop: 18,
  },
  reservationTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    marginBottom: 6,
  },
  reservationSubtitle: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  reservationBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
  },
  reservationBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#ffffff',
  },

  /* ─── Footer info ─── */
  footerCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  footerCopy: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
});
