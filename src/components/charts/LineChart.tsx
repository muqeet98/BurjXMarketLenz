import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';
import { OHLCData } from '../../types';
import { theme } from '../../theme';
import { Text } from '../common/Text';
import { LoadingIndicator } from '../common/LoadingIndicator';

interface LineChartProps {
  data: OHLCData[];
  loading: boolean;
  error: string | null;
  height?: number;
  width?: number;
  priceIncreased?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  loading,
  error,
  height = 200,
  width = Dimensions.get('window').width - 32,
  priceIncreased = true,
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

  const chartColor = priceIncreased ? theme.colors.chartGreen : theme.colors.chartRed;

  const chartData = {
    labels: data.map((item, index) => {
      // Display fewer labels for better readability
      return index % Math.floor(data.length / 5) === 0 
        ? new Date(item.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '';
    }),
    datasets: [
      {
        data: data.map(item => item.close),
        color: () => chartColor,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <RNLineChart
        data={chartData}
        width={width}
        height={height}
        chartConfig={{
          backgroundColor: theme.colors.backgroundLight,
          backgroundGradientFrom: theme.colors.backgroundLight,
          backgroundGradientTo: theme.colors.backgroundLight,
          decimalPlaces: 2,
          color: () => chartColor,
          labelColor: () => theme.colors.textSecondary,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '0',
            strokeWidth: '0',
          },
          propsForBackgroundLines: {
            stroke: theme.colors.chartGrid,
            strokeDasharray: '5, 5',
          },
        }}
        bezier
        style={styles.chart}
        withDots={false}
        withShadow={false}
        withInnerLines={true}
        withOuterLines={false}
        fromZero={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.metrics.baseSpacing,
  },
  chart: {
    borderRadius: theme.metrics.borderRadius.medium,
    paddingRight: 0,
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});