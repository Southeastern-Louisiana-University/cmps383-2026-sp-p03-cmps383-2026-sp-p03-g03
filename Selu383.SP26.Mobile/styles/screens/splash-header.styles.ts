import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingRight: 20,
    paddingBottom: 10,
    elevation: 1,
    shadowColor: 'rgba(58,46,31,0.8)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(101, 163, 13, 0.12)',
    marginRight: 2,
  },
  backText: {
    fontSize: 16,
    color: Colors.brandGreen,
    fontFamily: 'Alegreya_700Bold',
  },
  logo: {
    width: 22,
    height: 22,
    marginRight: 4,
  },
  logoText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Alegreya_700Bold',
    color: Colors.brandGreen,
    opacity: 0.92,
    flexShrink: 1,
    marginRight: 10,
  },
  signInButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(101,163,13,0.35)',
    backgroundColor: 'rgba(101,163,13,0.08)',
    marginLeft: 8,
  },
  signInText: {
    color: Colors.brandGreen,
    fontWeight: '700',
    fontSize: 13,
    fontFamily: 'Alegreya_700Bold',
  },
  headerSpacer: {
    width: 70,
  },
});