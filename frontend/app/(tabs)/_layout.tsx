import React from 'react';
import { Tabs, usePathname } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme';

type TabDef = {
  key: string;
  label: string;
  route: string;
  icon: keyof typeof Feather.glyphMap;
  accent: string;
};

const TABS: TabDef[] = [
  { key: 'home', label: 'Home', route: '/(tabs)', icon: 'home', accent: '#FFFFFF' },
  { key: 'travel', label: 'Travel', route: '/(tabs)/travel', icon: 'map-pin', accent: theme.travel },
  { key: 'cyber', label: 'Shield', route: '/(tabs)/cyber', icon: 'shield', accent: theme.cyber },
  { key: 'growth', label: 'Growth', route: '/(tabs)/growth', icon: 'briefcase', accent: theme.wellness },
];

function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    if (route === '/(tabs)') return pathname === '/' || pathname === '/(tabs)';
    return pathname.endsWith(route.replace('/(tabs)', ''));
  };

  return (
    <View style={styles.wrap} pointerEvents="box-none" testID="bottom-nav">
      <View style={styles.barOuter}>
        {Platform.OS !== 'web' ? (
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={styles.barInner}>
          {TABS.map((t) => {
            const active = isActive(t.route);
            return (
              <TouchableOpacity
                key={t.key}
                activeOpacity={0.8}
                onPress={() => router.push(t.route as any)}
                style={styles.tabBtn}
                testID={`tab-${t.key}`}
              >
                <View
                  style={[
                    styles.iconWrap,
                    active && {
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderColor: t.accent,
                      shadowColor: t.accent,
                      shadowOpacity: 0.8,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 0 },
                    },
                  ]}
                >
                  <Feather
                    name={t.icon}
                    size={20}
                    color={active ? t.accent : theme.textSecondary}
                  />
                </View>
                <Text
                  style={[
                    styles.label,
                    { color: active ? theme.textPrimary : theme.textMuted },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          sceneStyle: { backgroundColor: theme.bg },
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="travel" />
        <Tabs.Screen name="cyber" />
        <Tabs.Screen name="growth" />
      </Tabs>
      <CustomTabBar />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  barOuter: {
    width: '100%',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(13,11,20,0.72)',
    overflow: 'hidden',
  },
  barInner: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
