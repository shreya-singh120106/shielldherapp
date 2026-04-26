import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  ScrollView,
  Animated,
  Easing,
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Defs, LinearGradient as SvgLG, Stop } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import GlassCard from '../../src/GlassCard';
import FakeStatusBar from '../../src/StatusBarFake';
import PressableScale from '../../src/PressableScale';

const { width } = Dimensions.get('window');

// ============================================================
// DYNAMIC SAFETY DATABASE
// Each zone has base metrics that get modified by time-of-day
// ============================================================

type Zone = {
  id: string;
  name: string;
  city: string;
  baseSafety: number;       // 0-100
  crimeIndex: number;       // 0-10 (higher = more crime)
  lightingQuality: number;  // 0-10 (higher = better lit)
  crowdDensity: number;     // 0-10 (higher = more people)
  meshNodes: number;        // BLE mesh coverage
  policeProximity: number;  // 0-10 (higher = closer)
  transitAccess: number;    // 0-10 (higher = better transit)
};

const ZONES: Zone[] = [
  // Mumbai
  { id: 'bandra', name: 'Bandra West', city: 'Mumbai', baseSafety: 82, crimeIndex: 2.5, lightingQuality: 8, crowdDensity: 7, meshNodes: 14, policeProximity: 7, transitAccess: 9 },
  { id: 'powai', name: 'Powai', city: 'Mumbai', baseSafety: 78, crimeIndex: 3, lightingQuality: 7, crowdDensity: 6, meshNodes: 11, policeProximity: 6, transitAccess: 7 },
  { id: 'andheri', name: 'Andheri East', city: 'Mumbai', baseSafety: 71, crimeIndex: 4.5, lightingQuality: 6, crowdDensity: 8, meshNodes: 9, policeProximity: 5, transitAccess: 8 },
  { id: 'colaba', name: 'Colaba', city: 'Mumbai', baseSafety: 85, crimeIndex: 2, lightingQuality: 9, crowdDensity: 6, meshNodes: 16, policeProximity: 9, transitAccess: 8 },
  { id: 'dharavi', name: 'Dharavi', city: 'Mumbai', baseSafety: 52, crimeIndex: 6.5, lightingQuality: 3, crowdDensity: 9, meshNodes: 4, policeProximity: 3, transitAccess: 5 },
  // Delhi
  { id: 'cp', name: 'Connaught Place', city: 'Delhi NCR', baseSafety: 80, crimeIndex: 3.5, lightingQuality: 8, crowdDensity: 8, meshNodes: 12, policeProximity: 8, transitAccess: 9 },
  { id: 'saket', name: 'Saket', city: 'Delhi NCR', baseSafety: 76, crimeIndex: 4, lightingQuality: 7, crowdDensity: 6, meshNodes: 10, policeProximity: 7, transitAccess: 8 },
  { id: 'noida', name: 'Noida Sec-18', city: 'Delhi NCR', baseSafety: 68, crimeIndex: 5, lightingQuality: 6, crowdDensity: 7, meshNodes: 7, policeProximity: 5, transitAccess: 7 },
  // Bengaluru
  { id: 'indiranagar', name: 'Indiranagar', city: 'Bengaluru', baseSafety: 84, crimeIndex: 2, lightingQuality: 8, crowdDensity: 7, meshNodes: 13, policeProximity: 7, transitAccess: 7 },
  { id: 'koramangala', name: 'Koramangala', city: 'Bengaluru', baseSafety: 79, crimeIndex: 3, lightingQuality: 7, crowdDensity: 7, meshNodes: 11, policeProximity: 6, transitAccess: 7 },
  { id: 'whitefield', name: 'Whitefield', city: 'Bengaluru', baseSafety: 72, crimeIndex: 3.5, lightingQuality: 6, crowdDensity: 5, meshNodes: 8, policeProximity: 5, transitAccess: 6 },
  // Hyderabad
  { id: 'hitech', name: 'HITEC City', city: 'Hyderabad', baseSafety: 81, crimeIndex: 2.5, lightingQuality: 8, crowdDensity: 6, meshNodes: 12, policeProximity: 7, transitAccess: 7 },
  // Pune
  { id: 'koregaon', name: 'Koregaon Park', city: 'Pune', baseSafety: 77, crimeIndex: 3, lightingQuality: 7, crowdDensity: 6, meshNodes: 9, policeProximity: 6, transitAccess: 6 },
];

