import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';

interface AdminFeedbackOverlayProps {
  visible: boolean;
  tone: 'success' | 'danger';
  text: string;
}

export const AdminFeedbackOverlay: React.FC<AdminFeedbackOverlayProps> = ({
  visible,
  tone,
  text,
}) => {
  if (!visible) return null;

  const color = tone === 'success' ? theme.colors.success : theme.colors.danger;
  const icon = tone === 'success' ? 'checkmark' : 'close';

  return (
    <View style={styles.overlay}>
      <Ionicons name={icon} size={34} color={color} style={styles.icon} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
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
  icon: {
    marginBottom: theme.spacing.sm,
  },
  text: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
  },
});
