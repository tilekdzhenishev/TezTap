import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { LockKeyhole, RefreshCw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { JobCard } from '../components/JobCard';
import { useStore } from '../store/appStore';
import { useAuth } from '../auth/AuthContext';
import { applyToJob, fetchMyApplications } from '../supabase/client';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../utils/theme';

export const JobFeedScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    activeJobs,
    currentJobIndex,
    loading,
    skipJob,
    saveJob,
    isJobSaved,
    loadActiveJobs,
    init,
  } = useStore();
  const { user, profile, workerProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [checkingSaved, setCheckingSaved] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  const isWorker = profile?.role === 'user';

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (isWorker && user) {
      fetchMyApplications(user.id).then((apps) => {
        setAppliedJobIds(new Set(apps.map((a) => a.job_id)));
      });
    }
  }, [isWorker, user]);

  useEffect(() => {
    setSaved(false);
    setCheckingSaved(true);
    if (activeJobs.length > 0 && currentJobIndex < activeJobs.length) {
      isJobSaved(activeJobs[currentJobIndex].id).then((s) => {
        setSaved(s);
        setCheckingSaved(false);
      });
    } else {
      setCheckingSaved(false);
    }
  }, [currentJobIndex, activeJobs]);

  const handleRefresh = async () => {
    await loadActiveJobs();
  };

  const handleSave = async () => {
    if (currentJobIndex < activeJobs.length) {
      const result = await saveJob(activeJobs[currentJobIndex]);
      if (result) setSaved(true);
    }
  };

  const handleApply = async () => {
    if (!user || currentJobIndex >= activeJobs.length) return;

    if (!workerProfile) {
      navigation
        .getParent<NativeStackNavigationProp<RootStackParamList>>()
        ?.navigate('WorkerOnboarding');
      return;
    }

    if (workerProfile.is_banned) {
      Alert.alert('Аккаунт заблокирован', 'Вы не можете откликаться на вакансии.');
      return;
    }
    if (workerProfile.suspended_until && new Date(workerProfile.suspended_until) > new Date()) {
      const date = new Date(workerProfile.suspended_until).toLocaleDateString('ru-RU');
      Alert.alert('Аккаунт приостановлен', `Доступ восстановится ${date}.`);
      return;
    }

    const jobId = activeJobs[currentJobIndex].id;
    const result = await applyToJob(jobId, user.id);
    if (result) {
      setAppliedJobIds((prev) => new Set([...prev, jobId]));
    }
  };

  const handleContact = () => {
    if (currentJobIndex < activeJobs.length) {
      let url = activeJobs[currentJobIndex].contact_url.trim();
      if (url.startsWith('@')) url = `https://t.me/${url.slice(1)}`;
      if (!url.startsWith('http')) url = `https://${url}`;
      Linking.openURL(url);
    }
  };

  if (loading && activeJobs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Загрузка подработок...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (activeJobs.length === 0 || currentJobIndex >= activeJobs.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>TezTap</Text>
          <View style={styles.headerRight} />
          <TouchableOpacity
            onPress={() =>
              navigation
                .getParent<NativeStackNavigationProp<RootStackParamList>>()
                ?.navigate('AdminAuth')
            }
            style={styles.adminButton}
          >
            <LockKeyhole size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Пока всё</Text>
          <Text style={styles.emptyText}>Новые подработки скоро появятся.</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <RefreshCw size={17} color="#000000" style={styles.buttonIcon} />
            <Text style={styles.refreshButtonText}>Обновить</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentJob = activeJobs[currentJobIndex];
  const progress = activeJobs.length > 1 ? ((currentJobIndex + 1) / activeJobs.length) * 100 : 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TezTap</Text>
        <Text style={styles.headerCounter}>
          {currentJobIndex + 1} / {activeJobs.length}
        </Text>
        <TouchableOpacity
          onPress={() =>
            navigation
              .getParent<NativeStackNavigationProp<RootStackParamList>>()
              ?.navigate('AdminAuth')
          }
          style={styles.adminButton}
        >
          <LockKeyhole size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.cardContainer}>
        {!checkingSaved && (
          <JobCard
            job={currentJob}
            isSaved={saved}
            onSkip={skipJob}
            onSave={handleSave}
            onContact={handleContact}
            onApply={isWorker ? handleApply : undefined}
            hasApplied={appliedJobIds.has(currentJob.id)}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
  },
  headerCounter: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  headerRight: {
    flex: 1,
  },
  adminButton: {
    padding: 8,
  },
  progressBar: {
    height: 3,
    backgroundColor: theme.colors.cardBorder,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
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
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: theme.spacing.xs,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
