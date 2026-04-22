import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Platform,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import GlassCard from '../../src/GlassCard';
import FakeStatusBar from '../../src/StatusBarFake';
import PressableScale from '../../src/PressableScale';

const SARAH_IMG =
  'https://images.unsplash.com/photo-1758600587839-56ba05596c69?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTF8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhc2lhbiUyMHdvbWFuJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwwfHx8fDE3NzY4Njg4NjR8MA&ixlib=rb-4.1.0&q=85';

const CITIES = ['Anywhere', 'Mumbai', 'Bengaluru', 'Delhi NCR', 'San Francisco', 'New York', 'London', 'Remote'];
const CATEGORIES = ['All Roles', 'Design', 'Engineering', 'Product', 'Marketing', 'Data & AI'];

type Job = {
  id: string;
  company: string;
  initial: string;
  role: string;
  meta: string;
  city: string;
  category: string;
  match: number;
  tags: string[];
  desc: string;
  color: string;
  featured?: boolean;
};

const JOBS: Job[] = [
  {
    id: 'j1',
    company: 'Google',
    initial: 'G',
    role: 'Product Design Lead',
    meta: 'Mountain View · Hybrid · Senior',
    city: 'San Francisco',
    category: 'Design',
    match: 94,
    tags: ['$240K–$310K', 'Equity', 'Remote-friendly', '5+ yrs'],
    desc: 'Lead a 6-person design team shaping the next generation of consumer AI surfaces. Focus on trust, safety and accessibility.',
    color: '#1E2540',
    featured: true,
  },
  {
    id: 'j2',
    company: 'Stripe',
    initial: 'S',
    role: 'Senior Product Manager',
    meta: 'San Francisco · Onsite · Senior',
    city: 'San Francisco',
    category: 'Product',
    match: 86,
    tags: ['$220K', 'Equity', '4+ yrs'],
    desc: 'Own the merchant risk & safety product. Partner with ML to ship fraud detection that actually respects honest businesses.',
    color: '#2A1E3A',
  },
  {
    id: 'j3',
    company: 'Razorpay',
    initial: 'R',
    role: 'Staff Engineer — Payments',
    meta: 'Bengaluru · Hybrid · Staff',
    city: 'Bengaluru',
    category: 'Engineering',
    match: 83,
    tags: ['₹70L CTC', 'ESOPs', '7+ yrs'],
    desc: 'Architect the next-gen UPI rails processing 8M+ daily transactions. Python / Go / Kafka.',
    color: '#1B2A3A',
  },
  {
    id: 'j4',
    company: 'Airbnb',
    initial: 'A',
    role: 'Senior UX Researcher',
    meta: 'Remote · Senior · Full-time',
    city: 'Remote',
    category: 'Design',
    match: 79,
    tags: ['$180K', 'Remote', '4+ yrs'],
    desc: 'Lead generative research for the host trust & safety program across 200+ countries.',
    color: '#2F1A24',
  },
  {
    id: 'j5',
    company: 'Nykaa',
    initial: 'N',
    role: 'Head of Brand Marketing',
    meta: 'Mumbai · Onsite · Director',
    city: 'Mumbai',
    category: 'Marketing',
    match: 74,
    tags: ['₹90L CTC', 'Equity', '10+ yrs'],
    desc: 'Define the next chapter of India\'s most loved beauty brand across digital, retail and influencer.',
    color: '#2F1A2B',
  },
  {
    id: 'j6',
    company: 'Anthropic',
    initial: 'A',
    role: 'AI Policy Lead',
    meta: 'London · Hybrid · Senior',
    city: 'London',
    category: 'Data & AI',
    match: 72,
    tags: ['£150K', 'Equity', '6+ yrs'],
    desc: 'Shape frontier-model policy for EMEA. Work directly with safety research & the Trust & Safety teams.',
    color: '#1F2430',
  },
];

