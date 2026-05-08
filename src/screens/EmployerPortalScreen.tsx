import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Ban,
  BriefcaseBusiness,
  Check,
  ClipboardList,
  RefreshCw,
  ShieldCheck,
  Users,
  X,
  Hourglass,
  Plus,
  ArrowRight,
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { fetchEmployerByUserId, fetchEmployerJobs } from '../supabase/client';
import { Employer, Job } from '../types';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../utils/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type PortalState = 'loading' | 'not_employer' | 'pending' | 'approved' | 'rejected' | 'suspended';

export const EmployerPortalScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user, profile, signOut } = useAuth();

  const [state, setState] = useState<PortalState>('loading');
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [myJobs, setMyJobs] = useState<Job[]>([]);

  const load = useCallback(async () => {
    if (!user) {
      setState('not_employer');
      return;
    }
    if (profile && profile.role !== 'employer') {
      setState('not_employer');
      return;
    }
    setState('loading');
    const emp = await fetchEmployerByUserId(user.id);
    if (!emp) {
      setState('not_employer');
      return;
    }
    setEmployer(emp);
    setState(emp.verification_status);
    if (emp.verification_status === 'approved') {
      const jobs = await fetchEmployerJobs(emp.id);
      setMyJobs(jobs);
    }
  }, [user, profile]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (state === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (state === 'not_employer') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.center}>
          <BriefcaseBusiness size={52} color={theme.colors.primary} />
          <Text style={styles.statusTitle}>Для работодателей</Text>
          <Text style={styles.statusDesc}>
            Этот раздел предназначен для верифицированных работодателей.
            {'\n\n'}
            Войдите в аккаунт работодателя, чтобы управлять вакансиями.
          </Text>
          <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
            <Text style={styles.signOutText}>Сменить аккаунт</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (state === 'pending') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Hourglass size={52} color={theme.colors.primary} />
          <Text style={styles.statusTitle}>Заявка на рассмотрении</Text>
          <Text style={styles.statusName}>{employer?.business_name}</Text>
          <Text style={styles.statusDesc}>
            Мы проверяем данные вашей компании. Обычно 1–2 рабочих дня.
          </Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={load}>
            <RefreshCw size={17} color={theme.colors.textSecondary} style={styles.buttonIcon} />
            <Text style={styles.refreshBtnText}>Проверить статус</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
            <Text style={styles.signOutText}>Выйти</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (state === 'approved') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.approvedContent}>
          <View style={styles.approvedHeader}>
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={13} color={theme.colors.success} style={styles.badgeIcon} />
              <Text style={styles.verifiedBadgeText}>ВЕРИФИЦИРОВАН</Text>
            </View>
            <Text style={styles.companyName}>{employer?.business_name}</Text>
            <Text style={styles.companyType}>{employer?.business_type}</Text>
          </View>

          <TouchableOpacity
            style={styles.postButton}
            onPress={() => {
              if (!employer) return;
              navigation
                .getParent<NativeStackNavigationProp<RootStackParamList>>()
                ?.navigate('SubmitJob', { employerId: employer.id });
            }}
          >
            <Plus size={32} color="#000000" style={styles.postButtonIcon} />
            <View>
              <Text style={styles.postButtonTitle}>Разместить смену</Text>
              <Text style={styles.postButtonSubtitle}>Найдите сотрудника сегодня</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Как это работает</Text>
            {[
              {
                Icon: ClipboardList,
                title: 'Опишите смену',
                sub: 'Укажите задачу, оплату и время',
              },
              { Icon: Check, title: 'Модерация', sub: 'Мы проверим объявление за 1–2 часа' },
              { Icon: Users, title: 'Получите отклики', sub: 'Соискатели напишут напрямую вам' },
            ].map(({ Icon, title, sub }) => (
              <View key={title} style={styles.infoRow}>
                <Icon size={20} color={theme.colors.primary} style={styles.infoRowIcon} />
                <View style={styles.infoRowText}>
                  <Text style={styles.infoRowTitle}>{title}</Text>
                  <Text style={styles.infoRowSub}>{sub}</Text>
                </View>
              </View>
            ))}
          </View>

          {myJobs.length > 0 && (
            <View style={styles.myJobsCard}>
              <Text style={styles.myJobsTitle}>Мои вакансии</Text>
              {myJobs.map((job) => (
                <TouchableOpacity
                  key={job.id}
                  style={styles.jobRow}
                  onPress={() =>
                    navigation
                      .getParent<NativeStackNavigationProp<RootStackParamList>>()
                      ?.navigate('EmployerApplications', { jobId: job.id, jobTitle: job.title })
                  }
                >
                  <View style={styles.jobRowLeft}>
                    <Text style={styles.jobRowTitle} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <View style={styles.jobStatusRow}>
                      {job.status === 'approved' ? (
                        <Check
                          size={13}
                          color={theme.colors.success}
                          style={styles.statusSmallIcon}
                        />
                      ) : job.status === 'pending' ? (
                        <Hourglass
                          size={13}
                          color={theme.colors.admin}
                          style={styles.statusSmallIcon}
                        />
                      ) : (
                        <X size={13} color={theme.colors.danger} style={styles.statusSmallIcon} />
                      )}
                      <Text style={styles.jobRowStatus}>
                        {job.status === 'approved'
                          ? 'Активна'
                          : job.status === 'pending'
                            ? 'На проверке'
                            : 'Отклонена'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.jobRowArrow}>
                    <Users size={14} color={theme.colors.primary} style={styles.buttonIcon} />
                    <Text style={styles.jobRowArrowText}>Заявки</Text>
                    <ArrowRight size={14} color={theme.colors.primary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
            <Text style={styles.signOutText}>Выйти</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (state === 'rejected') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <X size={52} color={theme.colors.danger} />
          <Text style={styles.statusTitle}>Заявка отклонена</Text>
          <Text style={styles.statusName}>{employer?.business_name}</Text>
          {employer?.review_notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{employer.review_notes}</Text>
            </View>
          ) : null}
          <Text style={styles.statusDesc}>Свяжитесь с поддержкой для уточнения деталей.</Text>
          <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
            <Text style={styles.signOutText}>Выйти</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Ban size={52} color={theme.colors.danger} />
        <Text style={styles.statusTitle}>Аккаунт приостановлен</Text>
        <Text style={styles.statusName}>{employer?.business_name}</Text>
        <Text style={styles.statusDesc}>Свяжитесь с поддержкой для восстановления доступа.</Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Text style={styles.signOutText}>Выйти</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: theme.spacing.md,
  },
  statusTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.text, textAlign: 'center' },
  statusName: { fontSize: 17, fontWeight: '700', color: theme.colors.primary, textAlign: 'center' },
  statusDesc: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  refreshBtnText: { fontSize: 15, fontWeight: '600', color: theme.colors.textSecondary },
  buttonIcon: { marginRight: theme.spacing.xs },
  signOutBtn: { paddingVertical: 12 },
  signOutText: { fontSize: 14, color: theme.colors.textMuted, fontWeight: '600' },
  notesBox: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.danger,
    width: '100%',
  },
  notesText: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20 },
  approvedContent: { padding: theme.spacing.md, gap: theme.spacing.md },
  approvedHeader: { paddingTop: theme.spacing.lg, gap: 4 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.success + '20',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: theme.colors.success + '40',
    marginBottom: 8,
  },
  badgeIcon: { marginRight: theme.spacing.xs },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.success,
    letterSpacing: 1,
  },
  companyName: { fontSize: 26, fontWeight: '800', color: theme.colors.text },
  companyType: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '500' },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    marginTop: theme.spacing.sm,
  },
  postButtonIcon: { marginRight: 0 },
  postButtonTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
  postButtonSubtitle: { fontSize: 13, color: '#00000070', fontWeight: '500', marginTop: 2 },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: theme.spacing.md,
  },
  infoTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  myJobsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: theme.spacing.sm,
  },
  myJobsTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
  },
  jobRowLeft: { flex: 1 },
  jobRowTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  jobStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusSmallIcon: { marginRight: 4 },
  jobRowStatus: { fontSize: 12, color: theme.colors.textMuted },
  jobRowArrow: { flexDirection: 'row', alignItems: 'center' },
  jobRowArrowText: { fontSize: 13, color: theme.colors.primary, fontWeight: '600', marginRight: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  infoRowIcon: { width: 28 },
  infoRowText: { flex: 1, gap: 2 },
  infoRowTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  infoRowSub: { fontSize: 13, color: theme.colors.textSecondary },
});
