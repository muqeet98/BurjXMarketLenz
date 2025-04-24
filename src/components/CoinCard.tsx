// src/components/CoinCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Coin } from '../types';
import { useTheme } from '../hooks/useTheme';
import CoinChart from './CoinChart';

interface CoinCardProps {
  coin: Coin;
  onPress?: () => void;
  showDetailsChart?: boolean;
}

const CoinCard: React.FC<CoinCardProps> = ({ 
  coin, 
  onPress, 
  showDetailsChart = false 
}) => {
  const { theme } = useTheme();
  const priceChangeIsPositive = coin.price_change_percentage_24h >= 0;
  const priceChangeColor = priceChangeIsPositive ? theme.positive : theme.negative;
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.coinInfo}>
        <View style={styles.iconContainer}>
          <Image source={{ uri: coin?.image }} style={styles.icon} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.symbol, { color: theme.text }]}>{coin?.symbol.toUpperCase()}</Text>
          <Text style={[styles.name, { color: theme.secondaryText }]}>{coin?.name}</Text>
        </View>
      </View>
      
      {showDetailsChart && (
        <View style={styles.chartContainer}>
          <CoinChart
            coinId={coin?.id}
            days="7"
            height={40}
            width={80}
            showAxis={false}
            color={priceChangeIsPositive ? theme.chart.positive : theme.chart.negative}
          />
        </View>
      )}
      
      <View style={styles.priceContainer}>
        <Text style={[styles.price, { color: theme.text }]}>
          ${coin?.current_price?.toLocaleString()}
        </Text>
        
        <View style={[
          styles.changeContainer, 
          { backgroundColor: priceChangeIsPositive ? 'rgba(22, 199, 132, 0.1)' : 'rgba(234, 57, 67, 0.1)' }
        ]}>
          <Text style={[styles.changeText, { color: priceChangeColor }]}>
            {priceChangeIsPositive ? '+' : ''}{coin?.price_change_percentage_24h?.toFixed(2)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 3,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  textContainer: {
    flexDirection: 'column',
  },
  symbol: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
  },
  chartContainer: {
    flex: 3,
    height: 40,
    justifyContent: 'center',
  },
  priceContainer: {
    alignItems: 'flex-end',
    flex: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CoinCard;