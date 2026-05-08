import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { JobFeedScreen } from '../screens/JobFeedScreen';
import { SavedJobsScreen } from '../screens/SavedJobsScreen';
import { EmployerPortalScreen } from '../screens/EmployerPortalScreen';
import { WorkerProfileScreen } from '../screens/worker/WorkerProfileScreen';
import { MainTabParamList, RootStackParamList } from '../types/navigation';
import { useAuth } from '../auth/AuthContext';
import { theme } from '../utils/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ProfileTab: React.FC = () => {
  const { profile } = useAuth();
  if (profile?.role === 'employer') return <EmployerPortalScreen />;
  return <WorkerProfileScreen />;
};

export const MainTabs: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  let pressCount = 0;
  let pressTimer: ReturnType<typeof setTimeout> | null = null;

  const handleLogoPress = () => {
    pressCount++;
    if (pressCount === 1) {
      pressTimer = setTimeout(() => {
        pressCount = 0;
      }, 1000);
    }
    if (pressCount >= 5) {
      if (pressTimer) clearTimeout(pressTimer);
      pressCount = 0;
      navigation.navigate('AdminAuth');
    }
  };

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
          <TouchableOpacity onPress={handleLogoPress} style={styles.logoButton}>
            <Text style={styles.logoText}>Tez</Text>
            <Text style={styles.logoTextAccent}>Tap</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingLeft: theme.spacing.md,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.text,
  },
  logoTextAccent: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.primary,
  },
});
