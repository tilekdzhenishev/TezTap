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
import { BUSINESS_TYPE_OPTIONS } from '../../types';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export const EmployerSignUpScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { signUpEmployer } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [description, setDescription] = useState('');
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

  const clearError = (field: string) =>
    setErrors((p) => { const n = { ...p }; delete n[field]; return n; });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!companyName.trim() || companyName.trim().length < 2) e.companyName = 'Минимум 2 символа';
    if (!validateEmail(email)) e.email = 'Неверный формат email';
    if (!phone.trim() || phone.trim().length < 9) e.phone = 'Введите корректный номер';
    if (!industry) e.industry = 'Выберите тип бизнеса';
    if (password.length < 8) e.password = 'Минимум 8 символов';
    if (password !== confirmPassword) e.confirmPassword = 'Пароли не совпадают';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUpEmployer({
        companyName,
        email,
        password,
        industry,
        contactPhone: phone,
        description: description.trim() || undefined,
      });
      navigation.navigate('EmailVerification', { email });
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('already registered') || msg.includes('already exists')) {
        setErrors((p) => ({ ...p, email: 'Этот email уже зарегистрирован' }));
      } else {
        Alert.alert('Ошибка', msg || 'Не удалось создать аккаунт.');
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
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ДЛЯ РАБОТОДАТЕЛЕЙ</Text>
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Регистрация компании</Text>
              <Text style={styles.subtitle}>
                После регистрации вы пройдёте ручную проверку
              </Text>
            </View>

            <View style={styles.form}>
              <AuthInput
                label="Название компании *"
                value={companyName}
                onChangeText={(t) => { setCompanyName(t); clearError('companyName'); }}
                placeholder="Globus, Café Central..."
                autoCapitalize="words"
                error={errors.companyName}
              />
              <View style={styles.spacer} />
              <AuthInput
                label="Рабочий Email *"
                value={email}
                onChangeText={(t) => { setEmail(t); clearError('email'); }}
                placeholder="company@example.com"
                keyboardType="email-address"
                error={errors.email}
              />
              <View style={styles.spacer} />
              <AuthInput
                label="Контактный телефон *"
                value={phone}
                onChangeText={(t) => { setPhone(t); clearError('phone'); }}
                placeholder="+996 XXX XXX XXX"
                keyboardType="phone-pad"
                error={errors.phone}
              />
              <View style={styles.spacer} />

              <Text style={styles.sectionLabel}>ТИП БИЗНЕСА *</Text>
              {errors.industry ? (
                <Text style={styles.errorText}>{errors.industry}</Text>
              ) : null}
              <View style={styles.industryGrid}>
                {BUSINESS_TYPE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, industry === opt && styles.chipSelected]}
                    onPress={() => { setIndustry(opt); clearError('industry'); }}
                  >
                    <Text style={[styles.chipText, industry === opt && styles.chipTextSelected]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.spacer} />
              <AuthInput
                label="О компании (необязательно)"
                value={description}
                onChangeText={setDescription}
                placeholder="Коротко о вашем заведении..."
                multiline
                numberOfLines={3}
              />
              <View style={styles.spacer} />
              <AuthInput
                label="Пароль *"
                value={password}
                onChangeText={(t) => { setPassword(t); clearError('password'); }}
                secureTextEntry
                placeholder="Минимум 8 символов"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                error={errors.password}
              />
              <PasswordStrengthBar password={password} />
              <View style={styles.spacer} />
              <AuthInput
                label="Повторите пароль *"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); clearError('confirmPassword'); }}
                secureTextEntry
                placeholder="••••••••"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                error={errors.confirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />

              <View style={styles.notice}>
                <Text style={styles.noticeText}>
                  Заявка проходит ручную проверку — обычно 1–2 рабочих дня.
                </Text>
              </View>

              <View style={styles.submitSpacer} />
              <AuthButton title="Подать заявку" onPress={handleSignUp} loading={loading} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Уже есть аккаунт? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('EmployerLogin')}>
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
  backBtn: { marginTop: 8, marginBottom: 24, alignSelf: 'flex-start', padding: 4 },
  backBtnText: { fontSize: 26, color: '#FFFFFF', fontWeight: '300' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF8C0015',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#FF8C0030',
    marginBottom: 20,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#FF8C00', letterSpacing: 1.5 },
  header: { marginBottom: 32 },
  title: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666666', lineHeight: 22 },
  form: { gap: 0 },
  spacer: { height: 16 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  errorText: { fontSize: 12, color: '#FF3B30', marginBottom: 6 },
  industryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
    backgroundColor: '#141414',
  },
  chipSelected: { borderColor: '#FF8C00', backgroundColor: '#FF8C0015' },
  chipText: { fontSize: 13, color: '#888888', fontWeight: '500' },
  chipTextSelected: { color: '#FF8C00', fontWeight: '700' },
  notice: {
    backgroundColor: '#141414',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#FF8C00',
    marginTop: 8,
  },
  noticeText: { fontSize: 13, color: '#666666', lineHeight: 20 },
  submitSpacer: { height: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  footerText: { fontSize: 15, color: '#555555' },
  footerLink: { fontSize: 15, color: '#FF8C00', fontWeight: '700' },
});
