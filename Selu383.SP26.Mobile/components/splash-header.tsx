import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { styles } from '@/styles/screens/splash-header.styles';

interface HeaderProps {
  onSignInPress: () => void;
  isDark?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onSignInPress, isDark = false }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 8,
          backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
        },
      ]}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/ConceptLogo2-FpjOWRtT.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={styles.logoText}>Caffeinated Lions</ThemedText>
      </View>
      <TouchableOpacity style={styles.signInButton} onPress={onSignInPress}>
        <ThemedText style={styles.signInText}>Sign In</ThemedText>
      </TouchableOpacity>
    </View>
  );
};
