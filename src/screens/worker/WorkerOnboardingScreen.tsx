import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../auth/AuthContext';
import { createWorkerProfile, uploadWorkerDoc } from '../../supabase/client';
import { RootStackParamList } from '../../types/navigation';
import { theme } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DATA_STEPS = 5;

function isValidPhone(p: string): boolean {
  const digits = p.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 12;
}

function isValidBirthYear(y: string): boolean {
  const year = parseInt(y, 10);
  const currentYear = new Date().getFullYear();
  return !isNaN(year) && year >= 1940 && year <= currentYear - 16;
}

export const WorkerOnboardingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user, refreshWorkerProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [passportUri, setPassportUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const pickFromLibrary = async (setter: (uri: string) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет доступа', 'Разрешите доступ к фотографиям в настройках');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setter(result.assets[0].uri);
  };

  const pickFromCamera = async (setter: (uri: string) => void) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет доступа', 'Разрешите доступ к камере в настройках');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets[0]) setter(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      let passportPath: string | undefined;
      let selfiePath: string | undefined;

      if (passportUri) {
        const p = await uploadWorkerDoc(user.id, 'passport', passportUri);
        passportPath = p ?? undefined;
      }
      if (selfieUri) {
        const p = await uploadWorkerDoc(user.id, 'selfie', selfieUri);
        selfiePath = p ?? undefined;
      }

      const profile = await createWorkerProfile(user.id, {
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        birth_year: birthYear ? parseInt(birthYear, 10) : undefined,
        passport_front_url: passportPath,
        selfie_url: selfiePath,
      });

      if (!profile) {
        Alert.alert('Ошибка', 'Не удалось создать профиль. Попробуйте ещё раз.');
        return;
      }

      await refreshWorkerProfile();
      setIsSuccess(true);
    } catch {
      Alert.alert('Ошибка', 'Что-то пошло не так. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return fullName.trim().length >= 2 && fullName.trim().length <= 50;
      case 2:
        return isValidPhone(phone);
      case 3:
        return isValidBirthYear(birthYear);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step < DATA_STEPS) {
      setStep(step + 1);
    } else {
      // Step 5 — submit
      handleSubmit();
    }
  };

  const progress = Math.min((step / DATA_STEPS) * 100, 100);

  // ── Success screen ────────────────────────────────────────────
  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContent}>
          <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
          <Text style={styles.successTitle}>Профиль отправлен на проверку</Text>
          <Text style={styles.successDesc}>
            Мы проверим ваши документы в течение 1–2 рабочих дней.{'\n\n'}
            Вы уже можете откликаться на вакансии и найдёте работу быстрее после верификации.
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Перейти к вакансиям</Text>
            <Ionicons name="arrow-forward" size={18} color="#000000" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        {step > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.backBtnText}>Назад</Text>
          </TouchableOpacity>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.stepLabel}>
            Шаг {step} из {DATA_STEPS}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Step content */}
        <View style={styles.stepContent}>
          {/* Step 1 — Full name */}
          {step === 1 && (
            <>
              <Ionicons
                name="person"
                size={44}
                color={theme.colors.primary}
                style={styles.stepIconSvg}
              />
              <Text style={styles.stepTitle}>Как вас зовут?</Text>
              <Text style={styles.stepDesc}>Ваше имя будет видно работодателям</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Имя и фамилия"
                placeholderTextColor="#444"
                autoFocus
                autoCapitalize="words"
                maxLength={50}
              />
            </>
          )}

          {/* Step 2 — Phone number */}
          {step === 2 && (
            <>
              <Ionicons
                name="phone-portrait"
                size={44}
                color={theme.colors.primary}
                style={styles.stepIconSvg}
              />
              <Text style={styles.stepTitle}>Введите номер телефона</Text>
              <Text style={styles.stepDesc}>
                Работодатели смогут связаться с вами после подтверждения заявки
              </Text>
              <View style={styles.phoneRow}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixText}>+996</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="555 123 456"
                  placeholderTextColor="#444"
                  keyboardType="phone-pad"
                  autoFocus
                  maxLength={16}
                />
              </View>
              <Text style={styles.phoneHint}>Формат: +996 555 123 456</Text>
            </>
          )}

          {/* Step 3 — Birth year */}
          {step === 3 && (
            <>
              <Ionicons
                name="gift"
                size={44}
                color={theme.colors.primary}
                style={styles.stepIconSvg}
              />
              <Text style={styles.stepTitle}>Введите год рождения</Text>
              <Text style={styles.stepDesc}>
                Нужен для верификации. Минимальный возраст — 16 лет.
              </Text>
              <TextInput
                style={styles.input}
                value={birthYear}
                onChangeText={setBirthYear}
                placeholder="Например: 1995"
                placeholderTextColor="#444"
                keyboardType="number-pad"
                maxLength={4}
                autoFocus
              />
            </>
          )}

          {/* Step 4 — Passport */}
          {step === 4 && (
            <>
              <Ionicons
                name="id-card"
                size={44}
                color={theme.colors.primary}
                style={styles.stepIconSvg}
              />
              <Text style={styles.stepTitle}>Загрузите фото паспорта</Text>
              <View style={styles.hintBox}>
                <Text style={styles.hintItem}>• Документ должен быть читаемым</Text>
                <Text style={styles.hintItem}>• Без размытия и бликов</Text>
                <Text style={styles.hintItem}>• Весь документ должен быть виден</Text>
              </View>
              {passportUri ? (
                <View style={styles.photoWrap}>
                  <Image source={{ uri: passportUri }} style={styles.photo} />
                  <TouchableOpacity style={styles.changeBtn} onPress={() => setPassportUri(null)}>
                    <Text style={styles.changeBtnText}>Изменить фото</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadRow}>
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={() => pickFromLibrary(setPassportUri)}
                  >
                    <Ionicons name="image" size={28} color={theme.colors.textSecondary} />
                    <Text style={styles.uploadLabel}>Галерея</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={() => pickFromCamera(setPassportUri)}
                  >
                    <Ionicons name="camera" size={28} color={theme.colors.textSecondary} />
                    <Text style={styles.uploadLabel}>Камера</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity style={styles.skipBtn} onPress={() => setStep(5)}>
                <Text style={styles.skipText}>Пропустить — загружу позже</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 5 — Selfie */}
          {step === 5 && (
            <>
              <Ionicons
                name="shield-checkmark"
                size={44}
                color={theme.colors.primary}
                style={styles.stepIconSvg}
              />
              <Text style={styles.stepTitle}>Сделайте селфи</Text>
              <View style={styles.hintBox}>
                <Text style={styles.hintItem}>• Лицо должно быть хорошо видно</Text>
                <Text style={styles.hintItem}>• Без очков и маски</Text>
                <Text style={styles.hintItem}>• Хорошее освещение</Text>
              </View>
              {selfieUri ? (
                <View style={styles.photoWrap}>
                  <Image source={{ uri: selfieUri }} style={[styles.photo, styles.selfie]} />
                  <TouchableOpacity style={styles.changeBtn} onPress={() => setSelfieUri(null)}>
                    <Text style={styles.changeBtnText}>Переснять</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadRow}>
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={() => pickFromCamera(setSelfieUri)}
                  >
                    <Ionicons name="camera" size={28} color={theme.colors.textSecondary} />
                    <Text style={styles.uploadLabel}>Камера</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={() => pickFromLibrary(setSelfieUri)}
                  >
                    <Ionicons name="image" size={28} color={theme.colors.textSecondary} />
                    <Text style={styles.uploadLabel}>Галерея</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity style={styles.skipBtn} onPress={handleSubmit}>
                <Text style={styles.skipText}>Пропустить — загружу позже</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Next / Submit button */}
        {step !== 4 && step !== 5 && (
          <TouchableOpacity
            style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canProceed() || submitting}
          >
            <Text style={styles.nextBtnText}>Далее</Text>
            <Ionicons name="arrow-forward" size={18} color="#000000" />
          </TouchableOpacity>
        )}

        {(step === 4 || step === 5) && (
          <TouchableOpacity
            style={[styles.nextBtn, submitting && styles.nextBtnDisabled]}
            onPress={step === 4 ? () => setStep(5) : handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.nextBtnText}>
                  {step === 5 ? 'Отправить на проверку' : 'Далее'}
                </Text>
                {step !== 5 && <Ionicons name="arrow-forward" size={18} color="#000000" />}
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: theme.spacing.md, paddingBottom: 48 },
  backBtn: { marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: 6 },
  backBtnText: { fontSize: 15, color: theme.colors.textSecondary, fontWeight: '600' },
  header: { marginBottom: 28 },
  stepLabel: { fontSize: 13, color: theme.colors.textMuted, fontWeight: '600', marginBottom: 10 },
  progressTrack: {
    height: 4,
    backgroundColor: theme.colors.cardBorder,
    borderRadius: 2,
  },
  progressFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 2 },
  stepContent: { minHeight: 300, marginBottom: 28 },
  stepIconSvg: { marginBottom: 16 },
  stepTitle: { fontSize: 26, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
  stepDesc: { fontSize: 15, color: theme.colors.textSecondary, lineHeight: 22, marginBottom: 24 },
  input: {
    borderWidth: 1.5,
    borderColor: theme.colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: theme.colors.text,
    backgroundColor: theme.colors.card,
  },
  phoneRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: theme.colors.cardBorder,
    borderRadius: 14,
    overflow: 'hidden',
    height: 58,
    marginBottom: 8,
  },
  phonePrefix: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: theme.colors.cardBorder,
  },
  phonePrefixText: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 18,
    color: theme.colors.text,
    backgroundColor: theme.colors.card,
  },
  phoneHint: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 4 },
  hintBox: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: 6,
    marginBottom: 20,
  },
  hintItem: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 20 },
  uploadRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  uploadBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: theme.colors.cardBorder,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.card,
  },
  uploadLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  photoWrap: { alignItems: 'center', gap: 12, marginBottom: 16 },
  photo: { width: '100%', height: 200, borderRadius: 14, resizeMode: 'cover' },
  selfie: { width: 180, height: 180, borderRadius: 90 },
  changeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  changeBtnText: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '600' },
  skipBtn: { paddingVertical: 14, alignItems: 'center' },
  skipText: { fontSize: 13, color: theme.colors.textMuted },
  nextBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: 17, fontWeight: '800', color: '#000' },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  successIcon: { fontSize: 64, marginBottom: 8 },
  successTitle: { fontSize: 26, fontWeight: '800', color: theme.colors.text, textAlign: 'center' },
  successDesc: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  doneBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doneBtnText: { fontSize: 17, fontWeight: '800', color: '#000' },
});
