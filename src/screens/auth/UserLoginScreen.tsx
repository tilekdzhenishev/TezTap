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
import { useAuth } from '../../auth/AuthContext';
import { validateEmail } from '../../auth/authService';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export const UserLoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Введите email');
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Неверный формат email');
      valid = false;
    }
    if (!password) {
      setPasswordError('Введите пароль');
      valid = false;
    }
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('Invalid login')) {
        setPasswordError('Неверный email или пароль');
      } else if (msg.includes('Email not confirmed')) {
        Alert.alert(
          'Подтвердите email',
          'Проверьте почту и перейдите по ссылке для подтверждения.'
        );
      } else {
        Alert.alert('Ошибка', msg || 'Не удалось войти. Попробуйте снова.');
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

          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          >
            <View style={styles.header}>
              <Text style={styles.title}>С возвращением</Text>
              <Text style={styles.subtitle}>Войдите в свой аккаунт</Text>
            </View>

            <View style={styles.form}>
              <AuthInput
                label="Email"
                value={email}
                onChangeText={(t) => { setEmail(t); setEmailError(''); }}
                keyboardType="email-address"
                placeholder="you@example.com"
                error={emailError}
                returnKeyType="next"
              />
              <View style={styles.fieldSpacer} />
              <AuthInput
                label="Пароль"
                value={password}
                onChangeText={(t) => { setPassword(t); setPasswordError(''); }}
                secureTextEntry
                placeholder="••••••••"
                autoComplete="current-password"
                textContentType="password"
                error={passwordError}
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
              <AuthButton
                title="Войти"
                onPress={handleLogin}
                loading={loading}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Нет аккаунта? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('UserSignUp')}>
                <Text style={styles.footerLink}>Зарегистрироваться</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backBtn: {
    marginTop: 8,
    marginBottom: 32,
    alignSelf: 'flex-start',
    padding: 4,
  },
  backBtnText: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  header: {
    marginBottom: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
  },
  form: {
    gap: 0,
  },
  fieldSpacer: {
    height: 16,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 12,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 14,
    color: '#FF8C00',
    fontWeight: '600',
  },
  submitSpacer: {
    height: 28,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 15,
    color: '#555555',
  },
  footerLink: {
    fontSize: 15,
    color: '#FF8C00',
    fontWeight: '700',
  },
});
