import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';

interface AdminEmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <View style={styles.center}>
    <Ionicons name={icon} size={46} color={theme.colors.admin} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
    <TouchableOpacity style={styles.actionButton} onPress={onAction}>
      <Ionicons name="refresh" size={17} color="#000000" style={styles.actionIcon} />
      <Text style={styles.actionText}>{actionLabel}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.admin,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  actionIcon: {
    marginRight: theme.spacing.xs,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
