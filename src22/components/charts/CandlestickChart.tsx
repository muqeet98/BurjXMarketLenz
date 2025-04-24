import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
// import {
//   CandlestickChart,
//   CandlestickChartProvider,
//   CandlestickChartCrosshair,
//   CandlestickChartCandles,
//   CandlestickChartCrosshairTooltip,
//   // CandlestickChartTooltip,
// } from 'react-native-wagmi-charts';
import { theme } from '../../theme';
import { Text } from '../common/Text';
import { LoadingIndicator } from '../common/LoadingIndicator';
import {
  CandlestickChart,
  CandlestickChartProvider,
  CandlestickChartCandles,
} from 'react-native-wagmi-charts';

interface CandleData {
  date: number;
  usd: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  aed: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
}

interface CandlestickChartProps {
  data: CandleData[];
  loading: boolean;
  error: string | null;
  height?: number;
  width?: number;
  currency?: 'usd' | 'aed';
}

export const CandlestickChartComponent: React.FC<CandlestickChartProps> = ({
  data,
  loading,
  error,
  height = 200,
  width = Dimensions.get('window').width - 32,
  currency = 'usd',
}) => {
  if (loading) {
    return <LoadingIndicator message="Loading chart data..." />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="body" color={theme.colors.error}>
          {error}
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="body" color={theme.colors.textSecondary}>
          No chart data available
        </Text>
      </View>
    );
  }

  const formattedData = data.map(item => ({
    timestamp: item.date,
    open: item[currency].open,
    high: item[currency].high,
    low: item[currency].low,
    close: item[currency].close,
  }));

  return (
    <View style={[styles.container, { height, width }]}>
      <CandlestickChartProvider data={[
        {
          timestamp: 1625945400000,
          open: 33575.25,
          high: 33600.52,
          low: 33475.12,
          close: 33520.11,
        },
        {
          timestamp: 1625946300000,
          open: 33545.25,
          high: 33560.52,
          low: 33510.12,
          close: 33520.11,
        },
        {
          timestamp: 1625947200000,
          open: 33510.25,
          high: 33515.52,
          low: 33250.12,
          close: 33250.11,
        },
        {
          timestamp: 1625948100000,
          open: 33215.25,
          high: 33430.52,
          low: 33215.12,
          close: 33420.11,
        },
      ]}>ß
        <CandlestickChart>
          <CandlestickChartCandles />
        </CandlestickChart>
      </CandlestickChartProvider>
      {/* <CandlestickChart.Provider data={[
  {
    timestamp: 1625945400000,
    open: 33575.25,
    high: 33600.52,
    low: 33475.12,
    close: 33520.11,
  },
  {
    timestamp: 1625946300000,
    open: 33545.25,
    high: 33560.52,
    low: 33510.12,
    close: 33520.11,
  },
  {
    timestamp: 1625947200000,
    open: 33510.25,
    high: 33515.52,
    low: 33250.12,
    close: 33250.11,
  },
  {
    timestamp: 1625948100000,
    open: 33215.25,
    high: 33430.52,
    low: 33215.12,
    close: 33420.11,
  },
]}>
      <CandlestickChart>
        <CandlestickChart.Candles />
      </CandlestickChart>
    </CandlestickChart.Provider> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.metrics.baseSpacing,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.metrics.borderRadius.medium,
    overflow: 'hidden',
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
