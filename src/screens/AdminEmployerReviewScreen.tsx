import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/appStore';
import { theme } from '../utils/theme';
import { Employer } from '../types';
import { ArrowLeft, Check, RefreshCw, X } from 'lucide-react-native';

export const AdminEmployerReviewScreen: React.FC = () => {
  const navigation = useNavigation();
  const { pendingEmployers, loading, loadPendingEmployers, approveEmployer, rejectEmployer } =
    useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  useEffect(() => {
    loadPendingEmployers();
  }, []);

  const advance = () => {
    setCurrentIndex((prev) => Math.min(prev, pendingEmployers.length - 2));
    setShowRejectInput(false);
    setRejectNote('');
  };

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => {
      setActionFeedback(null);
      advance();
    }, 1000);
  };

  const handleApprove = async () => {
    const employer = pendingEmployers[currentIndex];
    if (!employer) return;
    const ok = await approveEmployer(employer.id);
    if (ok) showFeedback('Одобрено');
  };

  const handleReject = async () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    const employer = pendingEmployers[currentIndex];
    if (!employer) return;
    const ok = await rejectEmployer(employer.id, rejectNote.trim() || undefined);
    if (ok) showFeedback('Отклонено');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.admin} />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (pendingEmployers.length === 0 || currentIndex >= pendingEmployers.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={18} color={theme.colors.textSecondary} />
            <Text style={styles.backBtnText}>Назад</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Работодатели</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Нет заявок</Text>
          <Text style={styles.emptyText}>Все заявки обработаны</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadPendingEmployers}>
            <RefreshCw size={16} color="#000000" />
            <Text style={styles.refreshButtonText}>Обновить</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const employer: Employer = pendingEmployers[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={18} color={theme.colors.textSecondary} />
          <Text style={styles.backBtnText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Работодатели</Text>
        <Text style={styles.headerCounter}>
          {pendingEmployers.length - currentIndex} ожидает
        </Text>
      </View>

      {actionFeedback ? (
        <View style={styles.feedbackOverlay}>
          <Text style={styles.feedbackText}>{actionFeedback}</Text>
        </View>
      ) : null}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>НОВАЯ ЗАЯВКА</Text>
          </View>

          <Text style={styles.businessName}>{employer.business_name}</Text>
          <Text style={styles.businessType}>{employer.business_type}</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Телефон</Text>
            <Text style={styles.rowValue}>{employer.contact_phone}</Text>
          </View>

          {employer.description ? (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>О компании</Text>
              <Text style={styles.rowValue}>{employer.description}</Text>
            </View>
          ) : null}

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Подана</Text>
            <Text style={styles.rowValue}>
              {new Date(employer.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {showRejectInput ? (
          <View style={styles.rejectInputBox}>
            <Text style={styles.rejectInputLabel}>Причина отказа (необязательно)</Text>
            <TextInput
              style={styles.rejectInput}
              value={rejectNote}
              onChangeText={setRejectNote}
              placeholder="Не прошло проверку, некорректные данные..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              autoFocus
            />
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
            <Check size={17} color="#000000" />
            <Text style={styles.approveButtonText}>Одобрить</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
            <X size={17} color={theme.colors.danger} />
            <Text style={styles.rejectButtonText}>
              {showRejectInput ? 'Подтвердить отказ' : 'Отклонить'}
            </Text>
          </TouchableOpacity>
          {showRejectInput ? (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowRejectInput(false);
                setRejectNote('');
              }}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.admin,
  },
  headerCounter: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 60,
  },
  backBtn: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtnText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  cardBadge: {
    backgroundColor: theme.colors.admin + '20',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  cardBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.admin,
    letterSpacing: 0.8,
  },
  businessName: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  businessType: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.cardBorder,
    marginVertical: theme.spacing.md,
  },
  row: {
    marginBottom: theme.spacing.md,
  },
  rowLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  rowValue: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  rejectInputBox: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.danger + '60',
  },
  rejectInputLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  rejectInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: 15,
    color: theme.colors.text,
    minHeight: 80,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  actions: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  approveButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  rejectButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.danger,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  feedbackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  feedbackText: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  refreshButton: {
    backgroundColor: theme.colors.admin,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
