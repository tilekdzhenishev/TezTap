import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { UserLoginScreen } from '../screens/auth/UserLoginScreen';
import { UserSignUpScreen } from '../screens/auth/UserSignUpScreen';
import { EmployerLoginScreen } from '../screens/auth/EmployerLoginScreen';
import { EmployerSignUpScreen } from '../screens/auth/EmployerSignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { EmailVerificationScreen } from '../screens/auth/EmailVerificationScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#080808' },
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="AuthWelcome" component={WelcomeScreen} />
    <Stack.Screen name="UserLogin" component={UserLoginScreen} />
    <Stack.Screen name="UserSignUp" component={UserSignUpScreen} />
    <Stack.Screen name="EmployerLogin" component={EmployerLoginScreen} />
    <Stack.Screen name="EmployerSignUp" component={EmployerSignUpScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
  </Stack.Navigator>
);
