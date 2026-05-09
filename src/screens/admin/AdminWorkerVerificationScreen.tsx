import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchPendingWorkers,
  verifyWorker,
  rejectWorkerProfile,
  getWorkerDocSignedUrl,
} from '../../supabase/client';
import { AdminEmptyState } from '../../components/admin/AdminEmptyState';
import { WorkerProfile } from '../../types';
import { theme } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';

type WorkerWithSignedUrls = WorkerProfile & {
  passportSignedUrl?: string | null;
  selfieSignedUrl?: string | null;
};

export const AdminWorkerVerificationScreen: React.FC = () => {
  const [workers, setWorkers] = useState<WorkerWithSignedUrls[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchPendingWorkers();
    const withUrls = await Promise.all(
      data.map(async (w) => ({
        ...w,
        passportSignedUrl: w.passport_front_url
          ? await getWorkerDocSignedUrl(w.passport_front_url)
          : null,
        selfieSignedUrl: w.selfie_url ? await getWorkerDocSignedUrl(w.selfie_url) : null,
      }))
    );
    setWorkers(withUrls);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleVerify = async (worker: WorkerProfile) => {
    Alert.alert('Верифицировать', `Подтвердить личность ${worker.full_name}?`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Верифицировать',
        onPress: async () => {
          setActing(worker.id);
          await verifyWorker(worker.id);
          setActing(null);
          load();
        },
      },
    ]);
  };

  const handleReject = async (worker: WorkerProfile) => {
    Alert.alert('Отклонить', `Отклонить верификацию ${worker.full_name}?`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Отклонить',
        style: 'destructive',
        onPress: async () => {
          setActing(worker.id);
          await rejectWorkerProfile(worker.id);
          setActing(null);
          load();
        },
      },
    ]);
  };

  const renderWorker = ({ item }: { item: WorkerWithSignedUrls }) => {
    const isActing = acting === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.full_name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.full_name}</Text>
            {item.birth_year && <Text style={styles.detail}>Год рождения: {item.birth_year}</Text>}
            {item.phone && <Text style={styles.detail}>Телефон: {item.phone}</Text>}
            <Text style={styles.detail}>
              Зарегистрирован: {new Date(item.created_at).toLocaleDateString('ru-RU')}
            </Text>
          </View>
        </View>

        {/* Document photos — using signed URLs from private bucket */}
        <View style={styles.docsRow}>
          <View style={styles.docBlock}>
            <View style={styles.docLabelRow}>
              <Ionicons name="id-card" size={15} color={theme.colors.textSecondary} />
              <Text style={styles.docLabel}>Паспорт</Text>
            </View>
            {item.passportSignedUrl ? (
              <Image source={{ uri: item.passportSignedUrl }} style={styles.docImage} />
            ) : (
              <View style={styles.docMissing}>
                <Text style={styles.docMissingText}>Не загружен</Text>
              </View>
            )}
          </View>
          <View style={styles.docBlock}>
            <View style={styles.docLabelRow}>
              <Ionicons name="camera" size={15} color={theme.colors.textSecondary} />
              <Text style={styles.docLabel}>Селфи</Text>
            </View>
            {item.selfieSignedUrl ? (
              <Image source={{ uri: item.selfieSignedUrl }} style={styles.docImage} />
            ) : (
              <View style={styles.docMissing}>
                <Text style={styles.docMissingText}>Не загружено</Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        {isActing ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 12 }} />
        ) : (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.verifyBtn]}
              onPress={() => handleVerify(item)}
            >
              <Ionicons name="checkmark" size={16} color="#000000" />
              <Text style={styles.verifyBtnText}>Верифицировать</Text>
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
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.admin} />
        </View>
      ) : workers.length === 0 ? (
        <AdminEmptyState
          icon="shield-checkmark"
          title="Все проверено"
          description="Нет ожидающих верификации работников"
          actionLabel="Обновить"
          onAction={load}
        />
      ) : (
        <FlatList
          data={workers}
          keyExtractor={(item) => item.id}
          renderItem={renderWorker}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 24 },
  list: { padding: theme.spacing.md, gap: theme.spacing.md },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#000' },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 17, fontWeight: '800', color: theme.colors.text },
  detail: { fontSize: 13, color: theme.colors.textSecondary },
  docsRow: { flexDirection: 'row', gap: 12 },
  docBlock: { flex: 1, gap: 6 },
  docLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  docLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary },
  docImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    resizeMode: 'cover',
  },
  docMissing: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docMissingText: { fontSize: 13, color: theme.colors.textMuted },
  actions: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  verifyBtn: { backgroundColor: theme.colors.success },
  verifyBtnText: { fontSize: 15, fontWeight: '700', color: '#000000' },
  rejectBtn: { borderWidth: 1, borderColor: theme.colors.danger },
  rejectBtnText: { fontSize: 15, fontWeight: '700', color: theme.colors.danger },
});
