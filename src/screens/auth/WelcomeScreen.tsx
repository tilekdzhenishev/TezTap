import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Image, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { AuthStackParamList } from '../../types/navigation';
import { AuthButton } from '../../components/auth/AuthButton';
import { styles, width, height } from './WelcomeScreen.styles';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();

  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoY = useRef(new Animated.Value(20)).current;
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const headlineY = useRef(new Animated.Value(28)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsY = useRef(new Animated.Value(32)).current;
  const orb1Scale = useRef(new Animated.Value(1)).current;
  const orb2Scale = useRef(new Animated.Value(1)).current;

  const handleLogoTap = () => {
    tapCount.current++;
    if (tapCount.current === 1) {
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
      }, 1500);
    }
    if (tapCount.current >= 5) {
      if (tapTimer.current) clearTimeout(tapTimer.current);
      tapCount.current = 0;
      navigation.navigate('AdminAuth');
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Scale, { toValue: 1.15, duration: 3200, useNativeDriver: true }),
        Animated.timing(orb1Scale, { toValue: 1, duration: 3200, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Scale, { toValue: 1.12, duration: 4100, useNativeDriver: true }),
        Animated.timing(orb2Scale, { toValue: 1, duration: 4100, useNativeDriver: true }),
      ])
    ).start();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(logoY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(headlineOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(headlineY, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]),
      Animated.timing(subOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(buttonsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(buttonsY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Animated.View
        style={[styles.orb, styles.orbTopLeft, { transform: [{ scale: orb1Scale }] }]}
      />
      <Animated.View
        style={[styles.orb, styles.orbBottomRight, { transform: [{ scale: orb2Scale }] }]}
      />
      <View style={[styles.orbCenter, { top: height * 0.2, left: width / 2 - 250 }]} />

      <View style={styles.gridOverlay} pointerEvents="none">
        {[...Array(6)].map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLineH, { top: (height / 6) * i }]} />
        ))}
        {[...Array(5)].map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLineV, { left: (width / 5) * i }]} />
        ))}
      </View>

      <View style={[styles.content, { paddingTop: height * 0.08 }]}>
        <View style={styles.heroSection}>
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }, { translateY: logoY }],
            }}
          >
            <TouchableOpacity onPress={handleLogoTap} activeOpacity={1}>
              <Image source={require('../../../assets/logo.png')} style={styles.logoImage} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.headlineSection,
            { opacity: headlineOpacity, transform: [{ translateY: headlineY }] },
          ]}
        >
          <Text style={styles.headlineMain}>{t('welcome.tagline1')}</Text>
          <Text style={styles.headlineAccent}>{t('welcome.tagline2')}</Text>
          <Animated.Text style={[styles.headlineSub, { opacity: subOpacity }]}>
            {t('welcome.taglineSub')}
          </Animated.Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonSection,
            { opacity: buttonsOpacity, transform: [{ translateY: buttonsY }] },
          ]}
        >
          <AuthButton
            title={t('welcome.cta.worker')}
            onPress={() => navigation.navigate('UserLogin')}
            variant="primary"
          />
          <View style={styles.buttonGap} />
          <AuthButton
            title={t('welcome.cta.employer')}
            onPress={() => navigation.navigate('EmployerLogin')}
            variant="outline"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('welcome.footer.terms')}{' '}
              <Text style={styles.footerLink}>{t('welcome.footer.termsLink')}</Text>
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AdminAuth')}
              style={styles.adminDot}
              hitSlop={{ top: 16, bottom: 16, left: 32, right: 32 }}
            >
              <Text style={styles.adminDotText}>· · ·</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};
