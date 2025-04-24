// src/components/CoinChart.tsx
import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { LineChart } from 'react-native-wagmi-charts';
import { useCoinChart } from '../hooks/useCoinData';
import { useTheme } from '../hooks/useTheme';

interface CoinChartProps {
  coinId: string;
  days: '1' | '7' | '30' | '365' | 'max';
  height?: number;
  width?: number;
  showAxis?: boolean;
  color?: string;
}

const CoinChart: React.FC<CoinChartProps> = ({
  coinId,
  days,
  height = 40,
  width = 80,
  showAxis = true,
  color,
}) => {
  const { theme } = useTheme();
  const { data, isLoading, isError } = useCoinChart(coinId, days);
  
  if (isLoading) {
    return (
      <View style={[styles.container, { height, width }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }
  
  if (isError || !data?.data || data.data.length === 0) {
    return (
      <View style={[styles.container, { height, width }]}>
        <Text style={{ color: theme.secondaryText }}>No data available</Text>
      </View>
    );
  }
  
  const chartData = data.data.map((item) => ({
    timestamp: item.time * 1000, // Convert to milliseconds
    value: item.close,
  }));
  
  const priceChange = chartData.length > 1 
    ? chartData[chartData.length - 1].value - chartData[0].value 
    : 0;
  
  const chartColor = color || (priceChange >= 0 ? theme.chart.positive : theme.chart.negative);
  
  return (
    <View style={[styles.container, { height, width }]}>
      <LineChart.Provider data={chartData}>
        <LineChart height={height} width={width}>
          <LineChart.Path color={chartColor} width={2}>
            <LineChart.Gradient />
          </LineChart.Path>
          
          {showAxis && (
            <>
              <LineChart.CursorCrosshair color={chartColor} />
              <LineChart.Tooltip />
              <LineChart.PriceText 
                format={(value) => `$${value}`}
                style={{ color: theme.text, fontSize: 14 }}
              />
              <LineChart.DatetimeText
                locale="en-US"
                options={{ month: 'short', day: 'numeric' }}
                style={{ color: theme.secondaryText, fontSize: 12 }}
              />
            </>
          )}
        </LineChart>
      </LineChart.Provider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CoinChart;