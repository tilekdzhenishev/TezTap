import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StackActions, useNavigation } from '@react-navigation/native';
import { AdminReviewScreen } from '../screens/AdminReviewScreen';
import { AdminEmployerReviewScreen } from '../screens/AdminEmployerReviewScreen';
import { AdminWorkerVerificationScreen } from '../screens/admin/AdminWorkerVerificationScreen';
import { AdminTabParamList } from '../types/navigation';
import { useStore } from '../store/appStore';
import { fetchPendingWorkers } from '../supabase/client';
import { theme } from '../utils/theme';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export const AdminTabs: React.FC = () => {
  const navigation = useNavigation();
  const { pendingJobs, pendingEmployers, loadPendingJobs, loadPendingEmployers } = useStore();
  const [pendingWorkersCount, setPendingWorkersCount] = useState(0);

  const refreshCounts = () => {
    loadPendingJobs();
    loadPendingEmployers();
    fetchPendingWorkers().then((workers) => setPendingWorkersCount(workers.length));
  };

  useEffect(() => {
    refreshCounts();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTitle: () => (
          <View style={styles.headerTitleRow}>
            <Ionicons name="lock-closed" size={16} color={theme.colors.admin} />
            <Text style={styles.headerTitle}>Админ</Text>
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity
            style={styles.exitButton}
            onPress={() => navigation.dispatch(StackActions.popToTop())}
          >
            <Ionicons name="exit-outline" size={18} color={theme.colors.textMuted} />
            <Text style={styles.exitText}>Exit</Text>
          </TouchableOpacity>
        ),
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.colors.admin,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
      screenListeners={{
        focus: refreshCounts,
      }}
    >
      <Tab.Screen
        name="Вакансии"
        component={AdminReviewScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase" size={size} color={color} />,
          tabBarBadge: pendingJobs.length || undefined,
        }}
      />
      <Tab.Screen
        name="Работодатели"
        component={AdminEmployerReviewScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="business" size={size} color={color} />,
          tabBarBadge: pendingEmployers.length || undefined,
        }}
      />
      <Tab.Screen
        name="Работники"
        component={AdminWorkerVerificationScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
          tabBarBadge: pendingWorkersCount || undefined,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.surface,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.admin,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: theme.spacing.md,
    borderRadius: 8,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  exitText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.cardBorder,
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 8,
    height: 80,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});
