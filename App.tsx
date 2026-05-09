import './src/i18n'; // initialize i18next before any component renders

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/auth/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
