import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Defs, LinearGradient as SvgLG, Stop } from 'react-native-svg';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import GlassCard from '../src/GlassCard';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL as string;
const BG_IMG =
  'https://static.prod-images.emergentagent.com/jobs/f23f9469-da8c-4d1c-b0af-6de7b8eadfc2/images/5893988904a347a3f78121be0578896251be65632530b4a5e2fc2a7923e170de.png';

type Insight = {
  title: string;
  body: string;
  action: string;
  accent: 'wellness' | 'travel' | 'cyber' | string;
};

function ProgressRing({ value }: { value: number }) {
  const size = 220;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLG id="wellGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FF9EB1" />
            <Stop offset="1" stopColor="#FF4D6D" />
          </SvgLG>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#wellGrad)"
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
          <Text style={styles.ringLabel}>WELLNESS SCORE</Text>
          <Text style={styles.ringScore}>{value}</Text>
          <Text style={styles.ringOutOf}>of 100</Text>
        </View>
      </View>
    </View>
  );
}

const ACCENT_MAP: Record<string, { grad: readonly [string, string]; color: string; icon: any }> = {
  wellness: { grad: theme.gradients.wellness, color: theme.wellness, icon: 'heart' },
  travel: { grad: theme.gradients.travel, color: theme.travel, icon: 'map-pin' },
  cyber: { grad: theme.gradients.cyber, color: theme.cyber, icon: 'shield' },
};