function PickerSheet({
  visible,
  options,
  value,
  onSelect,
  onClose,
  title,
}: {
  visible: boolean;
  options: string[];
  value: string;
  onSelect: (v: string) => void;
  onClose: () => void;
  title: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={pickerStyles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={pickerStyles.sheet}>
          {Platform.OS !== 'web' ? (
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null}
          <View style={pickerStyles.handle} />
          <Text style={pickerStyles.title}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(i) => i}
            style={{ maxHeight: 360 }}
            renderItem={({ item }) => {
              const selected = item === value;
              return (
                <TouchableOpacity
                  style={[pickerStyles.row, selected && pickerStyles.rowSelected]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  testID={`picker-option-${item.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <Text style={[pickerStyles.rowText, selected && { color: theme.wellness, fontWeight: '700' }]}>
                    {item}
                  </Text>
                  {selected ? <Feather name="check" size={16} color={theme.wellness} /> : null}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function GrowthScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Anywhere');
  const [category, setCategory] = useState('All Roles');
  const [cityOpen, setCityOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  const refined = query.length > 0 || city !== 'Anywhere' || category !== 'All Roles';

  const filtered = useMemo(() => {
    return JOBS.filter((j) => {
      if (city !== 'Anywhere' && j.city !== city) return false;
      if (category !== 'All Roles' && j.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !j.role.toLowerCase().includes(q) &&
          !j.company.toLowerCase().includes(q) &&
          !j.desc.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [query, city, category]);

  const clearAll = () => {
    setQuery('');
    setCity('Anywhere');
    setCategory('All Roles');
  };

  const featured = filtered.find((j) => j.featured);
  const rest = filtered.filter((j) => !j.featured);

  return (
    <View style={styles.root} testID="growth-screen">
      <LinearGradient colors={['#1A0F1F', '#0D0B14']} style={StyleSheet.absoluteFill} />
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
        keyboardShouldPersistTaps="handled"
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
          {refined ? (
            <PressableScale onPress={clearAll} testID="clear-filters">
              <View style={styles.clearBtn}>
                <Feather name="x" size={14} color={theme.textPrimary} />
                <Text style={styles.clearText}>Clear</Text>
              </View>
            </PressableScale>
          ) : null}
        </View>

        {/* SEARCH + FILTERS */}
        <GlassCard style={styles.searchCard} testID="search-card">
          <View style={styles.searchRow}>
            <Feather name="search" size={16} color={theme.textSecondary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search role, company…"
              placeholderTextColor={theme.textMuted}
              style={styles.searchInput}
              testID="job-search-input"
              returnKeyType="search"
            />
            {query ? (
              <TouchableOpacity onPress={() => setQuery('')} testID="clear-search">
                <Feather name="x-circle" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.filterRow}>
            <PressableScale onPress={() => setCityOpen(true)} style={styles.filterWrap} testID="city-picker">
              <View style={styles.filter}>
                <Feather name="map-pin" size={13} color={theme.wellness} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.filterLabel}>Enter City</Text>
                  <Text style={styles.filterValue} numberOfLines={1}>
                    {city}
                  </Text>
                </View>
                <Feather name="chevron-down" size={14} color={theme.textSecondary} />
              </View>
            </PressableScale>

            <PressableScale onPress={() => setCatOpen(true)} style={styles.filterWrap} testID="category-picker">
              <View style={styles.filter}>
                <Feather name="layers" size={13} color={theme.cyber} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.filterLabel}>Job Category</Text>
                  <Text style={styles.filterValue} numberOfLines={1}>
                    {category}
                  </Text>
                </View>
                <Feather name="chevron-down" size={14} color={theme.textSecondary} />
              </View>
            </PressableScale>
          </View>
        </GlassCard>

        {/* Power Phase banner */}
        {!refined ? (
          <GlassCard style={styles.phaseCard}>
            <View style={styles.phaseRow}>
              <View style={styles.phaseIconWrap}>
                <LinearGradient colors={theme.gradients.wellness} style={styles.phaseIcon}>
                  <MaterialCommunityIcons name="lightning-bolt" size={18} color="#0D0B14" />
                </LinearGradient>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.phaseTitle}>You're in Ovulation</Text>
                <Text style={styles.phaseSub}>High confidence window — pitch, negotiate, connect.</Text>
              </View>
              <View style={styles.phaseChip}>
                <Text style={styles.phaseChipText}>DAY 13</Text>
              </View>
            </View>
          </GlassCard>
        ) : null}

        {/* Refined header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>
            {refined ? `REFINED RESULTS · ${filtered.length}` : 'TOP MATCH TODAY'}
          </Text>
          {refined ? (
            <View style={styles.liveDot}>
              <View style={[styles.dot, { backgroundColor: theme.travel }]} />
              <Text style={styles.liveText}>Live filter</Text>
            </View>
          ) : null}
        </View>

        {/* EMPTY STATE */}
        {filtered.length === 0 ? (
          <GlassCard style={styles.emptyCard} testID="empty-state">
            <View style={styles.emptyIconWrap}>
              <LinearGradient colors={theme.gradients.wellness} style={styles.emptyIcon}>
                <Feather name="map-pin" size={28} color="#0D0B14" />
              </LinearGradient>
            </View>
            <Text style={styles.emptyTitle}>Filter by City to find your fit</Text>
            <Text style={styles.emptySub}>
              No roles match{' '}
              <Text style={styles.emptyHighlight}>{city}</Text>
              {category !== 'All Roles' ? (
                <>
                  {' · '}
                  <Text style={styles.emptyHighlight}>{category}</Text>
                </>
              ) : null}
              {query ? (
                <>
                  {' · “'}
                  <Text style={styles.emptyHighlight}>{query}</Text>
                  {'”'}
                </>
              ) : null}
              . Try loosening the filters below.
            </Text>
            <View style={styles.emptyActions}>
              <PressableScale onPress={() => setCity('Anywhere')} testID="empty-try-anywhere">
                <View style={styles.emptyBtn}>
                  <Feather name="globe" size={12} color={theme.textPrimary} />
                  <Text style={styles.emptyBtnText}>Try Anywhere</Text>
                </View>
              </PressableScale>
              <PressableScale onPress={clearAll} testID="empty-clear">
                <View style={[styles.emptyBtn, styles.emptyBtnPrimary]}>
                  <Feather name="refresh-ccw" size={12} color="#0D0B14" />
                  <Text style={[styles.emptyBtnText, { color: '#0D0B14' }]}>Reset all</Text>
                </View>
              </PressableScale>
            </View>
          </GlassCard>
        ) : null}

        {/* Featured card */}
        {featured ? (
          <PressableScale testID={`job-${featured.id}`}>
            <GlassCard style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={[styles.companyLogo, { backgroundColor: featured.color }]}>
                  <Text style={styles.companyLetter}>{featured.initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.company}>{featured.company}</Text>
                  <Text style={styles.jobMeta}>{featured.meta}</Text>
                </View>
                <View style={styles.matchPill}>
                  <Text style={styles.matchPillText}>{featured.match}% MATCH</Text>
                </View>
              </View>
              <Text style={styles.jobTitle}>{featured.role}</Text>
              <Text style={styles.jobDesc}>{featured.desc}</Text>
              <View style={styles.tagRow}>
                {featured.tags.map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.jobActions}>
                <PressableScale style={{ flexShrink: 0 }}>
                  <View style={styles.secondaryBtn}>
                    <Feather name="bookmark" size={14} color={theme.textPrimary} />
                    <Text style={styles.secondaryText}>Save</Text>
                  </View>
                </PressableScale>
                <PressableScale style={{ flex: 1 }} testID="apply-btn">
                  <LinearGradient
                    colors={theme.gradients.wellness}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryInner}
                  >
                    <Text style={styles.primaryText}>Apply</Text>
                    <Feather name="arrow-right" size={14} color="#0D0B14" />
                  </LinearGradient>
                </PressableScale>
              </View>
            </GlassCard>
          </PressableScale>
        ) : null}

        {/* MENTOR (show only if not refined) */}
        {!refined ? (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 18 }]}>MENTOR MATCH</Text>
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
                      <Feather key={s} name="star" size={10} color={theme.wellness} />
                    ))}
                    <Text style={styles.ratingText}>4.9 · 38 sessions</Text>
                  </View>
                </View>
              </View>

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

              <Text style={styles.mentorBio}>
                "I help women designers move from senior IC to director roles without burning out. 30-min intro, no fluff."
              </Text>

              <View style={styles.mentorActions}>
                <PressableScale>
                  <View style={styles.secondaryBtn}>
                    <Feather name="message-circle" size={14} color={theme.textPrimary} />
                    <Text style={styles.secondaryText}>Message</Text>
                  </View>
                </PressableScale>
                <PressableScale style={{ flex: 1 }} testID="connect-btn">
                  <LinearGradient
                    colors={theme.gradients.cyber}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryInner}
                  >
                    <Text style={[styles.primaryText, { color: '#00121A' }]}>Connect</Text>
                    <Feather name="zap" size={14} color="#00121A" />
                  </LinearGradient>
                </PressableScale>
              </View>
            </GlassCard>
          </>
        ) : null}

        {/* Rest of results */}
        {rest.map((j) => (
          <PressableScale key={j.id} testID={`job-${j.id}`}>
            <GlassCard style={styles.miniCard}>
              <View style={styles.miniRow}>
                <View style={[styles.companyLogo, { backgroundColor: j.color, width: 40, height: 40, borderRadius: 10 }]}>
                  <Text style={[styles.companyLetter, { fontSize: 17 }]}>{j.initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniCompany}>
                    {j.company} · {j.role}
                  </Text>
                  <Text style={styles.miniMeta}>
                    {j.city} · {j.match}% match
                  </Text>
                </View>
                <View style={styles.miniMatch}>
                  <Text style={styles.miniMatchText}>{j.match}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={theme.textSecondary} style={{ marginLeft: 6 }} />
              </View>
            </GlassCard>
          </PressableScale>
        ))}
      </ScrollView>

      <PickerSheet
        visible={cityOpen}
        options={CITIES}
        value={city}
        onSelect={setCity}
        onClose={() => setCityOpen(false)}
        title="Enter City"
      />
      <PickerSheet
        visible={catOpen}
        options={CATEGORIES}
        value={category}
        onSelect={setCategory}
        onClose={() => setCatOpen(false)}
        title="Job Category"
      />
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
    marginBottom: 16,
  },
  eyebrow: { color: theme.wellness, fontSize: 10, letterSpacing: 2, fontWeight: '800' },
  title: { color: theme.textPrimary, fontSize: 32, fontWeight: '800', letterSpacing: -1, marginTop: 4 },
  subtitle: { color: theme.textSecondary, fontSize: 13, marginTop: 4 },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  clearText: {
    color: theme.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },

  searchCard: { padding: 14, marginBottom: 12 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  searchInput: {
    flex: 1,
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  filterWrap: { flex: 1 },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  filterLabel: {
    color: theme.textMuted,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  filterValue: {
    color: theme.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },

  phaseCard: { padding: 16, marginBottom: 16 },
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  phaseIconWrap: {
    shadowColor: theme.wellness,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  phaseIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  phaseTitle: { color: theme.textPrimary, fontSize: 15, fontWeight: '700' },
  phaseSub: { color: theme.textSecondary, fontSize: 12, marginTop: 2 },
  phaseChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,117,143,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,117,143,0.35)',
  },
  phaseChipText: { color: theme.wellness, fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    color: theme.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  liveDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(0,255,156,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(0,255,156,0.3)',
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  liveText: { color: theme.travel, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  emptyCard: { padding: 28, alignItems: 'center', marginBottom: 16 },
  emptyIconWrap: {
    shadowColor: theme.wellness,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    marginBottom: 16,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  emptySub: {
    color: theme.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  emptyHighlight: { color: theme.wellness, fontWeight: '700' },
  emptyActions: { flexDirection: 'row', gap: 8 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  emptyBtnPrimary: {
    backgroundColor: theme.wellness,
    borderColor: 'transparent',
  },
  emptyBtnText: { color: theme.textPrimary, fontSize: 12, fontWeight: '700' },

  jobCard: { padding: 20, marginBottom: 18 },
  jobHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  companyLetter: { color: theme.textPrimary, fontSize: 20, fontWeight: '800' },
  company: { color: theme.textPrimary, fontSize: 14, fontWeight: '700' },
  jobMeta: { color: theme.textSecondary, fontSize: 11, marginTop: 2 },
  matchPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,255,156,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,156,0.3)',
  },
  matchPillText: { color: theme.travel, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  jobTitle: {
    color: theme.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  jobDesc: { color: theme.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 14 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  tagText: { color: theme.textSecondary, fontSize: 10, fontWeight: '600' },
  jobActions: { flexDirection: 'row', gap: 8 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  secondaryText: { color: theme.textPrimary, fontSize: 13, fontWeight: '700' },
  primaryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 999,
  },
  primaryText: { color: '#0D0B14', fontSize: 13, fontWeight: '800' },

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
  mentorName: { color: theme.textPrimary, fontSize: 17, fontWeight: '700' },
  mentorRole: { color: theme.textSecondary, fontSize: 12, marginTop: 2 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  ratingText: { color: theme.textMuted, fontSize: 10, marginLeft: 6, fontWeight: '600' },
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
  syncText: { color: '#0D0B14', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  syncSub: { color: theme.textMuted, fontSize: 11, fontStyle: 'italic', marginBottom: 12 },
  mentorBio: {
    color: theme.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  mentorActions: { flexDirection: 'row', gap: 8 },

  miniCard: { padding: 14, marginBottom: 8 },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniCompany: { color: theme.textPrimary, fontSize: 13, fontWeight: '700' },
  miniMeta: { color: theme.textSecondary, fontSize: 11, marginTop: 2 },
  miniMatch: {
    width: 36,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,255,156,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(0,255,156,0.3)',
  },
  miniMatchText: { color: theme.travel, fontSize: 11, fontWeight: '800' },
});

const pickerStyles = StyleSheet.create({
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  rowSelected: {
    backgroundColor: 'rgba(255,117,143,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,117,143,0.5)',
  },
  rowText: { color: theme.textPrimary, fontSize: 15, fontWeight: '500' },
});