// Get unique cities for picker
const CITIES = [...new Set(ZONES.map(z => z.city))];

// ============================================================
// DYNAMIC SAFETY SCORING ENGINE
// ============================================================

function getTimeOfDay(): { hour: number; period: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night' | 'latenight' } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 7) return { hour, period: 'dawn' };
  if (hour >= 7 && hour < 12) return { hour, period: 'morning' };
  if (hour >= 12 && hour < 17) return { hour, period: 'afternoon' };
  if (hour >= 17 && hour < 21) return { hour, period: 'evening' };
  if (hour >= 21 && hour < 24) return { hour, period: 'night' };
  return { hour, period: 'latenight' };
}

function getTimeModifiers(period: string) {
  switch (period) {
    case 'morning': return { safety: 8, lighting: 'Excellent', crowd: 'Moderate', riskLevel: 'low' };
    case 'afternoon': return { safety: 6, lighting: 'Excellent', crowd: 'High', riskLevel: 'low' };
    case 'evening': return { safety: 2, lighting: 'Good', crowd: 'High', riskLevel: 'moderate' };
    case 'dawn': return { safety: -2, lighting: 'Dim', crowd: 'Very Low', riskLevel: 'moderate' };
    case 'night': return { safety: -8, lighting: 'Poor', crowd: 'Low', riskLevel: 'high' };
    case 'latenight': return { safety: -15, lighting: 'Very Poor', crowd: 'Minimal', riskLevel: 'critical' };
    default: return { safety: 0, lighting: 'Good', crowd: 'Moderate', riskLevel: 'moderate' };
  }
}

function computeSafetyScore(zone: Zone, destZone?: Zone): {
  score: number;
  lighting: string;
  crowd: string;
  incidents: string;
  meshCoverage: string;
  riskLevel: string;
  safeStops: number;
  eta: string;
  tips: string[];
} {
  const { period } = getTimeOfDay();
  const timeMods = getTimeModifiers(period);

  // Base score from zone
  let score = zone.baseSafety;

  // Time modifier
  score += timeMods.safety;

  // Lighting bonus/penalty
  const lightingScore = zone.lightingQuality;
  if (period === 'night' || period === 'latenight') {
    score += (lightingScore - 5) * 1.5; // lighting matters more at night
  }

  // Crowd bonus (more people = safer for women in most cases)
  if (period !== 'latenight') {
    score += (zone.crowdDensity - 5) * 0.5;
  }

  // Crime penalty
  score -= zone.crimeIndex * 1.5;

  // Police proximity bonus
  score += zone.policeProximity * 0.3;

  // Route-based adjustment (if destination has lower safety)
  if (destZone) {
    const destScore = destZone.baseSafety + timeMods.safety - destZone.crimeIndex * 1.5;
    score = Math.round((score + destScore) / 2); // average of origin and dest
  }

  // Clamp
  score = Math.max(15, Math.min(98, Math.round(score)));

  // Dynamic lighting description
  let lighting = timeMods.lighting;
  if (zone.lightingQuality >= 8 && (period === 'evening' || period === 'night')) {
    lighting = 'Well-lit streets';
  }

  // Dynamic crowd
  let crowd = timeMods.crowd;
  if (zone.crowdDensity >= 8 && (period === 'afternoon' || period === 'evening')) {
    crowd = 'Very High';
  }

  // Dynamic incidents (based on crime index + some randomness from time)
  const incidentBase = Math.max(0, Math.round(zone.crimeIndex * 0.6));
  const incidents = incidentBase === 0 ? '0 in 2km' : `${incidentBase} in 2km`;

  // Mesh coverage
  const meshCoverage = `${zone.meshNodes} nodes`;

  // Risk level
  let riskLevel = timeMods.riskLevel;
  if (score >= 80) riskLevel = 'low';
  else if (score >= 65) riskLevel = 'moderate';
  else if (score >= 50) riskLevel = 'high';
  else riskLevel = 'critical';

  // Safe stops based on transit and police
  const safeStops = Math.max(2, Math.round((zone.transitAccess + zone.policeProximity) / 3));

  // ETA based on distance simulation
  const now = new Date();
  const etaMin = 15 + Math.round(Math.random() * 20);
  const arriveAt = new Date(now.getTime() + etaMin * 60000);
  const eta = `${arriveAt.getHours()}:${String(arriveAt.getMinutes()).padStart(2, '0')} ${arriveAt.getHours() >= 12 ? 'PM' : 'AM'}`;

  // Dynamic safety tips
  const tips: string[] = [];
  if (period === 'night' || period === 'latenight') {
    tips.push('Stick to well-lit main roads');
    if (zone.crimeIndex > 4) tips.push('Share live location with trusted contacts');
  }
  if (zone.crimeIndex > 5) tips.push('Avoid isolated side streets');
  if (zone.crowdDensity < 4) tips.push('Travel with a companion if possible');
  if (riskLevel === 'critical') tips.push('Consider postponing non-essential travel');
  if (score >= 80) tips.push('Route verified safe — enjoy your journey');

  return { score, lighting, crowd, incidents, meshCoverage, riskLevel, safeStops, eta, tips };
}

