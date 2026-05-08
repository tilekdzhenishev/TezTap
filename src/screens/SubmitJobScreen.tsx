import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { JobDraft, DURATION_OPTIONS, EXPERIENCE_OPTIONS } from '../types';
import { submitJob } from '../supabase/client';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../utils/theme';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CheckCircle, Clock, MapPin, Timer, X } from 'lucide-react-native';

type SubmitJobRouteProp = RouteProp<RootStackParamList, 'SubmitJob'>;

const STEPS = [
  'Название',
  'Оплата',
  'Срок',
  'График',
  'Место',
  'Описание',
  'Опыт',
  'Компания',
  'Контакт',
  'Проверка',
] as const;

const initialDraft: JobDraft = {
  title: '',
  payment: '',
  duration: '',
  schedule: '',
  location: '',
  description: '',
  experience: '',
  company_name: '',
  contact_url: '',
};

export const SubmitJobScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<SubmitJobRouteProp>();
  const { employerId } = route.params;
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<JobDraft>(initialDraft);
  const [customDuration, setCustomDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleNext = () => {
    const error = validateStep(step, draft, customDuration);
    if (error) {
      Alert.alert('Ошибка', error);
      return;
    }

    if (draft.duration === 'Другое' && customDuration) {
      setDraft(prev => ({ ...prev, duration: customDuration }));
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await submitJob({
      employer_id: employerId,
      title: draft.title,
      description: draft.description,
      payment: draft.payment,
      duration: draft.duration,
      schedule: draft.schedule,
      location: draft.location,
      experience: draft.experience || null,
      company_name: draft.company_name || null,
      contact_url: draft.contact_url,
      status: 'pending',
      is_active: false,
      closed_at: null,
    });

    setSubmitting(false);

    if (result) {
      Alert.alert(
        'Спасибо!',
        'Смена отправлена на проверку.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Ошибка', 'Не удалось отправить. Попробуйте снова.');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Заполнить заново',
      'Все данные будут удалены.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Да',
          onPress: () => {
            setDraft(initialDraft);
            setCustomDuration('');
            setStep(0);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <X size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Разместить смену</Text>
        <Text style={styles.stepIndicator}>
          {step + 1} / {STEPS.length}
        </Text>
      </View>

      <View style={styles.stepProgress}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.stepDot,
              i <= step ? styles.stepDotActive : styles.stepDotInactive,
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {step === 0 && <StepTitle draft={draft} setDraft={setDraft} />}
        {step === 1 && <StepPayment draft={draft} setDraft={setDraft} />}
        {step === 2 && (
          <StepDuration
            draft={draft}
            setDraft={setDraft}
            customDuration={customDuration}
            setCustomDuration={setCustomDuration}
          />
        )}
        {step === 3 && <StepSchedule draft={draft} setDraft={setDraft} />}
        {step === 4 && <StepLocation draft={draft} setDraft={setDraft} />}
        {step === 5 && <StepDescription draft={draft} setDraft={setDraft} />}
        {step === 6 && <StepExperience draft={draft} setDraft={setDraft} />}
        {step === 7 && <StepCompany draft={draft} setDraft={setDraft} />}
        {step === 8 && <StepContact draft={draft} setDraft={setDraft} />}
        {step === 9 && <StepPreview draft={draft} />}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && step < STEPS.length - 1 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={18} color={theme.colors.textSecondary} />
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
        )}

        {step < STEPS.length - 1 && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Далее</Text>
            <ArrowRight size={18} color="#000000" />
          </TouchableOpacity>
        )}

        {step === STEPS.length - 1 && (
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Заново</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <ArrowLeft size={18} color={theme.colors.textSecondary} />
              <Text style={styles.backButtonText}>Изменить</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextButton, submitting && styles.nextButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.nextButtonText}>
                {submitting ? 'Отправка...' : 'Отправить'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

function validateStep(step: number, draft: JobDraft, customDuration: string): string | null {
  switch (step) {
    case 0:
      if (draft.title.length < 4) return 'Минимум 4 символа';
      if (draft.title.length > 60) return 'Максимум 60 символов';
      return null;
    case 1:
      if (!/\d/.test(draft.payment)) return 'Должно содержать хотя бы одну цифру';
      if (draft.payment.length > 40) return 'Максимум 40 символов';
      return null;
    case 2:
      if (!draft.duration && !customDuration) return 'Выберите срок';
      if (draft.duration === 'Другое' && !customDuration.trim()) return 'Укажите срок';
      return null;
    case 3:
      if (draft.schedule.length < 3) return 'Минимум 3 символа';
      if (draft.schedule.length > 50) return 'Максимум 50 символов';
      return null;
    case 4:
      if (draft.location.length < 3) return 'Минимум 3 символа';
      if (draft.location.length > 60) return 'Максимум 60 символов';
      return null;
    case 5:
      if (draft.description.length < 15) return 'Минимум 15 символов';
      if (draft.description.length > 220) return 'Максимум 220 символов';
      return null;
    case 6:
      if (!draft.experience) return 'Выберите вариант';
      return null;
    case 7:
      if (!draft.company_name.trim()) return 'Введите название';
      return null;
    case 8:
      if (!draft.contact_url.trim()) return 'Введите контакт';
      return null;
    default:
      return null;
  }
}

const StepTitle: React.FC<{
  draft: JobDraft;
  setDraft: (d: JobDraft | ((prev: JobDraft) => JobDraft)) => void;
}> = ({ draft, setDraft }) => (
  <View style={styles.stepContent}>
    <Text style={styles.question}>Как называется подработка?</Text>
    <Text style={styles.examples}>
      Например: Курьер на сегодня, Официант на 3 дня, Помощник в магазин
    </Text>
    <TextInput
      style={styles.input}
      value={draft.title}
      onChangeText={(text) => setDraft((prev: JobDraft) => ({ ...prev, title: text }))}
      placeholder="Курьер на сегодня"
      placeholderTextColor={theme.colors.textMuted}
      maxLength={60}
      autoFocus
    />
    <Text style={styles.charCount}>{draft.title.length} / 60</Text>
  </View>
);

const StepPayment: React.FC<{
  draft: JobDraft;
  setDraft: (d: JobDraft | ((prev: JobDraft) => JobDraft)) => void;
}> = ({ draft, setDraft }) => (
  <View style={styles.stepContent}>
    <Text style={styles.question}>Сколько платите?</Text>
    <Text style={styles.examples}>
      Например: 1500 сом / день, 700 сом / смена, 250 сом / час
    </Text>
    <TextInput
      style={styles.input}
      value={draft.payment}
      onChangeText={(text) => setDraft((prev: JobDraft) => ({ ...prev, payment: text }))}
      placeholder="1500 сом / день"
      placeholderTextColor={theme.colors.textMuted}
      maxLength={40}
      autoFocus
    />
    <Text style={styles.charCount}>{draft.payment.length} / 40</Text>
  </View>
);

const StepDuration: React.FC<{
  draft: JobDraft;
  setDraft: (d: JobDraft | ((prev: JobDraft) => JobDraft)) => void;
  customDuration: string;
  setCustomDuration: (text: string) => void;
}> = ({ draft, setDraft, customDuration, setCustomDuration }) => (
  <View style={styles.stepContent}>
    <Text style={styles.question}>На какой срок нужна помощь?</Text>
    <View style={styles.options}>
      {DURATION_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[
            styles.optionButton,
            draft.duration === opt && styles.optionButtonSelected,
          ]}
          onPress={() => setDraft((prev: JobDraft) => ({ ...prev, duration: opt }))}
        >
          <Text
            style={[
              styles.optionText,
              draft.duration === opt && styles.optionTextSelected,
            ]}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    {draft.duration === 'Другое' && (
      <TextInput
        style={styles.input}
        value={customDuration}
        onChangeText={setCustomDuration}
        placeholder="Укажите свой срок"
        placeholderTextColor={theme.colors.textMuted}
        autoFocus
      />
    )}
  </View>
);

const StepSchedule: React.FC<{
  draft: JobDraft;
  setDraft: (d: JobDraft | ((prev: JobDraft) => JobDraft)) => void;
}> = ({ draft, setDraft }) => (
  <View style={styles.stepContent}>
    <Text style={styles.question}>Во сколько нужно работать?</Text>
    <Text style={styles.examples}>
      Например: 09:00–18:00, вечером, 4 часа в день, по договорённости
    </Text>
    <TextInput
      style={styles.input}
      value={draft.schedule}
      onChangeText={(text) => setDraft((prev: JobDraft) => ({ ...prev, schedule: text }))}
      placeholder="09:00–18:00"
      placeholderTextColor={theme.colors.textMuted}
      maxLength={50}
      autoFocus
    />
    <Text style={styles.charCount}>{draft.schedule.length} / 50</Text>
  </View>
);

const StepLocation: React.FC<{
  draft: JobDraft;
  setDraft: (d: JobDraft | ((prev: JobDraft) => JobDraft)) => void;
}> = ({ draft, setDraft }) => (
  <View style={styles.stepContent}>
    <Text style={styles.question}>Где находится работа?</Text>
    <Text style={styles.examples}>
      Например: Бишкек, центр, Ошский рынок, Удалённо
    </Text>
    <TextInput
      style={styles.input}
      value={draft.location}
      onChangeText={(text) => setDraft((prev: JobDraft) => ({ ...prev, location: text }))}
      placeholder="Бишкек, центр"
      placeholderTextColor={theme.colors.textMuted}
      maxLength={60}
      autoFocus
    />
    <Text style={styles.charCount}>{draft.location.length} / 60</Text>
  </View>
);

const StepDescription: React.FC<{
  draft: JobDraft;
  setDraft: (d: JobDraft | ((prev: JobDraft) => JobDraft)) => void;
}> = ({ draft, setDraft }) => (
  <View style={styles.stepContent}>
    <Text style={styles.question}>Коротко опишите задачу.</Text>
    <Text style={styles.examples}>
      Например: Доставлять заказы по центру. Всё покажем, опыт не нужен.
    </Text>
    <TextInput
      style={[styles.input, styles.textArea]}
      value={draft.description}
      onChangeText={(text) => setDraft((prev: JobDraft) => ({ ...prev, description: text }))}
      placeholder="Доставлять заказы по центру. Всё покажем, опыт не нужен."
      placeholderTextColor={theme.colors.textMuted}
      maxLength={220}
      multiline
      numberOfLines={4}
      textAlignVertical="top"
      autoFocus
    />
    <Text style={styles.charCount}>{draft.description.length} / 220</Text>
  </View>
);

const StepExperience: React.FC<{
  draft: JobDraft;
  setDraft: (d: JobDraft | ((prev: JobDraft) => JobDraft)) => void;
}> = ({ draft, setDraft }) => (
  <View style={styles.stepContent}>
    <Text style={styles.question}>Нужен опыт?</Text>
    <View style={styles.options}>
      {EXPERIENCE_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[
            styles.optionButton,
            draft.experience === opt && styles.optionButtonSelected,
          ]}
          onPress={() => setDraft((prev: JobDraft) => ({ ...prev, experience: opt }))}
        >
          <Text
            style={[
              styles.optionText,
              draft.experience === opt && styles.optionTextSelected,
            ]}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const StepCompany: React.FC<{
  draft: JobDraft;
  setDraft: (d: JobDraft | ((prev: JobDraft) => JobDraft)) => void;
}> = ({ draft, setDraft }) => (
  <View style={styles.stepContent}>
    <Text style={styles.question}>Название компании или заведения?</Text>
    <Text style={styles.examples}>
      Например: Globus, Кафе в центре, Склад одежды
    </Text>
    <TextInput
      style={styles.input}
      value={draft.company_name}
      onChangeText={(text) => setDraft((prev: JobDraft) => ({ ...prev, company_name: text }))}
      placeholder="Globus"
      placeholderTextColor={theme.colors.textMuted}
      autoFocus
    />
  </View>
);

const StepContact: React.FC<{
  draft: JobDraft;
  setDraft: (d: JobDraft | ((prev: JobDraft) => JobDraft)) => void;
}> = ({ draft, setDraft }) => (
  <View style={styles.stepContent}>
    <Text style={styles.question}>Куда кандидату писать?</Text>
    <Text style={styles.examples}>
      @username, https://t.me/username, +996 XXX XXX XXX
    </Text>
    <TextInput
      style={styles.input}
      value={draft.contact_url}
      onChangeText={(text) => setDraft((prev: JobDraft) => ({ ...prev, contact_url: text }))}
      placeholder="@username"
      placeholderTextColor={theme.colors.textMuted}
      autoFocus
    />
  </View>
);

const StepPreview: React.FC<{ draft: JobDraft }> = ({ draft }) => (
  <View style={styles.stepContent}>
    <Text style={styles.previewTitle}>Проверьте перед отправкой</Text>
    <View style={styles.previewCard}>
      <Text style={styles.previewTitleText}>{draft.title}</Text>
      <View style={styles.previewDetails}>
        <Text style={styles.previewDetail}>{draft.payment}</Text>
        <View style={styles.previewDetailRow}>
          <Timer size={14} color={theme.colors.textSecondary} />
          <Text style={styles.previewDetail}>{draft.duration}</Text>
        </View>
        <View style={styles.previewDetailRow}>
          <Clock size={14} color={theme.colors.textSecondary} />
          <Text style={styles.previewDetail}>{draft.schedule}</Text>
        </View>
        <View style={styles.previewDetailRow}>
          <MapPin size={14} color={theme.colors.textSecondary} />
          <Text style={styles.previewDetail}>{draft.location}</Text>
        </View>
      </View>
      <Text style={styles.previewDescription}>{draft.description}</Text>
      {draft.experience && (
        <Text style={styles.previewExperience}>{draft.experience}</Text>
      )}
      <View style={styles.previewDivider} />
      <View style={styles.previewDetailRow}>
        <CheckCircle size={14} color={theme.colors.success} />
        <Text style={styles.previewVerified}>Проверенный работодатель</Text>
      </View>
      {draft.company_name && (
        <View style={styles.previewDetailRow}>
          <BriefcaseBusiness size={14} color={theme.colors.textSecondary} />
          <Text style={styles.previewCompany}>{draft.company_name}</Text>
        </View>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  closeButton: {
    padding: 8,
    minWidth: 36,
  },
  closeButtonText: {
    fontSize: 18,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  stepIndicator: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  stepProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepDotActive: {
    backgroundColor: theme.colors.primary,
  },
  stepDotInactive: {
    backgroundColor: theme.colors.cardBorder,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  stepContent: {
    paddingVertical: theme.spacing.md,
  },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  examples: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  textArea: {
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  options: {
    gap: theme.spacing.sm,
  },
  optionButton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  optionButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  backButton: {
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  resetButton: {
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.danger,
  },
  previewActions: {
    gap: theme.spacing.sm,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  previewTitleText: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  previewDetails: {
    marginBottom: theme.spacing.md,
  },
  previewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.xs,
  },
  previewDetail: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  previewDescription: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.sm,
  },
  previewExperience: {
    fontSize: 14,
    color: theme.colors.primaryLight,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  previewDivider: {
    height: 1,
    backgroundColor: theme.colors.cardBorder,
    marginVertical: theme.spacing.md,
  },
  previewVerified: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '600',
  },
  previewCompany: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  },
});
