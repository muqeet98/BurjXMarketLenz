// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import { useTheme } from '../hooks/useTheme';
import SplashScreen from '../screens/Splash';
import CryptoPriceChart from '../screens/Home/CoinDetails/CryptoPriceChart';
import BiometricAuth from '../screens/BiometricAuth';
import TabManager from '../screens/Home/HomeScreen';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Home: undefined;
  CoinDetail:undefined
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Stack.Navigator
      initialRouteName={'Splash'}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Auth"
        component={BiometricAuth}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={TabManager}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CoinDetail"
        component={CryptoPriceChart}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
