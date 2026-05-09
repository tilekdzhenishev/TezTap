import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainTabs } from './MainTabs';
import { SubmitJobScreen } from '../screens/SubmitJobScreen';
import { EmployerApplicationsScreen } from '../screens/employer/EmployerApplicationsScreen';
import { WorkerOnboardingScreen } from '../screens/worker/WorkerOnboardingScreen';
import { AdminAuthScreen } from '../screens/AdminAuthScreen';
import { AdminTabs } from './AdminTabs';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../utils/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

export const AppNavigator: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!session) return <AuthNavigator />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="WorkerOnboarding" component={WorkerOnboardingScreen} />
      <Stack.Screen name="SubmitJob" component={SubmitJobScreen} />
      <Stack.Screen name="EmployerApplications" component={EmployerApplicationsScreen} />
      <Stack.Screen name="AdminAuth" component={AdminAuthScreen} />
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#080808',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
