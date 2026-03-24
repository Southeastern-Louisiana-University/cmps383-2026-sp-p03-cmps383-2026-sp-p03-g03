import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useThemeMode } from '@/contexts/ThemeContext';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  let appScheme: ReturnType<typeof useRNColorScheme> | null = null;
  try {
    appScheme = useThemeMode().colorScheme;
  } catch {
    appScheme = null;
  }

  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = appScheme ?? useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
