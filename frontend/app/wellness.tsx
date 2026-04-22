import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Modal,
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
import PressableScale from '../src/PressableScale';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL as string;
const BG_IMG =
  'https://static.prod-images.emergentagent.com/jobs/f23f9469-da8c-4d1c-b0af-6de7b8eadfc2/images/5893988904a347a3f78121be0578896251be65632530b4a5e2fc2a7923e170de.png';

type Insight = {
  title: string;
  body: string;
  action: string;
  accent: 'wellness' | 'travel' | 'cyber' | string;
};

const ACCENT_MAP: Record<string, { grad: readonly [string, string]; color: string; icon: any }> = {
  wellness: { grad: theme.gradients.wellness, color: theme.wellness, icon: 'heart' },
  travel: { grad: theme.gradients.travel, color: theme.travel, icon: 'map-pin' },
  cyber: { grad: theme.gradients.cyber, color: theme.cyber, icon: 'shield' },
};

// --- helpers ---
const MONTHS = [
  'January','February','March','April','May','June','July','August','September','October','November','December',
];
const WEEKDAYS = ['S','M','T','W','T','F','S'];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstWeekdayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function cyclePhase(cycleStart: Date, today: Date) {
  const diffMs = today.getTime() - cycleStart.getTime();
  const dayOfCycle = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // 1-based
  const day = ((dayOfCycle - 1) % 28 + 28) % 28 + 1;
  let phase: 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal';
  if (day <= 5) phase = 'Menstrual';
  else if (day <= 11) phase = 'Follicular';
  else if (day <= 16) phase = 'Ovulation';
  else phase = 'Luteal';
  return { day, phase };
}

function scoreForPhase(day: number, phase: string) {
  // Deterministic but realistic mapping
  if (phase === 'Menstrual') return 58 + (day - 1) * 2; // 58..66
  if (phase === 'Follicular') return 70 + (day - 6) * 2; // 70..80
  if (phase === 'Ovulation') return 82 + (day - 12); // 82..86
  return 78 - (day - 17); // Luteal: 78..67
}

// --- SVG ring ---
function ProgressRing({ value }: { value: number }) {
  const size = 220;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circ - (clamped / 100) * circ;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLG id="wellGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FF9EB1" />
            <Stop offset="1" stopColor="#FF4D6D" />
          </SvgLG>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
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
          <Text style={styles.ringScore}>{clamped}</Text>
          <Text style={styles.ringOutOf}>of 100</Text>
        </View>
      </View>
    </View>
  );
}

