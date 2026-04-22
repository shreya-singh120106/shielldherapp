import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme, radius } from './theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  radius?: number;
  borderColor?: string;
  testID?: string;
};

export default function GlassCard({
  children,
  style,
  intensity = 50,
  radius: r = radius.xl,
  borderColor = theme.glassBorder,
  testID,
}: Props) {
  return (
    <View
      testID={testID}
      style={[
        styles.wrap,
        { borderRadius: r, borderColor, backgroundColor: theme.glassSurface },
        style as any,
      ]}
    >
      {Platform.OS !== 'web' ? (
        <BlurView
          intensity={intensity}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius: r }]}
        />
      ) : null}
      <View style={{ zIndex: 2 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});
