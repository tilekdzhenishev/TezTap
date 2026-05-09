import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../auth/AuthContext';
import { fetchMyApplications } from '../../supabase/client';
import { JobApplication } from '../../types';
import { theme } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';

const STATUS_LABELS: Record<string, string> = {
  applied: 'Ожидает',
  accepted: 'Принят',
  completed: 'Выполнен',
  no_show: 'Неявка',
  cancelled: 'Отменён',
  rejected: 'Отклонён',
};

const STATUS_COLORS: Record<string, string> = {
  applied: '#60A5FA',
  accepted: '#22C55E',
  completed: '#3B82F6',
  no_show: '#EF4444',
  cancelled: '#6B7280',
  rejected: '#6B7280',
};

export const WorkerProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, workerProfile, profile, loading, signOut, refreshWorkerProfile } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshWorkerProfile();
      if (user) {
        setLoadingApps(true);
        fetchMyApplications(user.id)
          .then(setApplications)
          .finally(() => setLoadingApps(false));
      }
    }, [user])
  );

  const verificationColor = () => {
    switch (workerProfile?.verification_status) {
      case 'verified':
        return theme.colors.success;
      case 'rejected':
        return theme.colors.danger;
      default:
        return '#60A5FA';
    }
  };

  const verificationLabel = () => {
    switch (workerProfile?.verification_status) {
      case 'verified':
        return 'Верифицирован';
      case 'rejected':
        return 'Отклонён';
      default:
        return 'На проверке';
    }
  };

  const isSuspended =
    workerProfile?.suspended_until && new Date(workerProfile.suspended_until) > new Date();

  const suspendedUntil = isSuspended
    ? new Date(workerProfile!.suspended_until!).toLocaleDateString('ru-RU')
    : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!workerProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="person-circle-outline" size={72} color={theme.colors.textMuted} />
          <Text style={styles.noProfileTitle}>Создайте профиль</Text>
          <Text style={styles.noProfileText}>
            Пройдите верификацию, чтобы откликаться на вакансии
          </Text>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() =>
              navigation
                .getParent<NativeStackNavigationProp<RootStackParamList>>()
                ?.navigate('WorkerOnboarding')
            }
          >
            <Text style={styles.startBtnText}>Начать верификацию</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
            <Text style={styles.signOutText}>Выйти</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{workerProfile.full_name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{workerProfile.full_name}</Text>
            {profile?.role && <Text style={styles.role}>Соискатель</Text>}
          </View>
          <View
            style={[
              styles.verBadge,
              {
                borderColor: verificationColor() + '40',
                backgroundColor: verificationColor() + '15',
              },
            ]}
          >
            {workerProfile.verification_status === 'verified' ? (
              <Ionicons name="checkmark" size={13} color={verificationColor()} />
            ) : workerProfile.verification_status === 'rejected' ? (
              <Ionicons name="close" size={13} color={verificationColor()} />
            ) : (
              <Ionicons name="pause-circle" size={13} color={verificationColor()} />
            )}
            <Text style={[styles.verBadgeText, { color: verificationColor() }]}>
              {verificationLabel()}
            </Text>
          </View>
        </View>

        {/* Suspension warning */}
        {workerProfile.is_banned && (
          <View style={[styles.alertBox, { borderLeftColor: theme.colors.danger }]}>
            <View style={styles.alertTitleRow}>
              <Ionicons name="ban" size={16} color={theme.colors.danger} />
              <Text style={styles.alertTitle}>Аккаунт заблокирован</Text>
            </View>
            <Text style={styles.alertText}>Свяжитесь с поддержкой для разблокировки.</Text>
          </View>
        )}
        {!workerProfile.is_banned && isSuspended && (
          <View style={[styles.alertBox, { borderLeftColor: '#60A5FA' }]}>
            <View style={styles.alertTitleRow}>
              <Ionicons name="pause-circle" size={16} color="#60A5FA" />
              <Text style={styles.alertTitle}>Временная приостановка</Text>
            </View>
            <Text style={styles.alertText}>Доступ восстановится {suspendedUntil}.</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {workerProfile.rating > 0 ? workerProfile.rating.toFixed(1) : '—'}
            </Text>
            <Text style={styles.statLabel}>Рейтинг</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{workerProfile.completed_shifts}</Text>
            <Text style={styles.statLabel}>Смены</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, workerProfile.no_show_count > 0 && styles.statDanger]}>
              {workerProfile.no_show_count}
            </Text>
            <Text style={styles.statLabel}>Неявки</Text>
          </View>
        </View>

        {/* No-show warnings */}
        {workerProfile.no_show_count === 1 && (
          <View style={[styles.alertBox, { borderLeftColor: '#60A5FA' }]}>
            <Text style={styles.alertText}>
              У вас 1 неявка. При 2 неявках аккаунт будет приостановлен на 7 дней.
            </Text>
          </View>
        )}

        {/* Applications */}
        <Text style={styles.sectionTitle}>Мои заявки</Text>
        {loadingApps ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
        ) : applications.length === 0 ? (
          <View style={styles.emptyApps}>
            <Ionicons name="list" size={36} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>Ещё нет заявок</Text>
            <Text style={styles.emptySubtext}>Откликнитесь на вакансии на главном экране</Text>
          </View>
        ) : (
          applications.map((app) => (
            <View key={app.id} style={styles.appCard}>
              <View style={styles.appTop}>
                <Text style={styles.appJobTitle} numberOfLines={1}>
                  {(app.job as any)?.title ?? 'Вакансия'}
                </Text>
                <View
                  style={[
                    styles.appStatusBadge,
                    { backgroundColor: STATUS_COLORS[app.status] + '20' },
                  ]}
                >
                  <Text style={[styles.appStatusText, { color: STATUS_COLORS[app.status] }]}>
                    {STATUS_LABELS[app.status] ?? app.status}
                  </Text>
                </View>
              </View>
              {app.rating && (
                <View style={styles.appRatingRow}>
                  <Ionicons name="star" size={14} color={theme.colors.primary} />
                  <Text style={styles.appRating}>Оценка работодателя: {app.rating}/5</Text>
                </View>
              )}
              <Text style={styles.appDate}>
                {new Date(app.applied_at).toLocaleDateString('ru-RU')}
              </Text>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Text style={styles.signOutText}>Выйти</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: theme.spacing.md, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    flexWrap: 'wrap',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#000' },
  profileInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  role: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  verBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  verBadgeText: { fontSize: 12, fontWeight: '700' },
  alertBox: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.md,
    borderLeftWidth: 3,
    marginBottom: theme.spacing.md,
  },
  alertTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  alertTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  alertText: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: 4,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
  statDanger: { color: theme.colors.danger },
  statLabel: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '600' },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyApps: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  emptySubtext: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center' },
  appCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: 4,
  },
  appTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appJobTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: theme.colors.text },
  appStatusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  appStatusText: { fontSize: 12, fontWeight: '700' },
  appRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  appRating: { fontSize: 13, color: theme.colors.textSecondary },
  appDate: { fontSize: 12, color: theme.colors.textMuted },
  noProfileTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noProfileText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  startBtnText: { fontSize: 15, fontWeight: '800', color: '#000' },
  signOutBtn: { paddingVertical: 16, alignItems: 'center', marginTop: theme.spacing.lg },
  signOutText: { fontSize: 14, color: theme.colors.textMuted, fontWeight: '600' },
});
