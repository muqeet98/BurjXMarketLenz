import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SparklineGreen, SparklineRed } from '../../../constants/svgs';
import ResponsiveText from '../../../components/common/ResponsiveText';
import { fonts } from '../../../constants/Fonts';
import { wp } from '../../../utils/Responsiveness';

const CARD_WIDTH = wp(46);

type CryptoCardProps = {
  coin: {
    symbol: string;
    name: string;
    currentPrice: number;
    priceChangePercentage24h?: number;
    sparkline?: number[];
  };
};

export const CryptoCard = React.memo(({ coin,navigate}: any) => {
  const isPositive = (coin.priceChangePercentage24h || 0) > 0;

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
    <TouchableOpacity activeOpacity={0.8} onPress={()=>navigate(coin)} style={[styles.card, { backgroundColor: '#1B1B1B' }]}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.coinIcon,
            { backgroundColor: coin.symbol.toLowerCase() === 'btc' ? '#f2a900' : '#F3BA2F' }
          ]}
        >
          <Image
            source={{ uri: coin?.image }}
            style={{ width: wp(8), height: wp(8), borderRadius: wp(30) }}
            resizeMode="contain"
          />
        </View>
        <View style={styles.coinInfo}>
          <ResponsiveText size={'h5'}>
            {coin?.symbol?.toUpperCase()}
          </ResponsiveText>
          <ResponsiveText fontFamily={fonts.LufgaLight} color={'#898989'} size={'h3'}>
            {coin?.name}
          </ResponsiveText>
        </View>
      </View>

      <View style={styles.chartContainer}>
        {coin?.priceChangePercentage24h >= 0 ? <SparklineGreen /> : <SparklineRed />}
      </View>

      <View style={styles.priceContainer}>
        {/* <Text style={styles.priceText}>{formatPrice(coin.currentPrice)}</Text> */}
        <ResponsiveText size={'h45'}>
          $ {coin.currentPrice?.toLocaleString()}
        </ResponsiveText>
        <View style={[
          styles.changeContainer,
          isPositive ? styles.positiveChange : styles.negativeChange
        ]}>
          <Text style={isPositive ? styles.positiveText : styles.negativeText}>
            {isPositive ? '+' : ''}{coin.priceChangePercentage24h?.toFixed(2)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    padding: 16,
    width: CARD_WIDTH,
    marginRight: 5,
    borderWidth:0.3, 
    borderColor: '#3F3F3F',
    // marginBottom:5
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: wp(20)
    // marginBottom: 12,
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
    width: '70%'
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