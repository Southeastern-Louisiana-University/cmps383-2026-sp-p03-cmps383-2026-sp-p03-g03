import { StyleSheet } from 'react-native';
import { FontFamily } from '@/constants/styles';

export const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleLogo: {
    width: 38,
    height: 38,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: FontFamily.display,
  },
  cartBtn: {
    position: 'relative',
    padding: 6,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FontFamily.bodyBold,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 18,
    gap: 10,
    shadowColor: 'rgba(58,46,31,0.8)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: FontFamily.body,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },

  itemCount: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 10,
    fontFamily: FontFamily.body,
  },

  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    opacity: 0.6,
    fontFamily: FontFamily.body,
    textAlign: 'center',
  },

  /* ─── Featured hint ─── */
  featuredHint: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: FontFamily.bodySemiBold,
  },

  /* ─── Manager controls ─── */
  managerRow: {
    alignItems: 'flex-end',
    marginTop: -4,
    marginBottom: 10,
  },
  managerButton: {
    borderRadius: 12,
    minHeight: 38,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  managerButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.bodyBold,
  },

  /* ─── Add Item button ─── */
  addItemBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ─── Add Item Modal ─── */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: FontFamily.display,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FontFamily.bodySemiBold,
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: FontFamily.body,
    marginBottom: 14,
  },
  formInputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  catChip: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FontFamily.bodySemiBold,
  },
  addItemError: {
    color: '#ef4444',
    fontSize: 13,
    fontFamily: FontFamily.body,
    marginBottom: 12,
    textAlign: 'center',
  },
  addItemSubmitBtn: {
    borderRadius: 14,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  addItemSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FontFamily.bodyBold,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalSecondaryBtn: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSecondaryBtnText: {
    fontSize: 14,
    fontFamily: FontFamily.bodySemiBold,
  },
  modalPrimaryBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FontFamily.bodyBold,
  },
});
