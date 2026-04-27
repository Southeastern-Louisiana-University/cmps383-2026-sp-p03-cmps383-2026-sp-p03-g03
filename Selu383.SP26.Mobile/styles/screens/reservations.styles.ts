import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  /* Hero banner */
  heroWrap: {
    width: '100%',
    height: 210,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 22,
    shadowColor: 'rgba(58,46,31,0.8)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(29,23,21,0.55)' },
  heroContent: { position: 'absolute', left: 20, right: 20, bottom: 20 },
  heroKicker: {
    fontSize: 10,
    fontFamily: 'Alegreya_700Bold',
    letterSpacing: 2.5,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: 'Alegreya_700Bold',
    lineHeight: 32,
    color: '#ffffff',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: 'Alegreya_400Regular',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 19,
  },

  /* Page header */
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  titleLogo: { width: 36, height: 36 },

  /* Tab switcher */
  tabRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    padding: 4,
    gap: 4,
  },
  tabBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  tabLabel: { fontFamily: 'Alegreya_700Bold', fontSize: 13, letterSpacing: 0.2 },

  /* Empty / error states */
  emptyCard: { borderRadius: 18, borderWidth: 1, padding: 36, alignItems: 'center', marginTop: 8 },
  emptyTitle: { fontFamily: 'Alegreya_700Bold', fontSize: 20, marginBottom: 8, textAlign: 'center' },
  emptyText: {
    fontFamily: 'Alegreya_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  retryBtn: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
  retryText: { fontFamily: 'Alegreya_700Bold', fontSize: 14 },
  bookBtn: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 36 },
  bookBtnText: { color: '#fff', fontFamily: 'Alegreya_700Bold', fontSize: 15, letterSpacing: 0.3 },

  /* Reservation card */
  resCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: 'rgba(58,46,31,0.8)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  resHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  resHeaderInfo: { flex: 1, minWidth: 0, paddingRight: 10 },
  resDate: { fontFamily: 'Alegreya_700Bold', fontSize: 15, marginBottom: 4, flexShrink: 1, paddingRight: 8 },
  resMeta: { fontFamily: 'Alegreya_400Regular', fontSize: 13, lineHeight: 18, opacity: 0.75 },

  statusBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, flexShrink: 0 },
  statusText: { fontFamily: 'Alegreya_700Bold', fontSize: 11, letterSpacing: 0.3 },
  specialReq: {
    fontFamily: 'Alegreya_400Regular',
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 14,
    lineHeight: 20,
    opacity: 0.8,
  },

  /* Cancel / confirm */
  cancelBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 11, alignItems: 'center', marginTop: 6 },
  cancelBtnText: { color: '#ef4444', fontFamily: 'Alegreya_700Bold', fontSize: 13, letterSpacing: 0.2 },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  confirmText: { fontFamily: 'Alegreya_700Bold', fontSize: 13, marginRight: 2 },
  confirmYes: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  confirmYesText: { color: '#fff', fontFamily: 'Alegreya_700Bold', fontSize: 13 },
  confirmNo: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  confirmNoText: { fontFamily: 'Alegreya_700Bold', fontSize: 13 },

  /* Form sections */
  section: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: 'rgba(58,46,31,0.8)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: { fontFamily: 'Alegreya_700Bold', fontSize: 15, marginBottom: 14, letterSpacing: 0.2 },

  /* Location picker */
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  locationName: { fontFamily: 'Alegreya_700Bold', fontSize: 14 },
  locationAddr: { fontFamily: 'Alegreya_400Regular', fontSize: 12, marginTop: 2, opacity: 0.7 },

  /* Party size */
  partySizeRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  sizeBtn: { width: 52, height: 52, borderWidth: 1.5, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  sizeBtnText: { fontFamily: 'Alegreya_700Bold', fontSize: 17 },

  /* Time grid */
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeBtn: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  timeBtnText: { fontFamily: 'Alegreya_700Bold', fontSize: 13, letterSpacing: 0.1 },

  /* Table picker */
  tableOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  tableText: { fontFamily: 'Alegreya_700Bold', fontSize: 14 },

  /* Manage tab */
  manageRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  manageButton: { flex: 1, borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  manageDangerButton: { backgroundColor: '#ef4444' },
  manageButtonText: { color: '#fff', fontFamily: 'Alegreya_700Bold', fontSize: 13 },

  /* Special requests input */
  inputWrap: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, minHeight: 88 },
  input: { fontFamily: 'Alegreya_400Regular', fontSize: 14, lineHeight: 22 },

  /* Error text */
  errorText: { color: '#ef4444', fontFamily: 'Alegreya_400Regular', fontSize: 13, marginBottom: 14, textAlign: 'center', lineHeight: 20 },
  inlineError: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 14 },
  inlineErrorText: { flex: 1, color: '#ef4444', fontFamily: 'Alegreya_400Regular', fontSize: 13, lineHeight: 19 },

  /* Submit button */
  bookSubmitBtn: {
    borderRadius: 16,
    minHeight: 58,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: 'rgba(58,46,31,0.8)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  bookSubmitText: { color: '#fff', fontFamily: 'Alegreya_700Bold', fontSize: 17, letterSpacing: 0.4 },
});
