import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRoute, RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import {
  fetchJobApplications,
  updateApplicationStatus,
  closeJob,
  reportNoShow,
  rateWorker,
} from '../../supabase/client';
import { JobApplication } from '../../types';
import { theme } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';

type Route = RouteProp<RootStackParamList, 'EmployerApplications'>;

const STATUS_LABELS: Record<string, string> = {
  applied: 'Ожидает',
  accepted: 'Принят',
  completed: 'Выполнен',
  no_show: 'Неявка',
  cancelled: 'Отменён',
  rejected: 'Отклонён',
};

export const EmployerApplicationsScreen: React.FC = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { jobId, jobTitle } = route.params;

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState<{ appId: string; workerId: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const apps = await fetchJobApplications(jobId);
    setApplications(apps);
    setLoading(false);
  }, [jobId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleAccept = async (app: JobApplication) => {
    const ok = await updateApplicationStatus(app.id, 'accepted');
    if (ok) {
      await closeJob(app.job_id);
      load();
    }
  };

  const handleReject = (app: JobApplication) => {
    Alert.alert('Отклонить заявку', 'Вы уверены, что хотите отклонить этого кандидата?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Отклонить',
        style: 'destructive',
        onPress: async () => {
          await updateApplicationStatus(app.id, 'rejected');
          load();
        },
      },
    ]);
  };

  const handleNoShow = (app: JobApplication) => {
    Alert.alert('Сообщить о неявке', 'Работник не вышел на смену? Это повлияет на его рейтинг.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Подтвердить неявку',
        style: 'destructive',
        onPress: async () => {
          await reportNoShow(app.id, app.worker_id);
          load();
        },
      },
    ]);
  };

  const handleRate = (app: JobApplication) => {
    setRatingModal({ appId: app.id, workerId: app.worker_id });
  };

  const submitRating = async (stars: number) => {
    if (!ratingModal) return;
    await rateWorker(ratingModal.appId, ratingModal.workerId, stars);
    setRatingModal(null);
    load();
  };

  const wp = (app: JobApplication) => app.worker_profile as any;

  const renderApp = ({ item }: { item: JobApplication }) => {
    const workerName = wp(item)?.full_name ?? 'Соискатель';
    const rating = wp(item)?.rating ?? 0;
    const completed = wp(item)?.completed_shifts ?? 0;
    const verStatus = wp(item)?.verification_status ?? 'pending';

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{workerName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>{workerName}</Text>
            <View style={styles.workerMeta}>
              {rating > 0 && <Text style={styles.metaTag}>{rating.toFixed(1)}</Text>}
              <Text style={styles.metaTag}>{completed} смен</Text>
              {verStatus === 'verified' && (
                <View style={styles.verifiedTag}>
                  <Ionicons name="checkmark" size={12} color={theme.colors.success} />
                  <Text style={styles.verified}>Верифицирован</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{STATUS_LABELS[item.status] ?? item.status}</Text>
          </View>
        </View>

        <Text style={styles.appliedDate}>
          Заявка: {new Date(item.applied_at).toLocaleDateString('ru-RU')}
        </Text>

        {item.status === 'applied' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.acceptBtn]}
              onPress={() => handleAccept(item)}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.acceptBtnText}>Принять</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.rejectBtn]}
              onPress={() => handleReject(item)}
            >
              <Ionicons name="close" size={16} color={theme.colors.danger} />
              <Text style={styles.rejectBtnText}>Отклонить</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'accepted' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.acceptBtn]}
              onPress={() => handleRate(item)}
            >
              <Text style={styles.acceptBtnText}>Оценить</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.noShowBtn]}
              onPress={() => handleNoShow(item)}
            >
              <Text style={styles.noShowBtnText}>Неявка</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backRow}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.back}>Назад</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {jobTitle}
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : applications.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people" size={48} color={theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>Нет заявок</Text>
          <Text style={styles.emptyText}>Соискатели ещё не откликнулись на эту вакансию</Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          renderItem={renderApp}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Rating modal */}
      <Modal visible={!!ratingModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Оценить работника</Text>
            <Text style={styles.modalSubtitle}>Выберите оценку от 1 до 5 звёзд</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => submitRating(s)}>
                  <Ionicons name="star" size={36} color={theme.colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setRatingModal(null)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  back: { fontSize: 15, color: theme.colors.textSecondary, fontWeight: '600' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: theme.colors.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  emptyText: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center' },
  list: { padding: theme.spacing.md, gap: theme.spacing.sm },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#000' },
  workerInfo: { flex: 1 },
  workerName: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  workerMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  metaTag: {
    fontSize: 12,
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedTag: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verified: { color: theme.colors.success, fontSize: 12, fontWeight: '700' },
  statusBadge: {
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary },
  appliedDate: { fontSize: 12, color: theme.colors.textMuted },
  actions: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  acceptBtn: { backgroundColor: theme.colors.success },
  acceptBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  rejectBtn: { borderWidth: 1, borderColor: theme.colors.danger },
  rejectBtnText: { fontSize: 14, fontWeight: '700', color: theme.colors.danger },
  noShowBtn: { borderWidth: 1, borderColor: '#60A5FA' },
  noShowBtnText: { fontSize: 14, fontWeight: '700', color: '#60A5FA' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  modalSubtitle: { fontSize: 14, color: theme.colors.textSecondary },
  starsRow: { flexDirection: 'row', gap: 8 },
  modalCancel: { marginTop: 8 },
  modalCancelText: { fontSize: 15, color: theme.colors.textMuted },
});
