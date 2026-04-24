import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CommonStyles, getColors } from '@/constants/styles';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark');

  return (
    <ThemedView style={[CommonStyles.centerContainer, { backgroundColor: colors.background, paddingHorizontal: 24 }]}>
      <ThemedText type="title" style={{ marginBottom: 12, textAlign: 'center' }}>
        Internal Screen
      </ThemedText>
      <ThemedText style={{ color: colors.textSecondary, textAlign: 'center', maxWidth: 420 }}>
        This route is kept out of the tab bar and is not part of the customer flow.
      </ThemedText>
    </ThemedView>
  );
}