// ============================================================
// SVG GAUGE COMPONENT
// ============================================================

function ScoreGauge({ value, size = 72 }: { value: number; size?: number }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  const scoreColor = value >= 75 ? theme.travel : value >= 55 ? '#FFC547' : theme.sos;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLG id="g1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={scoreColor} />
            <Stop offset="1" stopColor={value >= 75 ? theme.travelDeep : value >= 55 ? '#CC9900' : theme.sosDeep} />
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
          <Text style={{ color: theme.textPrimary, fontSize: size > 60 ? 20 : 14, fontWeight: '800' }}>
            {value}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================
// ZONE PICKER MODAL
// ============================================================

function ZonePicker({
  visible,
  zones,
  selectedId,
  onSelect,
  onClose,
  title,
}: {
  visible: boolean;
  zones: Zone[];
  selectedId: string;
  onSelect: (z: Zone) => void;
  onClose: () => void;
  title: string;
}) {
  const grouped = useMemo(() => {
    const map: Record<string, Zone[]> = {};
    zones.forEach(z => {
      if (!map[z.city]) map[z.city] = [];
      map[z.city].push(z);
    });
    return map;
  }, [zones]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={picker.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={picker.sheet}>
          {Platform.OS !== 'web' ? (
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null}
          <View style={picker.handle} />
          <Text style={picker.title}>{title}</Text>
          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
            {Object.entries(grouped).map(([city, cityZones]) => (
              <View key={city}>
                <Text style={picker.cityLabel}>{city}</Text>
                {cityZones.map(z => {
                  const selected = z.id === selectedId;
                  const { period } = getTimeOfDay();
                  const timeMods = getTimeModifiers(period);
                  const quickScore = Math.max(15, Math.min(98, Math.round(z.baseSafety + timeMods.safety - z.crimeIndex * 1.5)));
                  const scoreColor = quickScore >= 75 ? theme.travel : quickScore >= 55 ? '#FFC547' : theme.sos;
                  return (
                    <TouchableOpacity
                      key={z.id}
                      style={[picker.row, selected && picker.rowSelected]}
                      onPress={() => { onSelect(z); onClose(); }}
                      testID={`zone-${z.id}`}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[picker.rowText, selected && { color: theme.travel, fontWeight: '700' }]}>
                          {z.name}
                        </Text>
                        <Text style={picker.rowMeta}>
                          Safety {quickScore} · {z.meshNodes} mesh nodes
                        </Text>
                      </View>
                      <View style={[picker.scorePill, { borderColor: scoreColor }]}>
                        <Text style={[picker.scoreText, { color: scoreColor }]}>{quickScore}</Text>
                      </View>
                      {selected ? <Feather name="check" size={16} color={theme.travel} style={{ marginLeft: 8 }} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================
// ANIMATED PULSE DOT
// ============================================================

function PulseDot({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, { toValue: 2.5, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 1400, easing: Easing.linear, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: color,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

// ============================================================
// MAIN TRAVEL SCREEN
// ============================================================

export default function TravelScreen() {
  const insets = useSafeAreaInsets();
  const [origin, setOrigin] = useState<Zone>(ZONES[0]); // Bandra
  const [dest, setDest] = useState<Zone>(ZONES[1]); // Powai
  const [originPickerOpen, setOriginPickerOpen] = useState(false);
  const [destPickerOpen, setDestPickerOpen] = useState(false);

  // Update every minute for time-of-day changes
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(iv);
  }, []);

  const safety = useMemo(() => computeSafetyScore(origin, dest), [origin, dest, tick]);
  const { period } = getTimeOfDay();

  const scoreColor = safety.score >= 75 ? theme.travel : safety.score >= 55 ? '#FFC547' : theme.sos;
  const riskBadge = {
    low: { label: 'LOW RISK', color: theme.travel, bg: 'rgba(0,255,156,0.1)' },
    moderate: { label: 'MODERATE', color: '#FFC547', bg: 'rgba(255,197,71,0.1)' },
    high: { label: 'HIGH RISK', color: theme.sos, bg: 'rgba(255,59,48,0.1)' },
    critical: { label: 'CRITICAL', color: '#FF1A1A', bg: 'rgba(255,26,26,0.15)' },
  }[safety.riskLevel] || { label: 'UNKNOWN', color: theme.textMuted, bg: 'rgba(255,255,255,0.05)' };

  // Animated score
  const animScore = useRef(new Animated.Value(safety.score)).current;
  useEffect(() => {
    Animated.timing(animScore, {
      toValue: safety.score,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [safety.score]);

  return (
    <View style={styles.root} testID="travel-screen">
      {/* Background gradient simulating dark map */}
      <LinearGradient
        colors={['#0A1520', '#0D1218', '#0D0B14']}
        style={StyleSheet.absoluteFill}
      />

      {/* Map glow effects */}
      <View pointerEvents="none" style={styles.mapGlowA}>
        <LinearGradient
          colors={[`${scoreColor}18`, 'rgba(13,11,20,0)']}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View pointerEvents="none" style={styles.mapGlowB}>
        <LinearGradient
          colors={['rgba(0,229,255,0.08)', 'rgba(13,11,20,0)']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Neon route line */}
      <View pointerEvents="none" style={styles.routeGlow}>
        <LinearGradient
          colors={[`${scoreColor}00`, `${scoreColor}55`, `${scoreColor}00`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={{ paddingTop: insets.top }}>
        <FakeStatusBar />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
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
              <Text style={styles.pillText}>Mesh Network Active</Text>
              <View style={styles.meshDots}>
                <View style={[styles.meshDot, { backgroundColor: theme.cyber }]} />
                <View style={[styles.meshDot, { backgroundColor: theme.cyber, opacity: 0.6 }]} />
                <View style={[styles.meshDot, { backgroundColor: theme.cyber, opacity: 0.3 }]} />
              </View>
            </View>
          </View>

          <View style={[styles.riskBadgePill, { backgroundColor: riskBadge.bg, borderColor: `${riskBadge.color}40` }]}>
            <View style={[styles.riskDot, { backgroundColor: riskBadge.color }]} />
            <Text style={[styles.riskText, { color: riskBadge.color }]}>{riskBadge.label}</Text>
          </View>
        </View>

        {/* Route Selector */}
        <View style={styles.routeSelector}>
          <PressableScale
            onPress={() => setOriginPickerOpen(true)}
            style={styles.routeInputWrap}
            testID="origin-picker"
          >
            <View style={styles.routeInput}>
              <View style={[styles.routeDotIcon, { backgroundColor: theme.travel }]}>
                <View style={styles.routeDotInner} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>FROM</Text>
                <Text style={styles.routeValue} numberOfLines={1}>{origin.name}</Text>
              </View>
              <Feather name="chevron-down" size={14} color={theme.textSecondary} />
            </View>
          </PressableScale>

          <View style={styles.routeDivider}>
            <View style={styles.routeLine} />
            <View style={styles.swapBtn}>
              <Feather name="repeat" size={12} color={theme.textSecondary} />
            </View>
            <View style={styles.routeLine} />
          </View>

          <PressableScale
            onPress={() => setDestPickerOpen(true)}
            style={styles.routeInputWrap}
            testID="dest-picker"
          >
            <View style={styles.routeInput}>
              <View style={[styles.routeDotIcon, { backgroundColor: scoreColor }]}>
                <Feather name="map-pin" size={10} color="#0D0B14" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>TO</Text>
                <Text style={styles.routeValue} numberOfLines={1}>{dest.name}</Text>
              </View>
              <Feather name="chevron-down" size={14} color={theme.textSecondary} />
            </View>
          </PressableScale>
        </View>

        {/* Floating map pins */}
        <View style={styles.mapArea}>
          <View style={[styles.pin, { top: '20%', left: '18%' }]} pointerEvents="none">
            <View style={[styles.pinDot, { backgroundColor: theme.travel }]} />
            <PulseDot color={theme.travel} />
          </View>
          <View style={[styles.pin, { top: '55%', left: '68%' }]} pointerEvents="none">
            <View style={[styles.pinDot, { backgroundColor: scoreColor }]} />
            <View style={[styles.pinRing, { borderColor: scoreColor }]} />
          </View>
          <View style={[styles.pin, { top: '38%', left: '42%' }]} pointerEvents="none">
            <View style={styles.pinUser}>
              <Feather name="navigation" size={14} color="#0D0B14" />
            </View>
          </View>
          {/* Route dots */}
          {[25, 30, 35, 42, 48].map((pct, i) => (
            <View
              key={i}
              pointerEvents="none"
              style={[styles.routeDot, { top: `${20 + i * 7}%`, left: `${20 + i * 10}%` }]}
            >
              <View style={[styles.routeDotSmall, { backgroundColor: `${scoreColor}88` }]} />
            </View>
          ))}
        </View>

        {/* Safety Score Card */}
        <View style={styles.sheetWrap}>
          <GlassCard intensity={80} style={styles.sheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>LIVE ROUTE ANALYSIS</Text>
                <Text style={styles.sheetTitle}>{origin.name} → {dest.name}</Text>
                <Text style={styles.sheetSub}>Arrives {safety.eta} • {safety.safeStops} safe stops</Text>
              </View>
              <ScoreGauge value={safety.score} />
            </View>

            <View style={styles.divider} />

            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Safety Score</Text>
              <Text style={styles.scoreValue}>
                <Text style={{ color: scoreColor }}>{safety.score}</Text>
                <Text style={{ color: theme.textMuted }}>/100</Text>
              </Text>
            </View>

            <View style={styles.factorList}>
              {[
                {
                  icon: 'users' as const,
                  label: 'Crowd density',
                  val: safety.crowd,
                  color: safety.crowd === 'Very High' || safety.crowd === 'High' ? theme.travel : safety.crowd === 'Moderate' ? '#FFC547' : theme.sos,
                },
                {
                  icon: 'sun' as const,
                  label: 'Lighting',
                  val: safety.lighting,
                  color: safety.lighting.includes('Excellent') || safety.lighting.includes('Well-lit') ? theme.travel : safety.lighting.includes('Good') ? '#FFC547' : theme.sos,
                },
                {
                  icon: 'activity' as const,
                  label: 'Recent incidents',
                  val: safety.incidents,
                  color: safety.incidents.startsWith('0') ? theme.travel : safety.incidents.startsWith('1') ? '#FFC547' : theme.sos,
                },
                { icon: 'wifi' as const, label: 'Mesh coverage', val: safety.meshCoverage, color: theme.cyber },
              ].map((f) => (
                <View key={f.label} style={styles.factorItem}>
                  <View style={styles.factorIconWrap}>
                    <Feather name={f.icon} size={13} color={f.color} />
                  </View>
                  <Text style={styles.factorLabel}>{f.label}</Text>
                  <Text style={[styles.factorVal, { color: f.color }]}>{f.val}</Text>
                </View>
              ))}
            </View>

            {/* Time badge */}
            <View style={styles.timeBadge}>
              <Feather name="clock" size={11} color={theme.textSecondary} />
              <Text style={styles.timeBadgeText}>
                Analysis based on current time ({period}) • Updates live
              </Text>
            </View>

            {/* Safety Tips */}
            {safety.tips.length > 0 && (
              <View style={styles.tipsSection}>
                {safety.tips.map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <Feather
                      name={safety.riskLevel === 'low' ? 'check-circle' : 'alert-circle'}
                      size={12}
                      color={safety.riskLevel === 'low' ? theme.travel : scoreColor}
                    />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity activeOpacity={0.85} style={styles.ctaBtn} testID="start-trip">
              <LinearGradient
                colors={safety.score >= 55 ? theme.gradients.travel : ['#FFC547', '#CC9900']}
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
      </ScrollView>

      {/* Zone Pickers */}
      <ZonePicker
        visible={originPickerOpen}
        zones={ZONES}
        selectedId={origin.id}
        onSelect={setOrigin}
        onClose={() => setOriginPickerOpen(false)}
        title="Select Origin"
      />
      <ZonePicker
        visible={destPickerOpen}
        zones={ZONES}
        selectedId={dest.id}
        onSelect={setDest}
        onClose={() => setDestPickerOpen(false)}
        title="Select Destination"
      />
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },

  mapGlowA: {
    position: 'absolute',
    top: -200,
    left: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
  },
  mapGlowB: {
    position: 'absolute',
    bottom: -100,
    right: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
  },
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
    gap: 8,
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  meshDots: { flexDirection: 'row', gap: 3 },
  meshDot: { width: 5, height: 5, borderRadius: 2.5 },

  riskBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  riskDot: { width: 6, height: 6, borderRadius: 3 },
  riskText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },

  // Route selector
  routeSelector: {
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 4,
  },
  routeInputWrap: {},
  routeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  routeLabel: {
    color: theme.textMuted,
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  routeValue: {
    color: theme.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 1,
  },
  routeDotIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0D0B14',
  },
  routeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 30,
    height: 24,
  },
  routeLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  swapBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },

  // Map area
  mapArea: {
    height: 180,
    position: 'relative',
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
  routeDot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeDotSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // Sheet
  sheetWrap: {
    paddingHorizontal: 16,
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
    fontSize: 20,
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
  factorList: { gap: 10, marginBottom: 12 },
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

  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
  },
  timeBadgeText: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },

  tipsSection: {
    gap: 6,
    marginBottom: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    color: theme.textSecondary,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
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

const picker = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'rgba(20,18,28,0.96)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  cityLabel: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  rowSelected: {
    backgroundColor: 'rgba(0,255,156,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(0,255,156,0.3)',
  },
  rowText: { color: theme.textPrimary, fontSize: 15, fontWeight: '500' },
  rowMeta: { color: theme.textMuted, fontSize: 11, marginTop: 2 },
  scorePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
