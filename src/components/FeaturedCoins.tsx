// src/components/FeaturedCoins.tsx
import React from 'react';
import { View, StyleSheet, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedCoins } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import CoinCard from './CoinCard';
import { Coin } from '../types';

interface FeaturedCoinsProps {
  onCoinPress?: (coin: Coin) => void;
}

const FeaturedCoins: React.FC<FeaturedCoinsProps> = ({ onCoinPress }) => {
  const { theme } = useTheme();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['featuredCoins'],
    queryFn: () => fetchFeaturedCoins('usd', 1, 5),
  });
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }
  
  if (isError || !data?.data || data.data.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: theme.secondaryText }}>Failed to load featured coins</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Featured Coins</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {data.data.map((coin) => (
          <View key={coin.id} style={styles.cardWrapper}>
            <CoinCard 
              coin={coin}
              onPress={() => onCoinPress?.(coin)}
              showDetailsChart={false}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  cardWrapper: {
    width: 200,
    marginHorizontal: 4,
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FeaturedCoins;