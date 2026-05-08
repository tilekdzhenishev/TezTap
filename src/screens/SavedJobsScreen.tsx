import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { Banknote, MapPin, Phone, Timer, X } from 'lucide-react-native';
import { useStore } from '../store/appStore';
import { SavedJob } from '../types';
import { theme } from '../utils/theme';

export const SavedJobsScreen: React.FC = () => {
  const { savedJobs, loading, loadSavedJobs, unsaveJob, init } = useStore();

  useEffect(() => {
    init();
    loadSavedJobs();
  }, []);

  const handleContact = (contactUrl: string) => {
    let url = contactUrl.trim();
    if (url.startsWith('@')) url = `https://t.me/${url.slice(1)}`;
    if (!url.startsWith('http')) url = `https://${url}`;
    Linking.openURL(url);
  };

  const renderSavedJob = ({ item }: { item: SavedJob }) => {
    const job = item.job;
    if (!job) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{job.title}</Text>
          <TouchableOpacity
            style={styles.unsaveButton}
            onPress={() => unsaveJob(item.id)}
          >
            <X size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailRow}>
          <Banknote size={15} color={theme.colors.textSecondary} style={styles.detailIcon} />
          <Text style={styles.detailText}>{job.payment}</Text>
        </View>
        <View style={styles.detailRow}>
          <Timer size={15} color={theme.colors.textSecondary} style={styles.detailIcon} />
          <Text style={styles.detailText}>{job.duration}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={15} color={theme.colors.textSecondary} style={styles.detailIcon} />
          <Text style={styles.detailText}>{job.location}</Text>
        </View>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleContact(job.contact_url)}
        >
          <Phone size={17} color="#000000" style={styles.buttonIcon} />
          <Text style={styles.contactButtonText}>Связаться</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && savedJobs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (savedJobs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Пока нет сохранённых подработок</Text>
          <Text style={styles.emptyText}>
            Просматривайте подработки и сохраняйте интересные
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Сохранённые</Text>
        <Text style={styles.headerCount}>{savedJobs.length}</Text>
      </View>
      <FlatList
        data={savedJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderSavedJob}
        contentContainerStyle={styles.list}
      />
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
  headerCount: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '600',
    backgroundColor: theme.colors.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  list: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  unsaveButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  contactButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonIcon: {
    marginRight: theme.spacing.xs,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
