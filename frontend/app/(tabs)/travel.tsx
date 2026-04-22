import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Defs, LinearGradient as SvgLG, Stop } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import GlassCard from '../../src/GlassCard';
import FakeStatusBar from '../../src/StatusBarFake';

const { width } = Dimensions.get('window');
const MAP_IMG =
  'https://images.unsplash.com/photo-1768270946541-c3e1cfdf80f9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbWFwJTIwbmlnaHQlMjBjaXR5JTIwc3RyZWV0fGVufDB8fHx8MTc3Njg2ODg4MXww&ixlib=rb-4.1.0&q=85';

function ScoreGauge({ value }: { value: number }) {
  const size = 72;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLG id="g1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={theme.travel} />
            <Stop offset="1" stopColor={theme.travelDeep} />
          </SvgLG>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#g1)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '800' }}>
            {value}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function TravelScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root} testID="travel-screen">
      <ImageBackground source={{ uri: MAP_IMG }} style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['rgba(13,11,20,0.45)', 'rgba(13,11,20,0.85)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      {/* Neon route overlay */}
      <View pointerEvents="none" style={styles.routeGlow}>
        <LinearGradient
          colors={['rgba(0,255,156,0.0)', 'rgba(0,255,156,0.35)', 'rgba(0,255,156,0.0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={{ paddingTop: insets.top }}>
        <FakeStatusBar />
      </View>

      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.pill}>
          {Platform.OS !== 'web' ? (
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null}
          <View style={styles.pillInner}>
            <View style={styles.meshIconWrap}>
              <Feather name="bluetooth" size={12} color={theme.cyber} />
            </View>
            <Text style={styles.pillText}>Offline Mode Active</Text>
            <View style={styles.meshDots}>
              <View style={[styles.meshDot, { backgroundColor: theme.cyber }]} />
              <View style={[styles.meshDot, { backgroundColor: theme.cyber, opacity: 0.6 }]} />
              <View style={[styles.meshDot, { backgroundColor: theme.cyber, opacity: 0.3 }]} />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="layers" size={18} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Floating waypoints */}
      <View style={[styles.pin, { top: '32%', left: '20%' }]} pointerEvents="none">
        <View style={[styles.pinDot, { backgroundColor: theme.travel }]} />
        <View style={[styles.pinRing, { borderColor: theme.travel }]} />
      </View>
      <View style={[styles.pin, { top: '48%', left: '64%' }]} pointerEvents="none">
        <View style={[styles.pinDot, { backgroundColor: '#FFC547' }]} />
        <View style={[styles.pinRing, { borderColor: '#FFC547' }]} />
      </View>
      <View style={[styles.pin, { top: '40%', left: '45%' }]} pointerEvents="none">
        <View style={[styles.pinUser]}>
          <Feather name="navigation" size={14} color="#0D0B14" />
        </View>
      </View>

      {/* Bottom sheet */}
      <View style={styles.sheetWrap}>
        <GlassCard intensity={80} style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>ACTIVE ROUTE</Text>
              <Text style={styles.sheetTitle}>Bandra → Powai</Text>
              <Text style={styles.sheetSub}>Arrives 10:12 PM • 6 safe stops</Text>
            </View>
            <ScoreGauge value={87} />
          </View>

          <View style={styles.divider} />

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Safety Score</Text>
            <Text style={styles.scoreValue}>
              <Text style={{ color: theme.travel }}>87</Text>
              <Text style={{ color: theme.textMuted }}>/100</Text>
            </Text>
          </View>

          <View style={styles.factorList}>
            {[
              { icon: 'users', label: 'Crowd density', val: 'High', color: theme.travel },
              { icon: 'sun', label: 'Lighting', val: 'Excellent', color: theme.travel },
              { icon: 'activity', label: 'Recent incidents', val: '0 in 2km', color: theme.travel },
              { icon: 'wifi', label: 'Mesh coverage', val: '12 nodes', color: theme.cyber },
            ].map((f) => (
              <View key={f.label} style={styles.factorItem}>
                <View style={styles.factorIconWrap}>
                  <Feather name={f.icon as any} size={13} color={f.color} />
                </View>
                <Text style={styles.factorLabel}>{f.label}</Text>
                <Text style={[styles.factorVal, { color: f.color }]}>{f.val}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity activeOpacity={0.85} style={styles.ctaBtn} testID="start-trip">
            <LinearGradient
              colors={theme.gradients.travel}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaInner}
            >
              <Feather name="navigation" size={16} color="#001A0C" />
              <Text style={styles.ctaText}>Start Guarded Trip</Text>
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  routeGlow: {
    position: 'absolute',
    top: '25%',
    left: -40,
    right: -40,
    height: 2,
    transform: [{ rotate: '18deg' }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 4,
    gap: 12,
  },
  pill: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(13,11,20,0.5)',
  },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  meshIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,229,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    flex: 1,
    color: theme.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  meshDots: { flexDirection: 'row', gap: 3 },
  meshDot: { width: 5, height: 5, borderRadius: 2.5 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13,11,20,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  pin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 2,
  },
  pinRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    opacity: 0.5,
  },
  pinUser: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.travel,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.travel,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },

  sheetWrap: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 16,
  },
  sheet: {
    padding: 20,
    paddingTop: 14,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  eyebrow: {
    color: theme.travel,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '800',
  },
  sheetTitle: {
    color: theme.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  sheetSub: {
    color: theme.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  scoreLabel: {
    color: theme.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  factorList: { gap: 10, marginBottom: 16 },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  factorIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  factorLabel: {
    color: theme.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  factorVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  ctaBtn: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  ctaText: {
    color: '#001A0C',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
