import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '../types';
import { theme } from '../utils/theme';

interface AdminJobCardProps {
  job: Job;
  onApprove: () => void;
  onReject: () => void;
}

export const AdminJobCard: React.FC<AdminJobCardProps> = ({ job, onApprove, onReject }) => {
  const handleContact = () => {
    let url = job.contact_url.trim();
    if (url.startsWith('@')) url = `https://t.me/${url.slice(1)}`;
    if (!url.startsWith('http')) url = `https://${url}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.card}>
      <View style={styles.statusBadge}>
        <Ionicons name="hourglass" size={14} color={theme.colors.admin} style={styles.badgeIcon} />
        <Text style={styles.statusText}>Ожидает проверки</Text>
      </View>

      <Text style={styles.title}>{job.title}</Text>

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

      {job.company_name && (
        <View style={styles.inlineRow}>
          <Ionicons
            name="briefcase"
            size={16}
            color={theme.colors.text}
            style={styles.inlineIcon}
          />
          <Text style={styles.companyName}>{job.company_name}</Text>
        </View>
      )}

      <View style={styles.inlineRow}>
        <Ionicons name="call" size={15} color={theme.colors.textMuted} style={styles.inlineIcon} />
        <Text style={styles.contactLabel}>Контакт: {job.contact_url}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={onReject}>
          <Ionicons name="close" size={18} color={theme.colors.danger} style={styles.buttonIcon} />
          <Text style={styles.rejectButtonText}>Отклонить</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.contactPreviewButton]}
          onPress={handleContact}
        >
          <Ionicons
            name="call"
            size={18}
            color={theme.colors.textSecondary}
            style={styles.buttonIcon}
          />
          <Text style={styles.contactPreviewButtonText}>Проверить контакт</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={onApprove}>
          <Ionicons name="checkmark" size={18} color="#000000" style={styles.buttonIcon} />
          <Text style={styles.approveButtonText}>Опубликовать</Text>
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
    borderColor: theme.colors.admin,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.admin + '22',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    alignSelf: 'flex-start',
  },
  badgeIcon: {
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.admin,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
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
    marginBottom: theme.spacing.sm,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  inlineIcon: {
    marginRight: theme.spacing.xs,
  },
  companyName: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  },
  contactLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  actions: {
    gap: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: theme.spacing.xs,
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.danger,
  },
  contactPreviewButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.textMuted,
  },
  contactPreviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  approveButton: {
    backgroundColor: theme.colors.success,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
