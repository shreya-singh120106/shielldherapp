import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from './theme';

/**
 * Fake iOS-style status bar (09:41) used inside the web desktop phone frame.
 * On native Android/iOS, this renders nothing — the real system status bar is used.
 */
export default function FakeStatusBar() {
  // On native platforms, don't render a fake status bar — the system provides one
  if (Platform.OS !== 'web') {
    return <View style={styles.nativeSpacer} />;
  }

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.time} testID="fake-status-time">9:41</Text>
      <View style={styles.right}>
        <Feather name="wifi" size={14} color={theme.textPrimary} />
        <View style={styles.battery}>
          <View style={styles.batteryFill} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nativeSpacer: {
    height: 4, // minimal spacer on native
  },
  wrap: {
    height: 44,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  time: {
    color: theme.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  battery: {
    width: 24,
    height: 11,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: theme.textPrimary,
    padding: 1,
    marginLeft: 6,
  },
  batteryFill: {
    flex: 1,
    backgroundColor: theme.textPrimary,
    borderRadius: 1.5,
  },
});
