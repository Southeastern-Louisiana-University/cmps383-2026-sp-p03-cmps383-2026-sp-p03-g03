import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingRight: 18,
    paddingBottom: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
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
    fontFamily: 'Corben_700Bold',
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 4,
  },
  logoText: {
    fontSize: 17,
    lineHeight: 21,
    fontFamily: 'Corben_700Bold',
    color: Colors.brandGreen,
    opacity: 0.92,
    flexShrink: 1,
    marginRight: 10,
  },
  signInButton: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(101,163,13,0.5)',
    backgroundColor: 'transparent',
    marginLeft: 8,
  },
  signInText: {
    color: Colors.brandGreen,
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'Corben_700Bold',
  },
  headerSpacer: {
    width: 70,
  },
});
