import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import GlassCard from '../../src/GlassCard';
import FakeStatusBar from '../../src/StatusBarFake';

const SARAH_IMG =
  'https://images.unsplash.com/photo-1758600587839-56ba05596c69?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTF8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhc2lhbiUyMHdvbWFuJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwwfHx8fDE3NzY4Njg4NjR8MA&ixlib=rb-4.1.0&q=85';

export default function GrowthScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root} testID="growth-screen">
      <LinearGradient
        colors={['#1A0F1F', '#0D0B14']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowTopRight}>
        <LinearGradient
          colors={['rgba(255,117,143,0.25)', 'rgba(13,11,20,0)']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={{ paddingTop: insets.top }}>
        <FakeStatusBar />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>GROWTH</Text>
            <Text style={styles.title}>Opportunities</Text>
            <Text style={styles.subtitle}>
              Matched to your{' '}
              <Text style={{ color: theme.wellness, fontWeight: '700' }}>Power Phase</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Feather name="sliders" size={16} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Power Phase context banner */}
        <GlassCard style={styles.phaseCard}>
          <View style={styles.phaseRow}>
            <View style={styles.phaseIconWrap}>
              <LinearGradient
                colors={theme.gradients.wellness}
                style={styles.phaseIcon}
              >
                <MaterialCommunityIcons name="lightning-bolt" size={18} color="#0D0B14" />
              </LinearGradient>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.phaseTitle}>You're in Ovulation</Text>
              <Text style={styles.phaseSub}>
                High confidence window — pitch, negotiate, connect.
              </Text>
            </View>
            <View style={styles.phaseChip}>
              <Text style={styles.phaseChipText}>DAY 13</Text>
            </View>
          </View>
        </GlassCard>

        {/* Job card */}
        <Text style={styles.sectionTitle}>TOP MATCH TODAY</Text>
        <GlassCard style={styles.jobCard}>
          <View style={styles.jobHeader}>
            <View style={styles.companyLogo}>
              <Text style={styles.companyLetter}>G</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.company}>Google</Text>
              <Text style={styles.jobMeta}>Mountain View · Hybrid · Senior</Text>
            </View>
            <View style={styles.matchPill}>
              <Text style={styles.matchPillText}>94% MATCH</Text>
            </View>
          </View>

          <Text style={styles.jobTitle}>Product Design Lead</Text>
          <Text style={styles.jobDesc}>
            Lead a 6-person design team shaping the next generation of consumer AI
            surfaces. Focus on trust, safety and accessibility.
          </Text>

          <View style={styles.tagRow}>
            {['$240K–$310K', 'Equity', 'Remote-friendly', '5+ yrs'].map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={styles.jobActions}>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Feather name="bookmark" size={14} color={theme.textPrimary} />
              <Text style={styles.secondaryText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={styles.primaryBtn} testID="apply-btn">
              <LinearGradient
                colors={theme.gradients.wellness}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryInner}
              >
                <Text style={styles.primaryText}>Apply</Text>
                <Feather name="arrow-right" size={14} color="#0D0B14" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Mentor card */}
        <Text style={styles.sectionTitle}>MENTOR MATCH</Text>
        <GlassCard style={styles.mentorCard}>
          <View style={styles.mentorTopRow}>
            <Image source={{ uri: SARAH_IMG }} style={styles.avatar} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={styles.nameRow}>
                <Text style={styles.mentorName}>Sarah Chen</Text>
                <Feather name="check-circle" size={14} color={theme.cyber} />
              </View>
              <Text style={styles.mentorRole}>Design Director · ex-Airbnb</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Feather
                    key={s}
                    name="star"
                    size={10}
                    color={theme.wellness}
                  />
                ))}
                <Text style={styles.ratingText}>4.9 · 38 sessions</Text>
              </View>
            </View>
          </View>

          <View style={styles.syncRow}>
            <LinearGradient
              colors={theme.gradients.wellness}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.syncPill}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={11} color="#0D0B14" />
              <Text style={styles.syncText}>Power Phase Sync</Text>
            </LinearGradient>
            <Text style={styles.syncSub}>Matches your cycle confidence window</Text>
          </View>

          <Text style={styles.mentorBio}>
            "I help women designers move from senior IC to director roles without
            burning out. 30-min intro, no fluff."
          </Text>

          <View style={styles.mentorActions}>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Feather name="message-circle" size={14} color={theme.textPrimary} />
              <Text style={styles.secondaryText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={styles.primaryBtn} testID="connect-btn">
              <LinearGradient
                colors={theme.gradients.cyber}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryInner}
              >
                <Text style={[styles.primaryText, { color: '#00121A' }]}>Connect</Text>
                <Feather name="zap" size={14} color="#00121A" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Secondary opportunity */}
        <GlassCard style={styles.miniCard}>
          <View style={styles.miniRow}>
            <View style={[styles.companyLogo, { backgroundColor: '#2A1E3A' }]}>
              <Text style={styles.companyLetter}>S</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.miniCompany}>Stripe · Senior PM</Text>
              <Text style={styles.miniMeta}>San Francisco · 86% match</Text>
            </View>
            <Feather name="chevron-right" size={18} color={theme.textSecondary} />
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  glowTopRight: {
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
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 18,
  },
  eyebrow: {
    color: theme.wellness,
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
  subtitle: {
    color: theme.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  phaseCard: { padding: 16, marginBottom: 20 },
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  phaseIconWrap: {
    shadowColor: theme.wellness,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  phaseIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseTitle: {
    color: theme.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  phaseSub: {
    color: theme.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  phaseChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,117,143,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,117,143,0.35)',
  },
  phaseChipText: {
    color: theme.wellness,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  sectionTitle: {
    color: theme.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
    marginTop: 4,
  },
  jobCard: { padding: 20, marginBottom: 24 },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E2540',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  companyLetter: {
    color: theme.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  company: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  jobMeta: {
    color: theme.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  matchPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,255,156,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,156,0.3)',
  },
  matchPillText: {
    color: theme.travel,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  jobTitle: {
    color: theme.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  jobDesc: {
    color: theme.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tagText: {
    color: theme.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  jobActions: { flexDirection: 'row', gap: 8 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  secondaryText: {
    color: theme.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
  primaryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  primaryText: {
    color: '#0D0B14',
    fontSize: 13,
    fontWeight: '800',
  },

  mentorCard: { padding: 20, marginBottom: 18 },
  mentorTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: theme.wellness,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mentorName: {
    color: theme.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  mentorRole: {
    color: theme.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  ratingText: {
    color: theme.textMuted,
    fontSize: 10,
    marginLeft: 6,
    fontWeight: '600',
  },
  syncRow: { marginBottom: 12 },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 4,
  },
  syncText: {
    color: '#0D0B14',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  syncSub: {
    color: theme.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
  },
  mentorBio: {
    color: theme.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  mentorActions: { flexDirection: 'row', gap: 8 },

  miniCard: { padding: 14 },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniCompany: {
    color: theme.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  miniMeta: {
    color: theme.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
