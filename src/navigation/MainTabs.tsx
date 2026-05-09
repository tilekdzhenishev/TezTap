import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { JobFeedScreen } from '../screens/JobFeedScreen';
import { SavedJobsScreen } from '../screens/SavedJobsScreen';
import { EmployerPortalScreen } from '../screens/EmployerPortalScreen';
import { WorkerProfileScreen } from '../screens/worker/WorkerProfileScreen';
import { MainTabParamList } from '../types/navigation';
import { useAuth } from '../auth/AuthContext';
import { theme } from '../utils/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ProfileTab: React.FC = () => {
  const { profile } = useAuth();
  if (profile?.role === 'employer') return <EmployerPortalScreen />;
  return <WorkerProfileScreen />;
};

export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTitleStyle: styles.headerTitle,
        headerTitleAlign: 'center',
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        headerLeft: () => (
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
        ),
      }}
    >
      <Tab.Screen
        name="Подработки"
        component={JobFeedScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Сохранённые"
        component={SavedJobsScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Профиль"
        component={ProfileTab}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
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
    fontWeight: '600',
  },
  logoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: theme.spacing.md,
  },
  logoImage: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },
});
