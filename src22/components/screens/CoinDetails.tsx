import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ChartViewType, TimeRangeType } from '../../types';
import { theme } from '../../theme';
import { Text } from '../common/Text';
import { LineChart } from '../charts/LineChart';
import { CandlestickChartComponent } from '../charts/CandlestickChart';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useCoinDetails } from '../../hooks/useCoinData';
import { formatCurrency, formatLargeNumber, formatPercentage } from '../../utils/formatters';

type CoinDetailsRouteProp = RouteProp<RootStackParamList, 'CoinDetails'>;

export const CoinDetails: React.FC = () => {
  const route = useRoute<CoinDetailsRouteProp>();
  const { coin } = route.params;
  
  const [chartType, setChartType] = useState<ChartViewType>('candlestick');
  const [timeRange, setTimeRange] = useState<TimeRangeType>('1');
  
  const { ohlcData, loading, error } = useCoinDetails(coin.id, timeRange);
  
  const timeRangeOptions: Array<{ label: string; value: TimeRangeType }> = [
    { label: '24H', value: '1' },
    { label: '7D', value: '7' },
    { label: '30D', value: '30' },
    { label: '1Y', value: '365' },
    { label: 'All', value: 'max' },
  ];
  
  const priceIncreased = coin.price_change_percentage_24h >= 0;
  const changeColor = priceIncreased ? theme.colors.success : theme.colors.error;
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text variant="h2" bold>
            {coin.name} ({coin.symbol.toUpperCase()})
          </Text>
          <Text variant="h3" bold>
            {formatCurrency(coin.current_price)}
          </Text>
          <Text variant="body" color={changeColor}>
            {formatPercentage(coin.price_change_percentage_24h)} (24h)
          </Text>
        </View>
        
        <View style={styles.chartContainer}>
          <View style={styles.chartTypeSelector}>
            <TouchableOpacity
              style={[
                styles.chartTypeButton,
                chartType === 'line' && styles.activeChartTypeButton,
              ]}
              onPress={() => setChartType('line')}
            >
              <Text
                variant="button"
                color={
                  chartType === 'line'
                    ? theme.colors.textPrimary
                    : theme.colors.textSecondary
                }
              >
                Line
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chartTypeButton,
                chartType === 'candlestick' && styles.activeChartTypeButton,
              ]}
              onPress={() => setChartType('candlestick')}
            >
              <Text
                variant="button"
                color={
                  chartType === 'candlestick'
                    ? theme.colors.textPrimary
                    : theme.colors.textSecondary
                }
              >
                Candlestick
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.timeRangeSelector}>
            {timeRangeOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.timeRangeButton,
                  timeRange === option.value && styles.activeTimeRangeButton,
                ]}
                onPress={() => setTimeRange(option.value)}
              >
                <Text
                  variant="caption"
                  color={
                    timeRange === option.value
                      ? theme.colors.textPrimary
                      : theme.colors.textSecondary
                  }
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.chart}>
            {/* {console.log('Chart Data:', ohlcData)} */}
            
            {chartType === 'line' ? (
              <LineChart
                data={ohlcData}
                loading={loading}
                error={error}
                priceIncreased={priceIncreased}
              />
            ) : (
              <CandlestickChartComponent
                data={ohlcData}
                loading={loading}
                error={error}
                currency={'usd'}
              />
            )}
             {/* <CandlestickChartComponent
                data={ohlcData}
                loading={loading}
                error={error}
              /> */}
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <Text variant="h4" bold style={styles.sectionTitle}>
            Stats
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="caption" color={theme.colors.textSecondary}>
                Market Cap
              </Text>
              <Text variant="body" bold>
                {formatCurrency(coin.market_cap)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="caption" color={theme.colors.textSecondary}>
                Rank
              </Text>
              <Text variant="body" bold>
                #{coin.market_cap_rank}
              </Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="caption" color={theme.colors.textSecondary}>
                24h Volume
              </Text>
              <Text variant="body" bold>
                {formatCurrency(coin.total_volume)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="caption" color={theme.colors.textSecondary}>
                Circulating Supply
              </Text>
              <Text variant="body" bold>
                {formatLargeNumber(coin.circulating_supply)} {coin.symbol.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: theme.metrics.mediumSpacing,
    marginBottom: theme.metrics.baseSpacing,
  },
  chartContainer: {
    padding: theme.metrics.mediumSpacing,
    backgroundColor: theme.colors.cardBg,
    marginBottom: theme.metrics.mediumSpacing,
    borderRadius: theme.metrics.borderRadius.medium,
  },
  chartTypeSelector: {
    flexDirection: 'row',
    marginBottom: theme.metrics.baseSpacing,
    borderRadius: theme.metrics.borderRadius.medium,
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.metrics.smallSpacing,
  },
  chartTypeButton: {
    flex: 1,
    paddingVertical: theme.metrics.baseSpacing,
    alignItems: 'center',
    borderRadius: theme.metrics.borderRadius.small,
  },
  activeChartTypeButton: {
    backgroundColor: theme.colors.primary,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.metrics.mediumSpacing,
  },
  timeRangeButton: {
    paddingVertical: theme.metrics.smallSpacing,
    paddingHorizontal: theme.metrics.baseSpacing,
    borderRadius: theme.metrics.borderRadius.small,
  },
  activeTimeRangeButton: {
    backgroundColor: theme.colors.backgroundLight,
  },
  chart: {
    height: 250,
  },
  statsContainer: {
    padding: theme.metrics.mediumSpacing,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.metrics.borderRadius.medium,
    marginBottom: theme.metrics.mediumSpacing,
  },
  sectionTitle: {
    marginBottom: theme.metrics.baseSpacing,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.metrics.baseSpacing,
  },
  statItem: {
    flex: 1,
    paddingVertical: theme.metrics.baseSpacing,
  },
});