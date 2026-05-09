import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '../types';
import { theme } from '../utils/theme';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onSkip: () => void;
  onSave: () => void;
  onContact: () => void;
  onApply?: () => void;
  hasApplied?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved = false,
  onSkip,
  onSave,
  onContact,
  onApply,
  hasApplied = false,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{job.title}</Text>
        <TouchableOpacity
          style={[styles.saveIconButton, isSaved && styles.savedIconButton]}
          onPress={onSave}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Удалить из сохраненных' : 'Сохранить вакансию'}
        >
          <Ionicons
            name={isSaved ? 'star' : 'star-outline'}
            size={18}
            color={isSaved ? '#000000' : theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons
            name="cash"
            size={16}
            color={theme.colors.textSecondary}
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>{job.payment}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="timer"
            size={16}
            color={theme.colors.textSecondary}
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>{job.duration}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="time"
            size={16}
            color={theme.colors.textSecondary}
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>{job.schedule}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="location"
            size={16}
            color={theme.colors.textSecondary}
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>{job.location}</Text>
        </View>
      </View>

      <Text style={styles.description}>{job.description}</Text>

      {job.experience && <Text style={styles.experience}>{job.experience}</Text>}

      <View style={styles.divider} />

      {job.company_name && (
        <View style={styles.companyBlock}>
          <View style={styles.inlineRow}>
            <Ionicons
              name="shield-checkmark"
              size={15}
              color={theme.colors.success}
              style={styles.inlineIcon}
            />
            <Text style={styles.verifiedBadge}>Проверенный работодатель</Text>
          </View>
          <View style={styles.inlineRow}>
            <Ionicons
              name="briefcase"
              size={16}
              color={theme.colors.text}
              style={styles.inlineIcon}
            />
            <Text style={styles.companyName}>{job.company_name}</Text>
          </View>
        </View>
      )}

      {onApply && (
        <View style={[styles.applyPanel, hasApplied && styles.applyPanelDone]}>
          <View style={styles.applyCopy}>
            <View style={styles.applyTitleRow}>
              <Ionicons
                name={hasApplied ? 'checkmark-circle' : 'person-add'}
                size={18}
                color={hasApplied ? theme.colors.success : theme.colors.primary}
              />
              <Text style={styles.applyTitle}>Отклик на смену</Text>
            </View>
            <Text style={styles.applyHint}>
              {hasApplied
                ? 'Работодатель увидит вашу заявку в списке кандидатов.'
                : 'Нажмите, чтобы работодатель понял, что вы готовы выйти.'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.applyButton, hasApplied && styles.applyButtonDone]}
            onPress={onApply}
            disabled={hasApplied}
            accessibilityRole="button"
            accessibilityLabel={hasApplied ? 'Вы уже откликнулись' : 'Откликнуться на смену'}
          >
            <Text style={[styles.applyButtonText, hasApplied && styles.applyButtonTextDone]}>
              {hasApplied ? 'Вы откликнулись' : 'Откликнуться'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.skipButton]} onPress={onSkip}>
          <Ionicons
            name="close"
            size={18}
            color={theme.colors.textSecondary}
            style={styles.buttonIcon}
          />
          <Text style={styles.skipButtonText}>Пропустить</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.contactButton]} onPress={onContact}>
          <Ionicons name="call" size={18} color="#000000" style={styles.buttonIcon} />
          <Text style={styles.contactButtonText}>Связаться</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  saveIconButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  savedIconButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  details: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  detailIcon: {
    marginRight: theme.spacing.sm,
  },
  detailText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.sm,
  },
  experience: {
    fontSize: 14,
    color: theme.colors.primaryLight,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.cardBorder,
    marginVertical: theme.spacing.md,
  },
  companyBlock: {
    marginBottom: theme.spacing.lg,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  inlineIcon: {
    marginRight: theme.spacing.xs,
  },
  verifiedBadge: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  companyName: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  },
  applyPanel: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary + '55',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  applyPanelDone: {
    borderColor: theme.colors.success + '55',
    backgroundColor: theme.colors.success + '12',
  },
  applyCopy: {
    gap: theme.spacing.xs,
  },
  applyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  applyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
  },
  applyHint: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  applyButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonDone: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  applyButtonText: { fontSize: 16, fontWeight: '800', color: '#000000' },
  applyButtonTextDone: { color: theme.colors.success },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: theme.spacing.xs,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  contactButton: {
    backgroundColor: theme.colors.primary,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
