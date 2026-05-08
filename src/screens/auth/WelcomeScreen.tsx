import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { AuthButton } from '../../components/auth/AuthButton';

const { height } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.88)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(16)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(buttonsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(buttonsY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        <View style={styles.logoSection}>
          <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
            <View style={styles.logoRow}>
              <Text style={styles.logoTez}>Tez</Text>
              <Text style={styles.logoTap}>Tap</Text>
            </View>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>BISHKEK</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: taglineOpacity,
              transform: [{ translateY: taglineY }],
              marginTop: 32,
            }}
          >
            <Text style={styles.tagline}>Быстрые подработки.</Text>
            <Text style={styles.taglineAccent}>Проверенные работодатели.</Text>
            <Text style={styles.taglineSub}>
              Находите срочные смены или сотрудников{'\n'}за считанные минуты.
            </Text>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.buttonSection,
            { opacity: buttonsOpacity, transform: [{ translateY: buttonsY }] },
          ]}
        >
          <View style={styles.buttonGroup}>
            <AuthButton
              title="Найти работу"
              onPress={() => navigation.navigate('UserLogin')}
              variant="primary"
            />
            <View style={styles.buttonSpacer} />
            <AuthButton
              title="Я работодатель"
              onPress={() => navigation.navigate('EmployerLogin')}
              variant="outline"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Нажимая «Продолжить», вы соглашаетесь с{' '}
              <Text style={styles.footerLink}>Условиями использования</Text>
            </Text>
          </View>
        </Animated.View>

      </View>

      <View style={styles.decorLeft} />
      <View style={styles.decorRight} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: height * 0.06,
    paddingBottom: 24,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoTez: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -3,
  },
  logoTap: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FF8C00',
    letterSpacing: -3,
  },
  logoBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FF8C0015',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FF8C0030',
  },
  logoBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF8C00',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 36,
  },
  taglineAccent: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF8C00',
    lineHeight: 36,
    marginBottom: 16,
  },
  taglineSub: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  buttonSection: {
    gap: 0,
  },
  buttonGroup: {
    gap: 0,
  },
  buttonSpacer: {
    height: 12,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#444444',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#666666',
    textDecorationLine: 'underline',
  },
  decorLeft: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FF8C00',
    opacity: 0.03,
    top: -80,
    left: -100,
  },
  decorRight: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF8C00',
    opacity: 0.04,
    bottom: 100,
    right: -60,
  },
});
