import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    marginTop: 1,
    lineHeight: 18,
    flexShrink: 1,
  },
  portalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 40,
    lineHeight: 48,
    marginBottom: 2,
    flexShrink: 1,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  infoTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    marginBottom: 4,
  },
  infoText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    lineHeight: 18,
    flexShrink: 1,
  },
  actionCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    marginBottom: 2,
    lineHeight: 20,
    flexShrink: 1,
  },
  actionSubtitle: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    lineHeight: 18,
    flexShrink: 1,
  },
});
