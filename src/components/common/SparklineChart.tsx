import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-wagmi-charts';

const MiniSparkline = ({ sparkline }: { sparkline: number[] }) => {
  const chartData = sparkline.map((value, index) => ({
    timestamp: Date.now() + index * 60000,
    value,
  }));

  const isUp = sparkline[sparkline.length - 1] > sparkline[0];
  const lineColor = isUp ? '#00C853' : '#D50000';

  return (
    <View style={styles.container}>
      <LineChart.Provider data={chartData}>
        <LineChart height={30} width={100}>
          <LineChart.Path color={lineColor} width={1.5} />
        </LineChart>
      </LineChart.Provider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
});

export default MiniSparkline;
