import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  Modal,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather, Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import GlassCard from '../../src/GlassCard';
import FakeStatusBar from '../../src/StatusBarFake';
import PressableScale from '../../src/PressableScale';

const { width } = Dimensions.get('window');

function PulseRing({ delay = 0, color = theme.sos }: { delay?: number; color?: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.8,
          duration: 2200,
          delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 2200,
          delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pulseRing,
        { borderColor: color, transform: [{ scale }], opacity },
      ]}
    />
  );
}

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sosOpen, setSosOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [alerted, setAlerted] = useState(false);
  const [userName, setUserName] = useState('Priya');
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    if (!sosOpen) return;
    setCountdown(5);
    setAlerted(false);
    const iv = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(iv);
          setAlerted(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [sosOpen]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#14101F', '#0D0B14', '#070510']}
        style={StyleSheet.absoluteFill}
      />
      {/* Ambient radial glows */}
      <View style={styles.ambientPink} pointerEvents="none">
        <LinearGradient
          colors={['rgba(255,117,143,0.22)', 'rgba(13,11,20,0)']}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.ambientRed} pointerEvents="none">
        <LinearGradient
          colors={['rgba(255,59,48,0.18)', 'rgba(13,11,20,0)']}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.ambientCyan} pointerEvents="none">
        <LinearGradient
          colors={['rgba(0,229,255,0.12)', 'rgba(13,11,20,0)']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={{ paddingTop: insets.top }}>
        <FakeStatusBar />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.hello}>Good morning</Text>
            <View style={styles.nameRow}>
              {editingName ? (
                <TextInput
                  style={styles.nameInput}
                  value={userName}
                  onChangeText={setUserName}
                  autoFocus
                  selectTextOnFocus
                  maxLength={18}
                  placeholder="Your name"
                  placeholderTextColor={theme.textMuted}
                  onBlur={() => setEditingName(false)}
                  onSubmitEditing={() => setEditingName(false)}
                  returnKeyType="done"
                  testID="name-input"
                />
              ) : (
                <Text style={styles.name} testID="dashboard-name">
                  {userName || 'You'}{' '}
                  <Text style={{ color: theme.wellness }}>✦</Text>
                </Text>
              )}
              <PressableScale
                onPress={() => setEditingName((v) => !v)}
                style={styles.editBtn}
                testID="name-edit-btn"
              >
                <View style={styles.editBtnInner}>
                  <Feather
                    name={editingName ? 'check' : 'edit-2'}
                    size={12}
                    color={editingName ? theme.travel : theme.textSecondary}
                  />
                </View>
              </PressableScale>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/wellness')}
            activeOpacity={0.85}
            testID="wellness-badge"
          >
            <View style={styles.wellnessBadge}>
              <LinearGradient
                colors={theme.gradients.wellness}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.wellnessRing}
              >
                <View style={styles.wellnessInner}>
                  <Text style={styles.wellnessScore}>72</Text>
                  <Text style={styles.wellnessLabel}>WELL</Text>
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          All three shields are active. You're protected.
        </Text>

        {/* SOS section */}
        <View style={styles.sosWrap}>
          <View style={styles.sosCenter}>
            <PulseRing delay={0} />
            <PulseRing delay={700} />
            <PulseRing delay={1400} />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSosOpen(true)}
              testID="sos-button"
            >
              <LinearGradient
                colors={theme.gradients.sos}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sosBtn}
              >
                <View style={styles.sosInner}>
                  <Text style={styles.sosLabel}>Smart</Text>
                  <Text style={styles.sosText}>SOS</Text>
                  <View style={styles.sosPill}>
                    <View style={styles.sosDot} />
                    <Text style={styles.sosPillText}>Hold to activate</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.sosMetaRow}>
            <View style={styles.metaChip}>
              <Feather name="map-pin" size={12} color={theme.travel} />
              <Text style={styles.metaText}>Live location armed</Text>
            </View>
            <View style={styles.metaChip}>
              <Feather name="users" size={12} color={theme.cyber} />
              <Text style={styles.metaText}>4 trusted contacts</Text>
            </View>
          </View>
        </View>

        {/* Feature cards */}
        <Text style={styles.sectionTitle}>Your shields</Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/travel')}
          testID="card-travel"
        >
          <GlassCard style={styles.featureCard}>
            <View style={styles.featureRow}>
              <View
                style={[
                  styles.featureIcon,
                  { borderColor: theme.travel, shadowColor: theme.travel },
                ]}
              >
                <Feather name="map-pin" size={22} color={theme.travel} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureLabel}>TRAVEL SAFETY</Text>
                <Text style={styles.featureTitle}>Safe route to Bandra</Text>
                <Text style={styles.featureSub}>Score 87 • Mesh backup ready</Text>
              </View>
              <View>
                <Text style={[styles.statusScore, { color: theme.travel }]}>87</Text>
                <Text style={styles.statusScoreLabel}>/100</Text>
              </View>
            </View>
            <View style={styles.gaugeTrack}>
              <LinearGradient
                colors={theme.gradients.travel}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.gaugeFill, { width: '87%' }]}
              />
            </View>
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/cyber')}
          testID="card-cyber"
        >
          <GlassCard style={styles.featureCard}>
            <View style={styles.featureRow}>
              <View
                style={[
                  styles.featureIcon,
                  { borderColor: theme.cyber, shadowColor: theme.cyber },
                ]}
              >
                <Feather name="shield" size={22} color={theme.cyber} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureLabel}>CYBER SHIELD</Text>
                <Text style={styles.featureTitle}>3 toxic messages blocked</Text>
                <Text style={styles.featureSub}>Inbox filtered • AI 24/7</Text>
              </View>
              <View style={[styles.counterPill, { borderColor: theme.cyber }]}>
                <Text style={[styles.counterText, { color: theme.cyber }]}>AI</Text>
              </View>
            </View>
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/growth')}
          testID="card-growth"
        >
          <GlassCard style={styles.featureCard}>
            <View style={styles.featureRow}>
              <View
                style={[
                  styles.featureIcon,
                  { borderColor: theme.wellness, shadowColor: theme.wellness },
                ]}
              >
                <Feather name="briefcase" size={22} color={theme.wellness} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureLabel}>GROWTH</Text>
                <Text style={styles.featureTitle}>12 new opportunities</Text>
                <Text style={styles.featureSub}>2 Power Phase matches today</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={theme.textSecondary} />
            </View>
          </GlassCard>
        </TouchableOpacity>
      </ScrollView>

      {/* SOS MODAL */}
      <Modal
        visible={sosOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSosOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          {Platform.OS !== 'web' ? (
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)' }]} />
          )}
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrap}>
              <LinearGradient
                colors={theme.gradients.sos}
                style={styles.modalIcon}
              >
                <Feather
                  name={alerted ? 'check' : 'alert-triangle'}
                  size={44}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>
            {!alerted ? (
              <>
                <Text style={styles.modalTitle}>Alerting emergency contacts</Text>
                <Text style={styles.modalCountdown} testID="sos-countdown">
                  {countdown}
                </Text>
                <Text style={styles.modalSub}>
                  Live location, audio stream, and your trusted circle will be notified.
                </Text>
                <TouchableOpacity
                  onPress={() => setSosOpen(false)}
                  style={styles.modalCancel}
                  testID="sos-cancel"
                >
                  <Text style={styles.modalCancelText}>Cancel — I'm safe</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Help is on the way</Text>
                <Text style={styles.modalSub}>
                  4 trusted contacts alerted • Nearest responder: 0.8 km away.
                </Text>
                <View style={styles.contactsRow}>
                  {['Mom', 'Riya', 'Arjun', '112'].map((n) => (
                    <View key={n} style={styles.contactChip}>
                      <Feather name="check" size={12} color={theme.travel} />
                      <Text style={styles.contactText}>{n}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => setSosOpen(false)}
                  style={styles.modalPrimary}
                  testID="sos-close"
                >
                  <Text style={styles.modalPrimaryText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  scroll: { paddingHorizontal: 20 },

  ambientPink: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 360,
    height: 360,
    borderRadius: 180,
  },
  ambientRed: {
    position: 'absolute',
    top: 220,
    left: -80,
    width: 420,
    height: 420,
    borderRadius: 210,
  },
  ambientCyan: {
    position: 'absolute',
    bottom: 160,
    right: -140,
    width: 360,
    height: 360,
    borderRadius: 180,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  hello: {
    color: theme.textSecondary,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  name: {
    color: theme.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  nameInput: {
    color: theme.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    minWidth: 140,
    maxWidth: 200,
    paddingVertical: 0,
    paddingHorizontal: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  editBtn: {},
  editBtnInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  subtitle: {
    color: theme.textSecondary,
    fontSize: 14,
    marginTop: 14,
    marginBottom: 8,
  },

  wellnessBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: theme.wellness,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  wellnessRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2.5,
  },
  wellnessInner: {
    flex: 1,
    backgroundColor: theme.bg,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wellnessScore: {
    color: theme.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  wellnessLabel: {
    color: theme.wellness,
    fontSize: 8,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginTop: -2,
  },

  sosWrap: {
    marginTop: 28,
    marginBottom: 28,
    alignItems: 'center',
  },
  sosCenter: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderRadius: 120,
    margin: 40,
  },
  sosBtn: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.sos,
    shadowOpacity: 0.8,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    elevation: 24,
  },
  sosInner: {
    width: 144,
    height: 144,
    borderRadius: 72,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: -4,
  },
  sosPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
    gap: 4,
  },
  sosDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  sosPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sosMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaText: {
    color: theme.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },

  sectionTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  featureCard: {
    padding: 18,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  featureLabel: {
    color: theme.textSecondary,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  featureTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  featureSub: {
    color: theme.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  statusScore: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'right',
  },
  statusScoreLabel: {
    color: theme.textMuted,
    fontSize: 10,
    textAlign: 'right',
    marginTop: -2,
  },
  counterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  counterText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  gaugeTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    marginTop: 14,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: 4,
    borderRadius: 2,
  },

  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(20,18,28,0.92)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.35)',
    padding: 28,
    alignItems: 'center',
  },
  modalIconWrap: {
    marginBottom: 16,
    shadowColor: theme.sos,
    shadowOpacity: 0.8,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  modalIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    color: theme.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  modalCountdown: {
    color: theme.sos,
    fontSize: 80,
    fontWeight: '900',
    letterSpacing: -3,
    marginVertical: 12,
  },
  modalSub: {
    color: theme.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalCancel: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  modalCancelText: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalPrimary: {
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: theme.travel,
  },
  modalPrimaryText: {
    color: '#001A0C',
    fontSize: 14,
    fontWeight: '700',
  },
  contactsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,255,156,0.1)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,255,156,0.3)',
  },
  contactText: {
    color: theme.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});
