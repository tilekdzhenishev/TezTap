import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { useAuth } from '../../auth/AuthContext';
import { validateEmail } from '../../auth/authService';

type Nav = NativeStackNavigationProp<AuthStackParamList>;
type Route = RouteProp<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState(route.params?.email || '');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSend = async () => {
    if (!validateEmail(email)) {
      setEmailError('Введите корректный email');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (e: any) {
      Alert.alert('Ошибка', e?.message || 'Не удалось отправить письмо.');
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Animated.View
          style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          {!sent ? (
            <>
              <KeyRound size={42} color="#FF8C00" style={styles.icon} />
              <Text style={styles.title}>Сбросить пароль</Text>
              <Text style={styles.subtitle}>
                Введите ваш email, и мы отправим ссылку для сброса пароля.
              </Text>

              <View style={styles.form}>
                <AuthInput
                  label="Email"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setEmailError('');
                  }}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  error={emailError}
                  returnKeyType="done"
                  onSubmitEditing={handleSend}
                />
                <View style={styles.spacer} />
                <AuthButton title="Отправить ссылку" onPress={handleSend} loading={loading} />
              </View>
            </>
          ) : (
            <>
              <Mail size={42} color="#FF8C00" style={styles.icon} />
              <Text style={styles.title}>Письмо отправлено</Text>
              <Text style={styles.subtitle}>
                Мы отправили ссылку для сброса пароля на{'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>
              <Text style={styles.hintText}>Проверьте папку «Спам», если письмо не пришло.</Text>
              <View style={styles.spacer} />
              <AuthButton
                title="Вернуться к входу"
                onPress={() => navigation.goBack()}
                variant="outline"
              />
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#080808' },
  backBtn: { marginTop: 8, marginLeft: 24, alignSelf: 'flex-start', padding: 4 },
  backBtnText: { fontSize: 26, color: '#FFFFFF', fontWeight: '300' },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  icon: { fontSize: 48, marginBottom: 20 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: { fontSize: 16, color: '#666666', lineHeight: 24, marginBottom: 32 },
  emailHighlight: { color: '#FF8C00', fontWeight: '600' },
  hintText: { fontSize: 14, color: '#444444', lineHeight: 20 },
  form: { gap: 0 },
  spacer: { height: 20 },
});
