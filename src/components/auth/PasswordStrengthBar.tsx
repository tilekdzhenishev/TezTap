import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getPasswordStrength } from '../../auth/authService';

const LABELS = ['', 'Слабый', 'Слабый', 'Средний', 'Хороший', 'Сильный'];
const COLORS = ['#2A2A2A', '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#34C759'];

interface Props {
  password: string;
}

export const PasswordStrengthBar: React.FC<Props> = ({ password }) => {
  const score = password.length > 0 ? getPasswordStrength(password) : 0;

  if (!password) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${score * 20}%`,
              backgroundColor: COLORS[score],
            },
          ]}
        />
      </View>
      <Text style={[styles.label, { color: COLORS[score] }]}>{LABELS[score]}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  track: {
    flex: 1,
    height: 3,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    width: 52,
    textAlign: 'right',
  },
});
