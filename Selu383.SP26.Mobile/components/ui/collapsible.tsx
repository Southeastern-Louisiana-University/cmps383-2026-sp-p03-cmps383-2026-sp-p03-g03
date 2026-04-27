import React, { PropsWithChildren, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/constants/styles';

type CollapsibleProps = PropsWithChildren<{
  title: string;
}>;

export function Collapsible({ children, title }: CollapsibleProps) {
  const [open, setOpen] = useState(false);
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark');

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        backgroundColor: colors.cardBackground,
      }}
    >
      <TouchableOpacity
        onPress={() => setOpen((prev) => !prev)}
        activeOpacity={0.8}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <MaterialIcons
          name={open ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
          size={20}
          color={colors.icon}
        />
      </TouchableOpacity>

      {open ? <View style={{ marginTop: 10 }}>{children}</View> : null}
    </View>
  );
}
