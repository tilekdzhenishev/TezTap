import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { BriefcaseBusiness, Check, HardHat, LockKeyhole, RefreshCw, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminJobCard } from '../components/AdminJobCard';
import { useStore } from '../store/appStore';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../utils/theme';

export const AdminReviewScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { pendingJobs, loading, loadPendingJobs, approveJob, rejectJob } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadPendingJobs();
  }, []);

  const handleApprove = async () => {
    if (currentIndex < pendingJobs.length) {
      const jobId = pendingJobs[currentIndex].id;
      const success = await approveJob(jobId);
      if (success) {
        setActionFeedback('Опубликовано');
        setTimeout(() => {
          setActionFeedback(null);
          setCurrentIndex((prev) => Math.min(prev, pendingJobs.length - 2));
        }, 1000);
      }
    }
  };

  const handleReject = async () => {
    if (currentIndex < pendingJobs.length) {
      const jobId = pendingJobs[currentIndex].id;
      await rejectJob(jobId);
      setActionFeedback('Отклонено');
      setTimeout(() => {
        setActionFeedback(null);
        setCurrentIndex((prev) => Math.min(prev, pendingJobs.length - 2));
      }, 1000);
    }
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
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <LockKeyhole size={19} color={theme.colors.admin} style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Вакансии</Text>
          </View>
          <Text style={styles.headerCounter}>0 ожидает</Text>
          <TouchableOpacity
            style={styles.employersButton}
            onPress={() => navigation.navigate('AdminEmployerReview')}
          >
            <BriefcaseBusiness size={15} color={theme.colors.admin} style={styles.buttonIcon} />
            <Text style={styles.employersButtonText}>Работодатели</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.employersButton}
            onPress={() => navigation.navigate('AdminWorkerVerification')}
          >
            <HardHat size={15} color={theme.colors.admin} style={styles.buttonIcon} />
            <Text style={styles.employersButtonText}>Работники</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Нет подработок для проверки</Text>
          <Text style={styles.emptyText}>Все подработки обработаны</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadPendingJobs}>
            <RefreshCw size={17} color="#000000" style={styles.buttonIcon} />
            <Text style={styles.refreshButtonText}>Обновить</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentJob = pendingJobs[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <LockKeyhole size={19} color={theme.colors.admin} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Вакансии</Text>
        </View>
        <Text style={styles.headerCounter}>{pendingJobs.length - currentIndex} ожидает</Text>
        <TouchableOpacity
          style={styles.employersButton}
          onPress={() => navigation.navigate('AdminEmployerReview')}
        >
          <BriefcaseBusiness size={15} color={theme.colors.admin} style={styles.buttonIcon} />
          <Text style={styles.employersButtonText}>Работодатели</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.employersButton}
          onPress={() => navigation.navigate('AdminWorkerVerification')}
        >
          <HardHat size={15} color={theme.colors.admin} style={styles.buttonIcon} />
          <Text style={styles.employersButtonText}>Работники</Text>
        </TouchableOpacity>
      </View>

      {actionFeedback && (
        <View style={styles.feedbackOverlay}>
          {actionFeedback === 'Опубликовано' ? (
            <Check size={34} color={theme.colors.success} style={styles.feedbackIcon} />
          ) : (
            <X size={34} color={theme.colors.danger} style={styles.feedbackIcon} />
          )}
          <Text style={styles.feedbackText}>{actionFeedback}</Text>
        </View>
      )}

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
    color: theme.colors.admin,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: theme.spacing.xs,
  },
  headerCounter: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  employersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.admin + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  buttonIcon: {
    marginRight: theme.spacing.xs,
  },
  employersButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.admin,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.admin,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
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
  feedbackIcon: {
    marginBottom: theme.spacing.sm,
  },
});
