import { StyleSheet, Platform } from 'react-native';
import { Colors } from './theme';


export const getColors = (isDark: boolean) => ({
  // Backgrounds
  background: isDark ? Colors.dark.background : Colors.light.background,
  cardBackground: isDark ? Colors.darkCard : '#f5f5f5',
  inputBackground: isDark ? '#3a3a3a' : '#f9f9f9',
  
  // Text
  text: isDark ? Colors.dark.text : Colors.light.text,
  textSecondary: isDark ? '#9BA1A6' : '#687076',
  
  // Branding
  primary: Colors.brandGreen,
  
  // Status
  error: Colors.error,
  success: Colors.success,
  warning: Colors.warning,
  
  // Borders and dividers
  border: isDark ? '#3a3a3a' : '#e5e7eb',
  divider: isDark ? '#2a2a2a' : '#f0f0f0',
});

/**
 * Common component styles
 */
export const CommonStyles = {
  safeArea: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  
  container: {
    alignItems: 'stretch',
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  
  primaryButton: {
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  dangerButton: {
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  separator: {
    height: 1,
    marginVertical: 12,
  },
  
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
} as const;

/**
 * Spacing constants
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

/**
 * Border radius constants
 */
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

/**
 * Font size constants
 */
export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
};

/**
 * Font weight constants
 */
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
