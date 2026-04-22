import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { theme } from '../src/theme';

const { width } = Dimensions.get('window');

export default function SplashGate() {
  const router = useRouter();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const glow = useRef(new Animated.Value(0.4)).current;
  const screenTwoOpacity = useRef(new Animated.Value(0)).current;
  const screenOneOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 0.4,
            duration: 1600,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    const t1 = setTimeout(() => {
      Animated.parallel([
        Animated.timing(screenOneOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(screenTwoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2200);

    const t2 = setTimeout(() => {
      router.replace('/(tabs)');
    }, 5200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <View style={styles.container} testID="splash-screen">
      {/* Ambient glow */}
      <Animated.View style={[styles.ambient, { opacity: glow }]}>
        <LinearGradient
          colors={['rgba(255,117,143,0.35)', 'rgba(13,11,20,0)']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[styles.ambient2, { opacity: glow }]}>
        <LinearGradient
          colors={['rgba(0,229,255,0.25)', 'rgba(13,11,20,0)']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Screen 1 */}
      <Animated.View
        style={[styles.content, { opacity: screenOneOpacity }]}
        pointerEvents="none"
      >
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
            alignItems: 'center',
          }}
        >
          <View style={styles.logoRing}>
            <LinearGradient
              colors={theme.gradients.wellness}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoInner}
            >
              <Feather name="shield" size={48} color="#0D0B14" />
            </LinearGradient>
          </View>
          <Text style={styles.brand} testID="splash-brand">
            ShieldHer
          </Text>
          <Text style={styles.tagline}>
            One platform. Three shields. Zero compromise.
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Screen 2 */}
      <Animated.View
        style={[styles.content, styles.contentTwo, { opacity: screenTwoOpacity }]}
        pointerEvents="none"
      >
        <Text style={styles.headline}>
          Empowering your journey with{'\n'}
          <Text style={{ color: theme.wellness }}>AI-driven safety</Text>,{' '}
          <Text style={{ color: theme.cyber }}>digital protection</Text>, and{' '}
          <Text style={{ color: theme.travel }}>career growth</Text>.
        </Text>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, { backgroundColor: theme.wellness }]} />
          <View style={[styles.dot, { backgroundColor: theme.cyber }]} />
          <View style={[styles.dot, { backgroundColor: theme.travel }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    overflow: 'hidden',
  },
  ambient: {
    position: 'absolute',
    top: -width * 0.4,
    left: -width * 0.3,
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width,
  },
  ambient2: {
    position: 'absolute',
    bottom: -width * 0.6,
    right: -width * 0.4,
    width: width * 1.3,
    height: width * 1.3,
    borderRadius: width,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  contentTwo: {
    justifyContent: 'center',
  },
  logoRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: theme.wellness,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  logoInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: theme.textPrimary,
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1.5,
    marginBottom: 12,
  },
  tagline: {
    color: theme.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  headline: {
    color: theme.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.5,
    textAlign: 'left',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 40,
    alignSelf: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
