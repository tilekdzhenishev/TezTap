import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { PasswordStrengthBar } from '../../components/auth/PasswordStrengthBar';
import { useAuth } from '../../auth/AuthContext';
import { validateEmail } from '../../auth/authService';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export const UserSignUpScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { signUpUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) e.fullName = 'Минимум 2 символа';
    if (!validateEmail(email)) e.email = 'Неверный формат email';
    if (password.length < 8) e.password = 'Минимум 8 символов';
    if (password !== confirmPassword) e.confirmPassword = 'Пароли не совпадают';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUpUser({ fullName, email, password });
      navigation.navigate('EmailVerification', { email });
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('already registered') || msg.includes('already exists')) {
        setErrors((prev) => ({ ...prev, email: 'Этот email уже зарегистрирован' }));
      } else {
        Alert.alert('Ошибка', msg || 'Не удалось создать аккаунт.');
      }
    } finally {
      setLoading(false);
    }
  };

  const setField = (field: string, value: string, setter: (v: string) => void) => {
    setter(value);
    if (errors[field])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.header}>
              <Text style={styles.title}>Создать аккаунт</Text>
              <Text style={styles.subtitle}>Найдите работу рядом с вами</Text>
            </View>

            <View style={styles.form}>
              <AuthInput
                label="Полное имя"
                value={fullName}
                onChangeText={(t) => setField('fullName', t, setFullName)}
                placeholder="Иван Иванов"
                autoCapitalize="words"
                error={errors.fullName}
                returnKeyType="next"
              />
              <View style={styles.spacer} />
              <AuthInput
                label="Email"
                value={email}
                onChangeText={(t) => setField('email', t, setEmail)}
                placeholder="you@example.com"
                keyboardType="email-address"
                error={errors.email}
                returnKeyType="next"
              />
              <View style={styles.spacer} />
              <AuthInput
                label="Пароль"
                value={password}
                onChangeText={(t) => setField('password', t, setPassword)}
                secureTextEntry
                placeholder="Минимум 8 символов"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                error={errors.password}
                returnKeyType="next"
              />
              <PasswordStrengthBar password={password} />
              <View style={styles.spacer} />
              <AuthInput
                label="Повторите пароль"
                value={confirmPassword}
                onChangeText={(t) => setField('confirmPassword', t, setConfirmPassword)}
                secureTextEntry
                placeholder="••••••••"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                error={errors.confirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />

              <View style={styles.submitSpacer} />
              <AuthButton title="Создать аккаунт" onPress={handleSignUp} loading={loading} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Уже есть аккаунт? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('UserLogin')}>
                <Text style={styles.footerLink}>Войти</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#080808' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  backBtn: { marginTop: 8, marginBottom: 32, alignSelf: 'flex-start', padding: 4 },
  backBtnText: { fontSize: 26, color: '#FFFFFF', fontWeight: '300' },
  header: { marginBottom: 36 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: '#666666' },
  form: { gap: 0 },
  spacer: { height: 16 },
  submitSpacer: { height: 28 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  footerText: { fontSize: 15, color: '#555555' },
  footerLink: { fontSize: 15, color: '#FF8C00', fontWeight: '700' },
});
