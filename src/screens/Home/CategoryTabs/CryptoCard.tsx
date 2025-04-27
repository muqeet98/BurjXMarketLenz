import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 160;

type CryptoCardProps = {
  coin: {
    symbol: string;
    name: string;
    currentPrice: number;
    priceChangePercentage24h?: number;
    sparkline?: number[];
  };
};

export const CryptoCard = React.memo(({ coin }: any) => {
  const isPositive = (coin.priceChangePercentage24h || 0) > 0;
  const chartColor = isPositive ? '#b7f834' : '#ff4560';
  
  // Use sparkline data for chart if available, or generate placeholder data
  const chartData = useMemo(() => {
    if (coin.sparkline && coin.sparkline.length > 1) {
      // Normalize the sparkline data to fit within our chart height
      const min = Math.min(...coin.sparkline);
      const max = Math.max(...coin.sparkline);
      const range = max - min;
      
      // Map to values between 20 and 80 (for our chart height)
      return coin.sparkline.map(value => {
        if (range === 0) return 50; // Prevent division by zero
        return 20 + ((value - min) / range) * 60;
      });
    } else {
      // Fallback to generating random data if sparkline is not available
      const points = [];
      let currentValue = 50;
      
      for (let i = 0; i < 20; i++) {
        const bias = isPositive ? 1 : -1;
        const randomChange = (Math.random() * 8) - 3 + bias;
        currentValue += randomChange;
        currentValue = Math.max(20, Math.min(80, currentValue));
        points.push(currentValue);
      }
      
      return points;
    }
  }, [coin.sparkline, isPositive]);
  
  // Calculate chart path
  const chartWidth = CARD_WIDTH - 32;
  const chartHeight = 50;
  const chartPath = chartData.map((point, index) => {
    const x = (index / (chartData.length - 1)) * chartWidth;
    const y = chartHeight - ((point / 100) * chartHeight);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  // Format price with appropriate commas and decimals
  const formatPrice = (price) => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else if (price < 1000) {
      return `$${price.toFixed(2)}`;
    } else if (price < 10000) {
      return `$${price.toFixed(2)}`;
    } else if (price < 1000000) {
      return `$${(price).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    } else {
      return `$${(price / 1000000).toFixed(2)}M`;
    }
  };
  
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View 
          style={[
            styles.coinIcon, 
            { backgroundColor: coin.symbol.toLowerCase() === 'btc' ? '#f2a900' : '#F3BA2F' }
          ]}
        >
          <Text style={styles.coinIconText}>
            {coin.symbol.substring(0, 1).toUpperCase()}
          </Text>
        </View>
        <View style={styles.coinInfo}>
          <Text style={styles.symbolText}>{coin.symbol.toUpperCase()}</Text>
          <Text style={styles.nameText}>{coin.name}</Text>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <Path
            d={chartPath}
            fill="none"
            stroke={chartColor}
            strokeWidth="2"
          />
        </Svg>
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>{formatPrice(coin.currentPrice)}</Text>
        <View style={[
          styles.changeContainer,
          isPositive ? styles.positiveChange : styles.negativeChange
        ]}>
          <Text style={isPositive ? styles.positiveText : styles.negativeText}>
            {isPositive ? '+' : ''}{coin.priceChangePercentage24h?.toFixed(2)}%
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    padding: 16,
    width: CARD_WIDTH,
    marginRight: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coinIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinIconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  coinInfo: {
    marginLeft: 8,
  },
  symbolText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  nameText: {
    fontSize: 12,
    color: '#6b7280',
  },
  chartContainer: {
    height: 50,
    marginVertical: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1f2937',
  },
  changeContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  positiveChange: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
  },
  negativeChange: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  positiveText: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 12,
  },
  negativeText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 12,
  },
});