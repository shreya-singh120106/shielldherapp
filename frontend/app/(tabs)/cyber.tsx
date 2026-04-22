import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import GlassCard from '../../src/GlassCard';
import FakeStatusBar from '../../src/StatusBarFake';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL as string;

type Msg = {
  id: string;
  sender: string;
  preview: string;
  fullText: string;
  time: string;
  kind: 'safe' | 'toxic' | 'unknown';
  unread?: boolean;
  revealedReason?: string;
  category?: string;
};

const INITIAL: Msg[] = [
  {
    id: '1',
    sender: 'Mom',
    preview: 'Did you reach office safely? Text me when you land ❤️',
    fullText: 'Did you reach office safely? Text me when you land ❤️',
    time: '9:32 AM',
    kind: 'safe',
    unread: false,
  },
  {
    id: '2',
    sender: 'Unknown (+91 98•••••21)',
    preview: 'Hey gorgeous. Saw your photos online. Send me more...',
    fullText:
      'Hey gorgeous. Saw your photos online. Send me more private pics or I will share what I already have with your contacts.',
    time: '9:28 AM',
    kind: 'toxic',
    unread: true,
  },
  {
    id: '3',
    sender: 'HR — Stripe',
    preview: 'Great meeting you! Next round scheduled for Tuesday 3pm.',
    fullText: 'Great meeting you! Next round scheduled for Tuesday 3pm.',
    time: 'Yesterday',
    kind: 'safe',
  },
  {
    id: '4',
    sender: 'Unknown (+1 415•••••)',
    preview: 'Urgent — your KYC failed. Click link to verify now...',
    fullText:
      'URGENT: Your KYC verification has failed. Click https://bit.ly/secure-verify to re-verify within 2 hours or your account will be frozen.',
    time: 'Yesterday',
    kind: 'unknown',
    unread: true,
  },
  {
    id: '5',
    sender: 'Riya',
    preview: 'Dinner at 8? I made reservations at Pali Village 🍷',
    fullText: 'Dinner at 8? I made reservations at Pali Village 🍷',
    time: 'Tue',
    kind: 'safe',
  },
];

