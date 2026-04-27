import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  container: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Alegreya_700Bold',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
    fontFamily: 'Alegreya_400Regular',
  },
  modeTitle: {
    fontSize: 22,
    lineHeight: 30,
    marginBottom: 14,
    fontFamily: 'Alegreya_700Bold',
  },
  errorContainer: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  errorText: {
    color: '#c62828',
    fontWeight: '600',
    fontFamily: 'Alegreya_700Bold',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Alegreya_700Bold',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 20,
    minHeight: 48,
    fontFamily: 'Alegreya_400Regular',
  },
  loginButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    minHeight: 50,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: 'bold',
    fontFamily: 'Alegreya_700Bold',
    textAlign: 'center',
  },
  infoText: {
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
    fontFamily: 'Alegreya_400Regular',
  },
  toggleText: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Alegreya_700Bold',
    textAlign: 'center',
  },
});
