import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet, Platform, useWindowDimensions, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

// Phone-frame dimensions for desktop view
const PHONE_W = 420;
const PHONE_H = 900;
const DESKTOP_BREAKPOINT = 820;

function DesktopFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;

  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <View style={frame.root}>
      {/* Animated gradient background */}
      <LinearGradient
        colors={['#0F0B1A', '#0D0B14', '#080611']}
        style={StyleSheet.absoluteFill}
      />
      <View style={frame.glowA}>
        <LinearGradient
          colors={['rgba(255,117,143,0.18)', 'rgba(13,11,20,0)']}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={frame.glowB}>
        <LinearGradient
          colors={['rgba(0,229,255,0.12)', 'rgba(13,11,20,0)']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Left hero panel */}
      <View style={frame.hero}>
        <View style={frame.brandRow}>
          <LinearGradient
            colors={['#FF9EB1', '#FF4D6D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={frame.brandIcon}
          >
            <Feather name="shield" size={22} color="#0D0B14" />
          </LinearGradient>
          <Text style={frame.brand}>ShieldHer</Text>
        </View>

        <Text style={frame.heroEyebrow}>SERIES-A · WOMEN'S SAFETY OS</Text>
        <Text style={frame.heroTitle}>
          One platform.{'\n'}
          <Text style={{ color: '#00FF9C' }}>Three shields.</Text>{'\n'}
          <Text style={{ color: '#FF758F' }}>Zero compromise.</Text>
        </Text>
        <Text style={frame.heroSub}>
          Travel safety, AI-blocked digital harassment, and cycle-aware career growth — fused into one
          glassmorphic mobile experience now installable on your laptop.
        </Text>

        <View style={frame.statsRow}>
          {[
            { v: '99.2%', l: 'AI accuracy' },
            { v: '2.4M', l: 'safe trips' },
            { v: '+38%', l: 'job match' },
          ].map((s) => (
            <View key={s.l} style={frame.statBox}>
              <Text style={frame.statV}>{s.v}</Text>
              <Text style={frame.statL}>{s.l}</Text>
            </View>
          ))}
        </View>

        <View style={frame.tipRow}>
          <Feather name="zap" size={12} color="#FF758F" />
          <Text style={frame.tipText}>
            Tip — install ShieldHer from your browser menu to launch it like a native app.
          </Text>
        </View>
      </View>

      {/* Phone frame */}
      <View style={frame.phoneOuter}>
        <View style={frame.phoneShadow} />
        <View style={frame.phone}>
          {/* Notch */}
          <View style={frame.notch} />
          {/* Side buttons */}
          <View style={[frame.sideBtn, { top: 120 }]} />
          <View style={[frame.sideBtn, { top: 180, height: 60 }]} />
          <View style={[frame.sideBtn, { top: 260, height: 60 }]} />
          <View style={[frame.sideBtnRight, { top: 160, height: 90 }]} />

          {/* Screen */}
          <View style={frame.screen}>{children}</View>
        </View>
        <Text style={frame.deviceLabel}>iPhone 15 Pro · ShieldHer Demo</Text>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0D0B14' }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <DesktopFrame>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0D0B14' },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="wellness"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                gestureEnabled: true,
              }}
            />
          </Stack>
        </DesktopFrame>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const frame = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D0B14',
    paddingHorizontal: 60,
    gap: 80,
    overflow: 'hidden',
    minHeight: PHONE_H + 80,
  },
  glowA: {
    position: 'absolute',
    top: -300,
    left: -200,
    width: 700,
    height: 700,
    borderRadius: 350,
  },
  glowB: {
    position: 'absolute',
    bottom: -300,
    right: -200,
    width: 700,
    height: 700,
    borderRadius: 350,
  },
  hero: {
    flex: 1,
    maxWidth: 540,
    alignItems: 'flex-start',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 36,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroEyebrow: {
    color: '#FF758F',
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '800',
    marginBottom: 18,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 60,
    letterSpacing: -2,
    marginBottom: 22,
  },
  heroSub: {
    color: '#A0A0B0',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
    marginBottom: 36,
    maxWidth: 480,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 32,
  },
  statBox: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  statV: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statL: {
    color: '#A0A0B0',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: 2,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: 'rgba(255,117,143,0.4)',
    backgroundColor: 'rgba(255,117,143,0.06)',
  },
  tipText: {
    color: '#A0A0B0',
    fontSize: 12,
    fontWeight: '500',
  },

  phoneOuter: {
    alignItems: 'center',
  },
  phoneShadow: {
    position: 'absolute',
    width: PHONE_W + 60,
    height: PHONE_H + 40,
    top: 20,
    left: -30,
    backgroundColor: '#FF758F',
    opacity: 0.25,
    borderRadius: 80,
    // @ts-ignore web only
    filter: 'blur(80px)' as any,
  },
  phone: {
    width: PHONE_W,
    height: PHONE_H,
    backgroundColor: '#1A1822',
    borderRadius: 56,
    padding: 12,
    borderWidth: 2,
    borderColor: '#2A2837',
    overflow: 'hidden',
    // @ts-ignore web only
    boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 4px #0D0B14' as any,
    position: 'relative',
  },
  notch: {
    position: 'absolute',
    top: 18,
    left: '50%',
    width: 110,
    height: 32,
    marginLeft: -55,
    backgroundColor: '#000',
    borderRadius: 20,
    zIndex: 10,
  },
  sideBtn: {
    position: 'absolute',
    left: -3,
    width: 3,
    height: 30,
    backgroundColor: '#1A1822',
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  sideBtnRight: {
    position: 'absolute',
    right: -3,
    width: 3,
    backgroundColor: '#1A1822',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  screen: {
    flex: 1,
    backgroundColor: '#0D0B14',
    borderRadius: 44,
    overflow: 'hidden',
  },
  deviceLabel: {
    color: '#5A5A6A',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 18,
  },
});
