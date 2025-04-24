import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { FeaturedTab } from '../tabs/FeaturedTab';
import { TopGainersTab } from '../tabs/TopGainersTab';
import { TopLosersTab } from '../tabs/TopLosersTab';
import { theme } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Coin } from '../../types';

const Tab = createMaterialTopTabNavigator();

export const MarketOverview: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSelectCoin = (coin: Coin) => {
    navigation.navigate('CoinDetails', { coin });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FeaturedTab onSelectCoin={handleSelectCoin} />
      {/* <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarIndicatorStyle: styles.tabIndicator,
          tabBarActiveTintColor: theme.colors.textPrimary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarLabelStyle: styles.tabLabel,
          tabBarPressColor: theme.colors.backgroundLight,
        }}
      >
        <Tab.Screen 
          name="Featured" 
          options={{ tabBarLabel: 'Featured' }}
        >
          {() => <FeaturedTab onSelectCoin={handleSelectCoin} />}
        </Tab.Screen>
        <Tab.Screen 
          name="TopGainers" 
          options={{ tabBarLabel: 'Gainers' }}
        >
          {() => <TopGainersTab onSelectCoin={handleSelectCoin} />}
        </Tab.Screen>
        <Tab.Screen 
          name="TopLosers" 
          options={{ tabBarLabel: 'Losers' }}
        >
          {() => <TopLosersTab onSelectCoin={handleSelectCoin} />}
        </Tab.Screen>
      </Tab.Navigator> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    tabBar: {
      backgroundColor: theme.colors.backgroundLight,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    tabIndicator: {
      backgroundColor: theme.colors.primary,
      height: 3,
    },
    tabLabel: {
      fontWeight: 'bold',
      textTransform: 'none',
      fontSize: theme.fonts.sizes.sm,
    },
  });
  
