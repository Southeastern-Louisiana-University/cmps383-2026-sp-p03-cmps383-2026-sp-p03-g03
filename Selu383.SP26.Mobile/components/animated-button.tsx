import React, { useRef, useEffect } from 'react';
import {
  Animated,
  Pressable,
  PressableProps,
  ViewStyle,
  StyleProp,
} from 'react-native';

interface AnimatedButtonProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function AnimatedButton({
  style,
  children,
  onPress,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (disabled) {
      scaleAnim.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [scaleAnim, disabled]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        {...props}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
