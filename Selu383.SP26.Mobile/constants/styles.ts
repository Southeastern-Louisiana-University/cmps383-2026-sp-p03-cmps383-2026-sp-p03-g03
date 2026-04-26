import { StyleSheet, Platform } from 'react-native';
import { Colors } from './theme';

const FONT_SCALE = 1;

// Inter for headings/UI, Lato for body text
export const FontFamily = {
  body: 'Lato_400Regular',
  bodyLight: 'Lato_300Light',
  bodyBold: 'Lato_700Bold',
  heading: 'Inter_700Bold',
  headingSemiBold: 'Inter_600SemiBold',
  headingMedium: 'Inter_500Medium',
  headingRegular: 'Inter_400Regular',
  // legacy aliases — keeps existing callers from breaking
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  display: 'Inter_700Bold',
  displayItalic: 'Inter_700Bold',
} as const;

export const getColors = (isDark: boolean) => ({
  // backgrounds
  background: isDark ? Colors.dark.background : Colors.cream,
  cardBackground: isDark ? Colors.darkCard : '#ffffff',
  inputBackground: isDark ? '#2a2018' : '#ffffff',
  
  // text
  text: isDark ? Colors.dark.text : Colors.darkBrew,
  textSecondary: isDark ? '#9BA1A6' : Colors.mocha,
  textMuted: isDark ? '#666' : Colors.caramel,
  
  // brand
  primary: Colors.brandGreen,
  primaryDark: Colors.brandGreenDark,
  
  // status
  error: Colors.error,
  success: Colors.success,
  warning: Colors.warning,
  
  // borders
  border: isDark ? '#3a2e22' : Colors.sand,
  divider: isDark ? '#2a2018' : Colors.sand,

  // surfaces
  tabBarBackground: isDark ? '#1d1715' : Colors.cream,
  errorBackground: isDark ? '#3a1a1a' : '#ffebee',
  
  // warm accents
  cream: isDark ? '#2a2018' : Colors.cream,
  sand: isDark ? '#3a2e22' : Colors.sand,
  caramel: isDark ? '#9BA1A6' : Colors.caramel,
  espresso: isDark ? '#ccc' : Colors.espresso,
});

export const CommonStyles = {
  safeArea: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 110,
  },
  
  container: {
    alignItems: 'stretch',
    width: '100%',
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#f0e8dd',
    shadowColor: 'rgba(58,46,31,0.8)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: FontFamily.display,
  },
  
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
    fontFamily: FontFamily.display,
  },
  
  subtitle: {
    fontSize: 15,
    opacity: 0.7,
    marginBottom: 16,
    fontFamily: FontFamily.body,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: FontFamily.bodySemiBold,
  },

  value: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
    fontFamily: FontFamily.body,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: FontFamily.body,
  },
  
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  dangerButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.2,
    fontFamily: FontFamily.bodySemiBold,
  },
  
  separator: {
    height: 1,
    marginVertical: 12,
  },
  
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FontFamily.bodySemiBold,
  },
  
  errorText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: FontFamily.bodySemiBold,
  },
  
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontFamily: FontFamily.bodySemiBold,
  },
  
  badge: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FontFamily.bodySemiBold,
  },
  
  rounded: {
    borderRadius: 24,
  },
  
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  smallIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  
  modalHeader: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: FontFamily.display,
  },
  
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
    fontFamily: FontFamily.display,
  },

  // Kicker text pattern (matches web)
  kicker: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: FontFamily.bodySemiBold,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

export const FontSizes = {
  xs: 12,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const FontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;