import { useColorScheme as useRNColorScheme } from 'react-native';
import { useThemeMode } from '@/contexts/ThemeContext';

export function useColorScheme() {
	try {
		return useThemeMode().colorScheme;
	} catch {
		return useRNColorScheme();
	}
}
