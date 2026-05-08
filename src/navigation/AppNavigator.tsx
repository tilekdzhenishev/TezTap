import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainTabs } from './MainTabs';
import { AdminAuthScreen } from '../screens/AdminAuthScreen';
import { AdminReviewScreen } from '../screens/AdminReviewScreen';
import { AdminEmployerReviewScreen } from '../screens/AdminEmployerReviewScreen';
import { AdminWorkerVerificationScreen } from '../screens/admin/AdminWorkerVerificationScreen';
import { SubmitJobScreen } from '../screens/SubmitJobScreen';
import { EmployerApplicationsScreen } from '../screens/employer/EmployerApplicationsScreen';
import { WorkerOnboardingScreen } from '../screens/worker/WorkerOnboardingScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#FF8C00" />
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
        contentStyle: { backgroundColor: '#0F0F0F' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="WorkerOnboarding" component={WorkerOnboardingScreen} />
      <Stack.Screen name="AdminAuth" component={AdminAuthScreen} />
      <Stack.Screen name="AdminReview" component={AdminReviewScreen} />
      <Stack.Screen name="AdminEmployerReview" component={AdminEmployerReviewScreen} />
      <Stack.Screen name="AdminWorkerVerification" component={AdminWorkerVerificationScreen} />
      <Stack.Screen name="SubmitJob" component={SubmitJobScreen} />
      <Stack.Screen name="EmployerApplications" component={EmployerApplicationsScreen} />
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