export default function CyberScreen() {
  const insets = useSafeAreaInsets();
  const [msgs, setMsgs] = useState<Msg[]>(INITIAL);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const revealMessage = async (id: string) => {
    const msg = msgs.find((m) => m.id === id);
    if (!msg) return;
    if (msg.kind === 'safe') return;

    setLoading(id);
    setError(null);
    try {
      const resp = await fetch(`${BACKEND_URL}/api/ai/toxic-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg.fullText, sender: msg.sender }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setMsgs((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                kind: data.is_toxic ? 'toxic' : 'safe',
                revealedReason: data.reason,
                category: data.category,
              }
            : m
        )
      );
    } catch (e: any) {
      setError('AI check failed — showing local flag.');
    } finally {
      setLoading(null);
    }
  };

  const toxicCount = msgs.filter((m) => m.kind === 'toxic').length;

  return (
    <View style={styles.root} testID="cyber-screen">
      <LinearGradient
        colors={['#0F1A22', '#0D0B14']}
        style={StyleSheet.absoluteFill}
      />
      {/* Cyber glow */}
      <View style={styles.glow}>
        <LinearGradient
          colors={['rgba(0,229,255,0.2)', 'rgba(13,11,20,0)']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={{ paddingTop: insets.top }}>
        <FakeStatusBar />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>CYBER SHIELD</Text>
            <Text style={styles.title}>Inbox</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: theme.cyber }]} />
            <Text style={styles.statusText}>AI filter on</Text>
          </View>
        </View>

        <GlassCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: theme.cyber }]}>
                {msgs.length}
              </Text>
              <Text style={styles.statLabel}>scanned today</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: theme.sos }]}>{toxicCount}</Text>
              <Text style={styles.statLabel}>toxic hidden</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: theme.travel }]}>99.2%</Text>
              <Text style={styles.statLabel}>accuracy</Text>
            </View>
          </View>
        </GlassCard>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Messages */}
        <View style={{ gap: 10, marginTop: 16 }}>
          {msgs.map((m) => {
            const isHidden = (m.kind === 'toxic' || m.kind === 'unknown') && !m.revealedReason;
            return (
              <TouchableOpacity
                key={m.id}
                activeOpacity={0.85}
                onPress={() => revealMessage(m.id)}
                disabled={m.kind === 'safe'}
                testID={`msg-${m.id}`}
              >
                <GlassCard
                  style={[
                    styles.msgCard,
                    m.kind === 'toxic' &&
                      m.revealedReason && { borderColor: 'rgba(255,59,48,0.4)' },
                  ]}
                >
                  <View style={styles.msgRow}>
                    <View
                      style={[
                        styles.avatar,
                        {
                          backgroundColor:
                            m.kind === 'safe'
                              ? 'rgba(0,229,255,0.15)'
                              : 'rgba(255,59,48,0.15)',
                          borderColor:
                            m.kind === 'safe' ? theme.cyber : theme.sos,
                        },
                      ]}
                    >
                      <Feather
                        name={m.kind === 'safe' ? 'user' : 'alert-triangle'}
                        size={16}
                        color={m.kind === 'safe' ? theme.cyber : theme.sos}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={styles.msgTopRow}>
                        <Text
                          style={[
                            styles.sender,
                            m.unread && { color: theme.textPrimary },
                          ]}
                          numberOfLines={1}
                        >
                          {m.sender}
                        </Text>
                        <Text style={styles.time}>{m.time}</Text>
                      </View>

                      {isHidden ? (
                        <View style={styles.hiddenWrap}>
                          {/* Blurred preview */}
                          <View style={styles.blurredTextContainer}>
                            <Text style={styles.blurredText} numberOfLines={1}>
                              {m.preview}
                            </Text>
                            {Platform.OS !== 'web' ? (
                              <BlurView
                                intensity={22}
                                tint="dark"
                                style={StyleSheet.absoluteFill}
                              />
                            ) : (
                              <View
                                style={[
                                  StyleSheet.absoluteFill,
                                  {
                                    backgroundColor: 'rgba(13,11,20,0.75)',
                                    borderRadius: 6,
                                  },
                                ]}
                              />
                            )}
                          </View>
                          <View style={styles.toxicLabel}>
                            <Feather
                              name="eye-off"
                              size={11}
                              color={theme.sos}
                            />
                            <Text style={styles.toxicText}>
                              {m.kind === 'toxic' ? 'Toxic — Hidden' : 'Unverified — tap to scan'}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <>
                          <Text style={styles.preview} numberOfLines={2}>
                            {m.preview}
                          </Text>
                          {m.revealedReason ? (
                            <View
                              style={[
                                styles.reasonChip,
                                m.kind === 'toxic' && {
                                  backgroundColor: 'rgba(255,59,48,0.1)',
                                  borderColor: 'rgba(255,59,48,0.3)',
                                },
                              ]}
                            >
                              <Feather
                                name={m.kind === 'toxic' ? 'shield-off' : 'check-circle'}
                                size={10}
                                color={m.kind === 'toxic' ? theme.sos : theme.travel}
                              />
                              <Text
                                style={[
                                  styles.reasonText,
                                  {
                                    color:
                                      m.kind === 'toxic' ? theme.sos : theme.travel,
                                  },
                                ]}
                                numberOfLines={2}
                              >
                                AI · {m.category?.toUpperCase()} — {m.revealedReason}
                              </Text>
                            </View>
                          ) : null}
                        </>
                      )}
                    </View>

                    {loading === m.id ? (
                      <ActivityIndicator size="small" color={theme.cyber} />
                    ) : m.unread && !m.revealedReason ? (
                      <View
                        style={[
                          styles.unreadDot,
                          {
                            backgroundColor:
                              m.kind === 'toxic' ? theme.sos : theme.cyber,
                          },
                        ]}
                      />
                    ) : null}
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  glow: {
    position: 'absolute',
    top: -200,
    right: -150,
    width: 500,
    height: 500,
    borderRadius: 250,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 16,
  },
  eyebrow: {
    color: theme.cyber,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '800',
  },
  title: {
    color: theme.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.3)',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: {
    color: theme.cyber,
    fontSize: 11,
    fontWeight: '700',
  },
  statsCard: { padding: 18 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: {
    color: theme.textSecondary,
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  errorText: {
    color: theme.sos,
    fontSize: 12,
    marginTop: 8,
  },
  msgCard: { padding: 14 },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sender: {
    color: theme.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  time: {
    color: theme.textMuted,
    fontSize: 11,
  },
  preview: {
    color: theme.textSecondary,
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  hiddenWrap: { marginTop: 4 },
  blurredTextContainer: {
    position: 'relative',
    borderRadius: 6,
    overflow: 'hidden',
  },
  blurredText: {
    color: theme.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  toxicLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255,59,48,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.3)',
  },
  toxicText: {
    color: theme.sos,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,255,156,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,156,0.25)',
    maxWidth: '100%',
  },
  reasonText: {
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
