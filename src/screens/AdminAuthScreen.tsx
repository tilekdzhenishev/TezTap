import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, LockKeyhole } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../utils/theme';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminAuthScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [code, setCode] = useState('');

  const adminCode = process.env.EXPO_PUBLIC_ADMIN_CODE;

  const handleSubmit = () => {
    if (!adminCode) {
      Alert.alert('Ошибка', 'Код администратора не настроен в environment.env');
      return;
    }

    if (code === adminCode) {
      navigation.navigate('AdminReview');
    } else {
      Alert.alert('Ошибка', 'Неверный код администратора');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <LockKeyhole size={30} color={theme.colors.admin} style={styles.titleIcon} />
          <Text style={styles.title}>Admin</Text>
        </View>
        <Text style={styles.subtitle}>Введите код администратора</Text>

        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="Код"
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry
          keyboardType="number-pad"
          autoFocus
          maxLength={10}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Войти</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={17} color={theme.colors.textSecondary} style={styles.buttonIcon} />
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.admin,
    marginBottom: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  titleIcon: {
    marginRight: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 24,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    textAlign: 'center',
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  button: {
    backgroundColor: theme.colors.admin,
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  buttonIcon: {
    marginRight: theme.spacing.xs,
  },
  backButtonText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
});
