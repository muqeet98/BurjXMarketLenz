import React, { useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Authentication } from '../components/screens/Authentication';
import { MarketOverview } from '../components/screens/MarketOverview';
import { CoinDetails } from '../components/screens/CoinDetails';
import { theme } from '../theme';
import { Coin } from '../types';

export type RootStackParamList = {
  Authentication: undefined;
  MarketOverview: undefined;
  CoinDetails: { coin: Coin };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    primary: theme.colors.primary,
    card: theme.colors.cardBg,
    text: theme.colors.textPrimary,
    border: theme.colors.border,
  },
};

export const AppNavigator: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.backgroundLight,
          },
          headerTintColor: theme.colors.textPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Authentication"
              options={{ headerShown: false }}
            >
              {(props) => (
                <Authentication
                  {...props}
                  onAuthenticated={() => setIsAuthenticated(true)}
                />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="MarketOverview"
              component={MarketOverview}
              options={{ title: 'Crypto Market' }}
            />
            <Stack.Screen
              name="CoinDetails"
              component={CoinDetails}
              options={({ route }) => ({
                title: route.params.coin.name,
                headerBackTitle: 'Market'
              })}
            />
          </>

        ) : (
          <>
            <Stack.Screen
              name="MarketOverview"
              component={MarketOverview}
              options={{ title: 'Crypto Market' }}
            />
            <Stack.Screen
              name="CoinDetails"
              component={CoinDetails}
              options={({ route }) => ({
                title: route.params.coin.name,
                headerBackTitle: 'Market'
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};