// --- Calendar (inline month view) ---
function Calendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date;
  onSelect: (d: Date) => void;
}) {
  const today = new Date();
  const [month, setMonth] = useState(selectedDate.getMonth());
  const [year, setYear] = useState(selectedDate.getFullYear());

  const dim = daysInMonth(year, month);
  const startWd = firstWeekdayOfMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(startWd).fill(null),
    ...Array.from({ length: dim }, (_, i) => i + 1),
  ];
  // pad to multiple of 7
  while (cells.length % 7 !== 0) cells.push(null);

  const go = (delta: number) => {
    const m = month + delta;
    if (m < 0) {
      setMonth(11);
      setYear(year - 1);
    } else if (m > 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(m);
  };

  return (
    <View style={cal.wrap}>
      <View style={cal.header}>
        <PressableScale onPress={() => go(-1)} testID="cal-prev">
          <View style={cal.navBtn}>
            <Feather name="chevron-left" size={18} color={theme.textPrimary} />
          </View>
        </PressableScale>
        <Text style={cal.monthText}>
          {MONTHS[month]} {year}
        </Text>
        <PressableScale onPress={() => go(1)} testID="cal-next">
          <View style={cal.navBtn}>
            <Feather name="chevron-right" size={18} color={theme.textPrimary} />
          </View>
        </PressableScale>
      </View>

      <View style={cal.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={cal.weekText}>
            {w}
          </Text>
        ))}
      </View>

      <View style={cal.grid}>
        {cells.map((d, idx) => {
          if (d === null) return <View key={idx} style={cal.cell} />;
          const date = new Date(year, month, d);
          const isSelected = iso(date) === iso(selectedDate);
          const isToday = iso(date) === iso(today);
          const isFuture = date > today;
          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => !isFuture && onSelect(date)}
              disabled={isFuture}
              style={cal.cell}
              testID={`cal-day-${year}-${month + 1}-${d}`}
            >
              <View
                style={[
                  cal.cellInner,
                  isSelected && cal.cellSelected,
                  !isSelected && isToday && cal.cellToday,
                ]}
              >
                <Text
                  style={[
                    cal.cellText,
                    isSelected && { color: '#0D0B14', fontWeight: '800' },
                    isFuture && { color: theme.textMuted },
                  ]}
                >
                  {d}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function WellnessHub() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  // default: 13 days ago → day 14 (Ovulation)
  const [cycleStart, setCycleStart] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 13);
    return d;
  });

  const [logOpen, setLogOpen] = useState(false);
  const [pending, setPending] = useState<Date>(cycleStart);

  const { day, phase } = cyclePhase(cycleStart, today);
  const score = scoreForPhase(day, phase);

  // Fetch insights whenever phase changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const resp = await fetch(`${BACKEND_URL}/api/ai/wellness-insights`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score, phase, mood: 'energetic' }),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (!cancelled) {
          setInsights(data.insights || []);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('Showing default insights — AI temporarily unavailable.');
          setInsights([
            {
              title: 'Channel your peak energy',
              body: 'Ovulation brings confidence & clarity — perfect for that tough conversation.',
              action: 'Schedule one bold move',
              accent: 'wellness',
            },
            {
              title: 'Heightened awareness',
              body: 'High-social days can expose privacy leaks. Review app permissions today.',
              action: 'Audit permissions',
              accent: 'cyber',
            },
          ]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase]);

  const saveLog = () => {
    setCycleStart(pending);
    setLogOpen(false);
  };

  return (
    <View style={styles.root} testID="wellness-hub">
      <ImageBackground source={{ uri: BG_IMG }} style={StyleSheet.absoluteFill}>
        <LinearGradient colors={['rgba(13,11,20,0.7)', 'rgba(13,11,20,0.95)']} style={StyleSheet.absoluteFill} />
      </ImageBackground>

      <View style={styles.glowOrb}>
        <LinearGradient colors={['rgba(255,117,143,0.45)', 'rgba(13,11,20,0)']} style={StyleSheet.absoluteFill} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>

        <View style={styles.topRow}>
          <View>
            <Text style={styles.eyebrow}>WELLNESS HUB</Text>
            <Text style={styles.title}>
              {phase === 'Ovulation' ? "Today is a\npower day." : `You're in\n${phase}.`}
            </Text>
          </View>
          <PressableScale onPress={() => router.back()} testID="wellness-close">
            <View style={styles.closeBtn}>
              <Feather name="x" size={20} color={theme.textPrimary} />
            </View>
          </PressableScale>
        </View>

        {/* Ring */}
        <View style={styles.ringWrap}>
          <View style={styles.ringShadow}>
            <ProgressRing value={score} />
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <MaterialCommunityIcons name="moon-waxing-crescent" size={14} color={theme.wellness} />
              <Text style={styles.metricLabel}>Phase</Text>
              <Text style={styles.metricVal}>{phase}</Text>
            </View>
            <View style={styles.metric}>
              <Feather name="activity" size={14} color={theme.travel} />
              <Text style={styles.metricLabel}>Day</Text>
              <Text style={styles.metricVal}>{day} / 28</Text>
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
            <Text style={styles.loadingText}>Re-analyzing your 3 shields…</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {insights.map((ins, idx) => {
              const accent = ACCENT_MAP[ins.accent] || ACCENT_MAP.wellness;
              return (
                <GlassCard key={idx} style={styles.insightCard} testID={`insight-${idx}`}>
                  <View style={styles.insightTop}>
                    <LinearGradient colors={accent.grad} style={styles.insightIcon}>
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
                  <PressableScale>
                    <View style={styles.insightBtn}>
                      <Text style={[styles.insightBtnText, { color: accent.color }]}>{ins.action}</Text>
                      <Feather name="arrow-right" size={14} color={accent.color} />
                    </View>
                  </PressableScale>
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
              { p: 'Menst', key: 'Menstrual', color: '#FF4D6D' },
              { p: 'Foll', key: 'Follicular', color: '#FF9EB1' },
              { p: 'Ovul', key: 'Ovulation', color: theme.wellness },
              { p: 'Lut', key: 'Luteal', color: '#A378FF' },
            ].map((p, i) => {
              const active = p.key === phase;
              return (
                <View key={p.p} style={styles.cycleCol}>
                  <View
                    style={[
                      styles.cycleBar,
                      {
                        backgroundColor: active ? p.color : 'rgba(255,255,255,0.08)',
                        height: active ? 36 : 14 + i * 3,
                      },
                    ]}
                  />
                  <Text style={[styles.cyclePhase, active && { color: theme.textPrimary, fontWeight: '700' }]}>
                    {p.p}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.ribbonSub}>
            Cycle started {cycleStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · Day {day} of 28
          </Text>
        </GlassCard>
      </ScrollView>

      {/* Floating Action Button */}
      <PressableScale
        onPress={() => {
          setPending(cycleStart);
          setLogOpen(true);
        }}
        testID="log-cycle-fab"
      >
        <LinearGradient
          colors={theme.gradients.wellness}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fab, { bottom: 32 + insets.bottom }]}
        >
          <MaterialCommunityIcons name="calendar-heart" size={20} color="#0D0B14" />
          <Text style={styles.fabText}>Log Cycle Data</Text>
        </LinearGradient>
      </PressableScale>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={logOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLogOpen(false)}
      >
        <View style={sheet.backdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setLogOpen(false)} />
          <View style={sheet.wrap}>
            {Platform.OS !== 'web' ? (
              <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
            ) : null}
            <View style={sheet.handle} />
            <View style={sheet.header}>
              <View style={{ flex: 1 }}>
                <Text style={sheet.eyebrow}>LOG CYCLE DATA</Text>
                <Text style={sheet.title}>Start Date</Text>
                <Text style={sheet.sub}>
                  Pick the first day of your last period to recalibrate your Wellness Score.
                </Text>
              </View>
              <PressableScale onPress={() => setLogOpen(false)} testID="log-close">
                <View style={sheet.closeBtn}>
                  <Feather name="x" size={18} color={theme.textPrimary} />
                </View>
              </PressableScale>
            </View>

            <Calendar selectedDate={pending} onSelect={setPending} />

            {/* Preview new score */}
            <View style={sheet.previewRow}>
              <View style={sheet.previewCol}>
                <Text style={sheet.previewLabel}>NEW PHASE</Text>
                <Text style={sheet.previewValue}>
                  {cyclePhase(pending, today).phase}
                </Text>
              </View>
              <View style={sheet.previewDivider} />
              <View style={sheet.previewCol}>
                <Text style={sheet.previewLabel}>PREDICTED SCORE</Text>
                <Text style={[sheet.previewValue, { color: theme.wellness }]}>
                  {scoreForPhase(cyclePhase(pending, today).day, cyclePhase(pending, today).phase)}
                  <Text style={{ color: theme.textMuted, fontSize: 16 }}>/100</Text>
                </Text>
              </View>
            </View>

            <PressableScale onPress={saveLog} testID="log-save">
              <LinearGradient
                colors={theme.gradients.wellness}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={sheet.saveBtn}
              >
                <Feather name="check" size={16} color="#0D0B14" />
                <Text style={sheet.saveText}>Save & Recalibrate</Text>
              </LinearGradient>
            </PressableScale>
          </View>
        </View>
      </Modal>
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
  handle: { width: 44, height: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
    marginBottom: 16,
  },
  eyebrow: { color: theme.wellness, fontSize: 10, letterSpacing: 2.5, fontWeight: '800' },
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
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  ringWrap: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  ringShadow: {
    shadowColor: theme.wellness,
    shadowOpacity: 0.4,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  ringLabel: { color: theme.wellness, fontSize: 9, letterSpacing: 2, fontWeight: '800' },
  ringScore: {
    color: theme.textPrimary,
    fontSize: 84,
    fontWeight: '900',
    letterSpacing: -4,
    marginVertical: -8,
  },
  ringOutOf: { color: theme.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  metricsRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  metricLabel: {
    color: theme.textSecondary,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  metricVal: { color: theme.textPrimary, fontSize: 14, fontWeight: '800' },

  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsTitle: { color: theme.textPrimary, fontSize: 16, fontWeight: '700' },
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
  aiText: { color: theme.wellness, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  errorText: { color: theme.wellness, fontSize: 11, marginBottom: 8, fontStyle: 'italic' },
  loadingWrap: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
  },
  loadingText: { color: theme.textSecondary, fontSize: 13 },

  insightCard: { padding: 18 },
  insightTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  insightIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  insightCategory: { fontSize: 9, letterSpacing: 1.5, fontWeight: '800' },
  insightTitle: {
    color: theme.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  insightBody: { color: theme.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  insightBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  insightBtnText: { fontSize: 13, fontWeight: '700' },

  ribbon: { padding: 18, marginTop: 16 },
  ribbonTitle: { color: theme.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 14 },
  cycleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 50,
    marginBottom: 10,
  },
  cycleCol: { alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  cycleBar: { width: 28, borderRadius: 4 },
  cyclePhase: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  ribbonSub: { color: theme.textMuted, fontSize: 11, textAlign: 'center', marginTop: 4 },

  fab: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: theme.wellness,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  fabText: { color: '#0D0B14', fontSize: 13, fontWeight: '800', letterSpacing: 0.2 },
});

const cal = StyleSheet.create({
  wrap: { marginVertical: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  monthText: { color: theme.textPrimary, fontSize: 16, fontWeight: '800' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  weekText: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  cellInner: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  cellSelected: {
    backgroundColor: theme.wellness,
  },
  cellToday: {
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  cellText: { color: theme.textPrimary, fontSize: 14, fontWeight: '500' },
});

const sheet = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  wrap: {
    backgroundColor: 'rgba(20,18,28,0.96)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
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
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  eyebrow: { color: theme.wellness, fontSize: 10, letterSpacing: 2, fontWeight: '800' },
  title: { color: theme.textPrimary, fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },
  sub: { color: theme.textSecondary, fontSize: 12, marginTop: 6, lineHeight: 18 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 18,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,117,143,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,117,143,0.35)',
  },
  previewCol: { flex: 1, alignItems: 'center' },
  previewLabel: {
    color: theme.textMuted,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  previewValue: {
    color: theme.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: -0.3,
  },
  previewDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 999,
  },
  saveText: { color: '#0D0B14', fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },
});