export default function WellnessHub() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const score = 72;
  const phase = 'Ovulation';

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`${BACKEND_URL}/api/ai/wellness-insights`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score, phase, mood: 'energetic' }),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        setInsights(data.insights || []);
      } catch (e: any) {
        setError('Showing default insights — AI temporarily unavailable.');
        setInsights([
          {
            title: 'Pitch your Google application',
            body: 'Your Ovulation energy + 94% job match = ideal window. Submit before Thursday.',
            action: 'Open application',
            accent: 'wellness',
          },
          {
            title: 'Skip the late-night walk',
            body: 'Sleep debt is dragging your score. Opt for a 7am Bandra walk instead — mesh-covered.',
            action: 'Reroute morning',
            accent: 'travel',
          },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.root} testID="wellness-hub">
      <ImageBackground source={{ uri: BG_IMG }} style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['rgba(13,11,20,0.7)', 'rgba(13,11,20,0.95)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <View style={styles.glowOrb}>
        <LinearGradient
          colors={['rgba(255,117,143,0.45)', 'rgba(13,11,20,0)']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 60,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Handle + close */}
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>

        <View style={styles.topRow}>
          <View>
            <Text style={styles.eyebrow}>WELLNESS HUB</Text>
            <Text style={styles.title}>Today is a{'\n'}power day.</Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
            testID="wellness-close"
          >
            <Feather name="x" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Ring */}
        <View style={styles.ringWrap}>
          <View style={styles.ringShadow}>
            <ProgressRing value={score} />
          </View>

          {/* Sub-metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <MaterialCommunityIcons name="moon-waxing-crescent" size={14} color={theme.wellness} />
              <Text style={styles.metricLabel}>Phase</Text>
              <Text style={styles.metricVal}>{phase}</Text>
            </View>
            <View style={styles.metric}>
              <Feather name="activity" size={14} color={theme.travel} />
              <Text style={styles.metricLabel}>Energy</Text>
              <Text style={styles.metricVal}>High</Text>
            </View>
            <View style={styles.metric}>
              <Feather name="moon" size={14} color={theme.cyber} />
              <Text style={styles.metricLabel}>Sleep</Text>
              <Text style={styles.metricVal}>6h 12m</Text>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightsHeader}>
          <Text style={styles.insightsTitle}>Today's AI intelligence</Text>
          <View style={styles.aiBadge}>
            <View style={[styles.aiDot, { backgroundColor: theme.wellness }]} />
            <Text style={styles.aiText}>Claude · Live</Text>
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={theme.wellness} />
            <Text style={styles.loadingText}>Analyzing your 3 shields...</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {insights.map((ins, idx) => {
              const accent = ACCENT_MAP[ins.accent] || ACCENT_MAP.wellness;
              return (
                <GlassCard key={idx} style={styles.insightCard} testID={`insight-${idx}`}>
                  <View style={styles.insightTop}>
                    <LinearGradient
                      colors={accent.grad}
                      style={styles.insightIcon}
                    >
                      <Feather name={accent.icon} size={18} color="#0D0B14" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.insightCategory, { color: accent.color }]}>
                        {String(ins.accent).toUpperCase()} INSIGHT
                      </Text>
                      <Text style={styles.insightTitle}>{ins.title}</Text>
                    </View>
                  </View>
                  <Text style={styles.insightBody}>{ins.body}</Text>
                  <TouchableOpacity activeOpacity={0.85} style={styles.insightBtn}>
                    <Text style={[styles.insightBtnText, { color: accent.color }]}>
                      {ins.action}
                    </Text>
                    <Feather name="arrow-right" size={14} color={accent.color} />
                  </TouchableOpacity>
                </GlassCard>
              );
            })}
          </View>
        )}

        {/* Cycle ribbon */}
        <GlassCard style={styles.ribbon}>
          <Text style={styles.ribbonTitle}>Cycle intelligence</Text>
          <View style={styles.cycleRow}>
            {[
              { p: 'Menst', active: false, color: '#FF4D6D' },
              { p: 'Foll', active: false, color: '#FF9EB1' },
              { p: 'Ovul', active: true, color: theme.wellness },
              { p: 'Lut', active: false, color: '#A378FF' },
            ].map((p, i) => (
              <View key={p.p} style={styles.cycleCol}>
                <View
                  style={[
                    styles.cycleBar,
                    {
                      backgroundColor: p.active ? p.color : 'rgba(255,255,255,0.08)',
                      height: p.active ? 32 : 14 + i * 3,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.cyclePhase,
                    p.active && { color: theme.textPrimary, fontWeight: '700' },
                  ]}
                >
                  {p.p}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.ribbonSub}>
            Day 13 of 28 · Predicted by ShieldHer's on-device model.
          </Text>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  glowOrb: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  handleRow: { alignItems: 'center', marginBottom: 4 },
  handle: {
    width: 44,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
    marginBottom: 16,
  },
  eyebrow: {
    color: theme.wellness,
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '800',
  },
  title: {
    color: theme.textPrimary,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 6,
    lineHeight: 38,
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  ringWrap: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  ringShadow: {
    shadowColor: theme.wellness,
    shadowOpacity: 0.4,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  ringLabel: {
    color: theme.wellness,
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '800',
  },
  ringScore: {
    color: theme.textPrimary,
    fontSize: 84,
    fontWeight: '900',
    letterSpacing: -4,
    marginVertical: -8,
  },
  ringOutOf: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metricLabel: {
    color: theme.textSecondary,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  metricVal: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },

  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,117,143,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,117,143,0.3)',
  },
  aiDot: { width: 6, height: 6, borderRadius: 3 },
  aiText: {
    color: theme.wellness,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  errorText: {
    color: theme.wellness,
    fontSize: 11,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  loadingWrap: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
  },
  loadingText: {
    color: theme.textSecondary,
    fontSize: 13,
  },

  insightCard: { padding: 18 },
  insightTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightCategory: {
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '800',
  },
  insightTitle: {
    color: theme.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  insightBody: {
    color: theme.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  insightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  insightBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },

  ribbon: {
    padding: 18,
    marginTop: 16,
  },
  ribbonTitle: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 14,
  },
  cycleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 50,
    marginBottom: 10,
  },
  cycleCol: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  cycleBar: {
    width: 28,
    borderRadius: 4,
  },
  cyclePhase: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  ribbonSub: {
    color: theme.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
});
