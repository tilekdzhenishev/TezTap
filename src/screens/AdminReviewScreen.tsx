import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { AdminJobCard } from '../components/AdminJobCard';
import { AdminEmptyState } from '../components/admin/AdminEmptyState';
import { AdminFeedbackOverlay } from '../components/admin/AdminFeedbackOverlay';
import { useStore } from '../store/appStore';
import { theme } from '../utils/theme';

export const AdminReviewScreen: React.FC = () => {
  const { pendingJobs, loading, loadPendingJobs, approveJob, rejectJob } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadPendingJobs();
  }, []);

  const advance = () => {
    setTimeout(() => {
      setActionFeedback(null);
      setCurrentIndex((prev) => Math.min(prev, pendingJobs.length - 2));
    }, 1000);
  };

  const handleApprove = async () => {
    const job = pendingJobs[currentIndex];
    if (!job) return;

    const success = await approveJob(job.id);
    if (success) {
      setActionFeedback('Опубликовано');
      advance();
    }
  };

  const handleReject = async () => {
    const job = pendingJobs[currentIndex];
    if (!job) return;

    await rejectJob(job.id);
    setActionFeedback('Отклонено');
    advance();
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

  if (pendingJobs.length === 0 || currentIndex >= pendingJobs.length) {
    return (
      <SafeAreaView style={styles.container}>
        <AdminEmptyState
          icon="briefcase"
          title="Нет подработок"
          description="Все вакансии обработаны"
          actionLabel="Обновить"
          onAction={loadPendingJobs}
        />
      </SafeAreaView>
    );
  }

  const currentJob = pendingJobs[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <AdminFeedbackOverlay
        visible={Boolean(actionFeedback)}
        tone={actionFeedback === 'Опубликовано' ? 'success' : 'danger'}
        text={actionFeedback ?? ''}
      />

      <View style={styles.cardContainer}>
        <AdminJobCard job={currentJob} onApprove={handleApprove} onReject={handleReject} />
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
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
