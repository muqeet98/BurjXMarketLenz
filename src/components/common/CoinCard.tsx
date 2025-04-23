// src/components/CoinCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Coin {
  id: number;
  name: string;
  price: number;
  symbol: string;
}

const CoinCard: React.FC<{ coin: Coin }> = ({ coin }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{coin.name} ({coin.symbol})</Text>
    <Text style={styles.price}>${coin.price.toFixed(2)}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    backgroundColor: '#121212',
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    color: '#fff',
  },
  price: {
    fontSize: 14,
    color: 'lightgreen',
  },
});

export default CoinCard;
