import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { AuthButton } from '../../components/auth/AuthButton';
import { useAuth } from '../../auth/AuthContext';

type Nav = NativeStackNavigationProp<AuthStackParamList>;
type Route = RouteProp<AuthStackParamList, 'EmailVerification'>;

export const EmailVerificationScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { resetPassword } = useAuth();
  const { email } = route.params;

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(contentAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(contentY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[styles.iconWrap, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
        >
          <Ionicons name="mail" size={42} color="#FF8C00" />
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={14} color="#000000" />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: contentAnim, transform: [{ translateY: contentY }] }}>
          <Text style={styles.title}>Проверьте почту</Text>
          <Text style={styles.subtitle}>Мы отправили письмо с подтверждением на</Text>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.instruction}>
            Нажмите на ссылку в письме, чтобы активировать аккаунт. После этого вернитесь и войдите.
          </Text>

          <View style={styles.steps}>
            {['Откройте письмо от TezTap', 'Нажмите «Подтвердить»', 'Вернитесь и войдите'].map(
              (step, i) => (
                <View key={i} style={styles.step}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              )
            )}
          </View>

          <View style={styles.actions}>
            <AuthButton
              title="Войти"
              onPress={() => navigation.navigate('UserLogin')}
              variant="primary"
            />
            <View style={styles.spacer} />
            <TouchableOpacity style={styles.resendBtn} onPress={() => resetPassword(email)}>
              <Text style={styles.resendText}>Отправить письмо снова</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808' },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#080808',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: { fontSize: 15, color: '#666666', textAlign: 'center' },
  email: {
    fontSize: 15,
    color: '#FF8C00',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  instruction: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  steps: {
    alignSelf: 'stretch',
    gap: 14,
    marginBottom: 36,
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF8C0015',
    borderWidth: 1,
    borderColor: '#FF8C0030',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontSize: 13, fontWeight: '800', color: '#FF8C00' },
  stepText: { fontSize: 14, color: '#888888', fontWeight: '500' },
  actions: { alignSelf: 'stretch' },
  spacer: { height: 12 },
  resendBtn: { alignItems: 'center', paddingVertical: 12 },
  resendText: { fontSize: 15, color: '#555555', fontWeight: '600' },
});
