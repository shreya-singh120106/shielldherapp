import React, { useRef } from 'react';
import { Animated, Pressable, ViewStyle, StyleProp, PressableProps } from 'react-native';

type Props = PressableProps & {
  children: React.ReactNode;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
};

// A tiny wrapper that scales children to 95% while pressed — "haptic-feedback visual".
export default function PressableScale({ children, scaleTo = 0.95, style, onPressIn, onPressOut, ...rest }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handleIn = (e: any) => {
    Animated.timing(scale, {
      toValue: scaleTo,
      duration: 80,
      useNativeDriver: true,
    }).start();
    onPressIn?.(e);
  };
  const handleOut = (e: any) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
    onPressOut?.(e);
  };

  return (
    <Pressable onPressIn={handleIn} onPressOut={handleOut} {...rest}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
