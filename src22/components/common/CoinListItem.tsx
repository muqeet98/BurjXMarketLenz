import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Coin } from '../../types';
import { theme } from '../../theme';
import { Text } from './Text';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { LineChart } from '../charts/LineChart';

interface CoinListItemProps {
  coin: Coin;
  onPress: (coin: Coin) => void;
}

export const CoinListItem: React.FC<CoinListItemProps> = ({ coin, onPress }) => {
  const priceIncreased = coin.price_change_percentage_24h >= 0;
  const changeColor = priceIncreased ? theme.colors.success : theme.colors.error;

  // Mock chart data - in a real app, this would come from API
  const mockChartData = Array(24).fill(0).map((_, i) => ({
    time: Date.now() - (24 - i) * 3600000,
    open: coin.current_price * (0.98 + Math.random() * 0.04),
    high: coin.current_price * (1 + Math.random() * 0.05),
    low: coin.current_price * (0.95 + Math.random() * 0.04),
    close: coin.current_price * (0.97 + Math.random() * 0.06)
  }));

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(coin)}>
      <View style={styles.leftContent}>
        <View style={styles.coinInfo}>
          <Image 
            source={{ uri: coin.image }} 
            style={styles.image} 
            resizeMode="contain"
          />
          <View style={styles.nameContainer}>
            <Text variant="body" bold>{coin.name}</Text>
            <Text variant="caption" color={theme.colors.textSecondary}>
              {coin.symbol.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.miniChart}>
          {/* <LineChart 
            data={mockChartData}
            loading={false}
            error={null}
            height={40}
            width={60}
            priceIncreased={priceIncreased}
          /> */}
        </View>
        
        <View style={styles.priceInfo}>
          <Text variant="body" bold>{formatCurrency(coin.current_price)}</Text>
          <Text variant="caption" color={changeColor}>
            {formatPercentage(coin.price_change_percentage_24h)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: theme.metrics.baseSpacing,
    paddingHorizontal: theme.metrics.mediumSpacing,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.metrics.borderRadius.medium,
    marginBottom: theme.metrics.baseSpacing,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  image: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: theme.metrics.baseSpacing,
  },
  nameContainer: {
    flex: 1,
  },
  miniChart: {
    width: 60,
    height: 40,
    marginHorizontal: theme.metrics.baseSpacing,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
});