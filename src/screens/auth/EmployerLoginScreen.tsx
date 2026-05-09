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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { useAuth } from '../../auth/AuthContext';
import { validateEmail } from '../../auth/authService';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export const EmployerLoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (!validateEmail(email)) e.email = 'Неверный формат email';
    if (!password) e.password = 'Введите пароль';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('Invalid login')) {
        setErrors({ password: 'Неверный email или пароль' });
      } else if (msg.includes('Email not confirmed')) {
        Alert.alert('Подтвердите email', 'Проверьте почту и перейдите по ссылке.');
      } else {
        Alert.alert('Ошибка', msg || 'Не удалось войти.');
      }
    } finally {
      setLoading(false);
    }
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
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ДЛЯ РАБОТОДАТЕЛЕЙ</Text>
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Войти в кабинет</Text>
              <Text style={styles.subtitle}>Управляйте вакансиями и откликами</Text>
            </View>

            <View style={styles.form}>
              <AuthInput
                label="Рабочий Email"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErrors((p) => ({ ...p, email: '' }));
                }}
                placeholder="company@example.com"
                keyboardType="email-address"
                error={errors.email}
                returnKeyType="next"
              />
              <View style={styles.spacer} />
              <AuthInput
                label="Пароль"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setErrors((p) => ({ ...p, password: '' }));
                }}
                secureTextEntry
                placeholder="••••••••"
                autoComplete="current-password"
                textContentType="password"
                error={errors.password}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => navigation.navigate('ForgotPassword', { email })}
              >
                <Text style={styles.forgotText}>Забыли пароль?</Text>
              </TouchableOpacity>

              <View style={styles.submitSpacer} />
              <AuthButton title="Войти" onPress={handleLogin} loading={loading} />
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>или</Text>
              <View style={styles.dividerLine} />
            </View>

            <AuthButton
              title="Зарегистрировать компанию"
              onPress={() => navigation.navigate('EmployerSignUp')}
              variant="outline"
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ищете работу? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('UserLogin')}>
                <Text style={styles.footerLink}>Войти как соискатель</Text>
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
  backBtn: { marginTop: 8, marginBottom: 24, alignSelf: 'flex-start', padding: 4 },
  backBtnText: { fontSize: 26, color: '#FFFFFF', fontWeight: '300' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#60A5FA15',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#60A5FA30',
    marginBottom: 20,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#60A5FA', letterSpacing: 1.5 },
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
  forgotBtn: { alignSelf: 'flex-end', marginTop: 12, paddingVertical: 4 },
  forgotText: { fontSize: 14, color: '#60A5FA', fontWeight: '600' },
  submitSpacer: { height: 28 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1E1E1E' },
  dividerText: { fontSize: 13, color: '#444444', fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  footerText: { fontSize: 15, color: '#555555' },
  footerLink: { fontSize: 15, color: '#60A5FA', fontWeight: '700' },
});
