import React, { useState, useRef, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,

} from 'react-native';
import Svg,{Path} from 'react-native-svg';
import { DataCheck } from '../constants/Icons';
// Get the screen width for responsive sizing
const { width } = Dimensions.get('window');
const CARD_WIDTH = 160;
const CARD_MARGIN = 12;

// Initialize data outside component to prevent recreation on re-renders
const ALL_CRYPTOS = [
  { symbol: 'BTC', name: 'Bitcoin', price: '$159,234.23', change: 5.42, marketCap: 1 },
  { symbol: 'ETH', name: 'Ethereum', price: '$3,245.67', change: 2.18, marketCap: 2 },
  { symbol: 'USDT', name: 'Tether', price: '$1.00', change: 0.01, marketCap: 3 },
  { symbol: 'BNB', name: 'Binance', price: '$415.23', change: -5.42, marketCap: 4 },
  { symbol: 'SOL', name: 'Solana', price: '$98.76', change: -1.24, marketCap: 5 },
  { symbol: 'XRP', name: 'Ripple', price: '$0.71', change: -0.92, marketCap: 6 },
  { symbol: 'USDC', name: 'USD Coin', price: '$1.00', change: 0.02, marketCap: 7 },
  { symbol: 'ADA', name: 'Cardano', price: '$0.58', change: 3.75, marketCap: 8 },
  { symbol: 'AVAX', name: 'Avalanche', price: '$34.21', change: 8.54, marketCap: 9 },
  { symbol: 'DOGE', name: 'Dogecoin', price: '$0.12', change: -2.34, marketCap: 10 },
  { symbol: 'DOT', name: 'Polkadot', price: '$6.87', change: 7.65, marketCap: 11 },
  { symbol: 'TRX', name: 'TRON', price: '$0.11', change: 6.27, marketCap: 12 },
  { symbol: 'MATIC', name: 'Polygon', price: '$0.58', change: 9.32, marketCap: 13 },
  { symbol: 'TON', name: 'Toncoin', price: '$5.12', change: -4.65, marketCap: 14 },
  { symbol: 'SHIB', name: 'Shiba Inu', price: '$0.000018', change: 1.23, marketCap: 15 },
  { symbol: 'UNI', name: 'Uniswap', price: '$7.26', change: -6.78, marketCap: 16 },
  { symbol: 'LINK', name: 'Chainlink', price: '$15.43', change: 12.45, marketCap: 17 },
  { symbol: 'LTC', name: 'Litecoin', price: '$65.37', change: -7.82, marketCap: 18 },
  { symbol: 'XLM', name: 'Stellar', price: '$0.095', change: 10.67, marketCap: 19 },
  { symbol: 'BCH', name: 'Bitcoin Cash', price: '$242.15', change: -9.43, marketCap: 20 },
  { symbol: 'FIL', name: 'Filecoin', price: '$4.23', change: 15.78, marketCap: 21 },
  { symbol: 'ICP', name: 'Internet Comp', price: '$8.12', change: 18.92, marketCap: 22 },
  { symbol: 'APT', name: 'Aptos', price: '$7.56', change: -12.34, marketCap: 23 },
  { symbol: 'ATOM', name: 'Cosmos', price: '$7.12', change: 4.56, marketCap: 24 },
  { symbol: 'NEAR', name: 'NEAR Protocol', price: '$3.45', change: -15.67, marketCap: 25 },
  { symbol: 'SAND', name: 'The Sandbox', price: '$0.42', change: 16.89, marketCap: 26 },
  { symbol: 'INJ', name: 'Injective', price: '$14.87', change: 23.45, marketCap: 27 },
  { symbol: 'GRT', name: 'The Graph', price: '$0.15', change: -17.85, marketCap: 28 },
  { symbol: 'AAVE', name: 'Aave', price: '$75.34', change: 5.67, marketCap: 29 },
  { symbol: 'EGLD', name: 'MultiversX', price: '$35.87', change: -18.91, marketCap: 30 },
];

// Memoized Crypto Tab component to prevent re-renders
const CryptoTab = memo(({ symbol, name, price, change }) => {
  // Determine if change is positive or negative
  const isPositive = change > 0;
  const chartColor = isPositive ? '#b7f834' : '#ff4560';
  
  // Generate chart data based on price change direction - memoized to prevent recalculation
  const chartData = useMemo(() => {
    const points = [];
    let currentValue = 50;
    
    for (let i = 0; i < 20; i++) {
      // Make the trend follow the overall change direction
      const bias = isPositive ? 1 : -1;
      const randomChange = (Math.random() * 8) - 3 + bias;
      currentValue += randomChange;
      // Keep within bounds
      currentValue = Math.max(20, Math.min(80, currentValue));
      points.push(currentValue);
    }
    
    return points;
  }, [isPositive]); // Only regenerate if positive/negative status changes
  
  // Calculate chart path
  const chartWidth = CARD_WIDTH - 32; // Accounting for padding
  const chartHeight = 50;
  const chartPath = chartData.map((point, index) => {
    const x = (index / (chartData.length - 1)) * chartWidth;
    const y = chartHeight - ((point / 100) * chartHeight);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.coinIcon, { backgroundColor: symbol === 'BTC' ? '#f2a900' : '#F3BA2F' }]}>
          <Text style={styles.coinIconText}>{symbol === 'BTC' ? '₿' : 'B'}</Text>
        </View>
        <View style={styles.coinInfo}>
          <Text style={styles.symbolText}>{symbol}</Text>
          <Text style={styles.nameText}>{name}</Text>
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
        <Text style={styles.priceText}>{price}</Text>
        <View style={[
          styles.changeContainer,
          isPositive ? styles.positiveChange : styles.negativeChange
        ]}>
          <Text style={isPositive ? styles.positiveText : styles.negativeText}>
            {isPositive ? '+' : ''}{change}%
          </Text>
        </View>
      </View>
    </View>
  );
});

const CryptoTabs = () => {
  const [activeTab, setActiveTab] = useState(0);
  const flatListRef = useRef(null);
  
  // Tab data
  const tabs = [
    { icon: '⭐', name: "Featured" },
    { icon: '📈', name: "Top Gainers" },
    { icon: '📉', name: "Top Losers" }
  ];
  
  // Memoized data processing
  const cryptos = useMemo(() => {
    switch(activeTab) {
      case 0: // Featured
        return [...ALL_CRYPTOS].sort((a, b) => a.marketCap - b.marketCap).slice(0, 20);
      case 1: // Top Gainers
        return [...ALL_CRYPTOS].sort((a, b) => b.change - a.change).filter(crypto => crypto.change > 0).slice(0, 20);
      case 2: // Top Losers
        return [...ALL_CRYPTOS].sort((a, b) => a.change - b.change).filter(crypto => crypto.change < 0).slice(0, 20);
      default:
        return [...ALL_CRYPTOS].slice(0, 20);
    }
  }, [activeTab]); // Only recalculate when the active tab changes
  
  // Get the description for the current tab - memoized
  const tabDescription = useMemo(() => {
    switch(activeTab) {
      case 0:
        return "Top 20 cryptocurrencies by market cap";
      case 1:
        return "Top 20 by 24-hour percentage gain";
      case 2:
        return "Top 20 by 24-hour percentage loss";
      default:
        return "";
    }
  }, [activeTab]);
  
  // Memoized tab change handler
  const handleTabChange = useCallback((index) => {
    setActiveTab(index);
    // Reset scroll position when changing tabs
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, []);
  
  // Render item callback - memoized to prevent recreating on each render
  const renderItem = useCallback(({ item }) => (
    <CryptoTab
      symbol={item.symbol}
      name={item.name}
      price={item.price}
      change={item.change}
    />
  ), []);
  
  // Key extractor callback - memoized
  const keyExtractor = useCallback((item) => item.symbol, []);
  
  // Scroll buttons are now properly optimized arrow components
  const LeftArrow = useCallback(() => {
    const handlePress = () => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    };
    
    return (
      <TouchableOpacity style={styles.arrowButton} onPress={handlePress}>
        <Text style={styles.arrowText}>◀</Text>
      </TouchableOpacity>
    );
  }, []);
  
  const RightArrow = useCallback(() => {
    const handlePress = () => {
      if (flatListRef.current && cryptos.length > 0) {
        // Scroll to last item
        const offset = (CARD_WIDTH + CARD_MARGIN) * (cryptos.length - 3);
        flatListRef.current.scrollToOffset({ offset: Math.max(0, offset), animated: true });
      }
    };
    
    return (
      <TouchableOpacity style={styles.arrowButton} onPress={handlePress}>
        <Text style={styles.arrowText}>▶</Text>
      </TouchableOpacity>
    );
  }, [cryptos.length]);
  
  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tabButton,
              activeTab === index && styles.activeTabButton
            ]}
            onPress={() => handleTabChange(index)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabText,
              activeTab === index && styles.activeTabText
            ]}>
              {tab.name}{DataCheck.length}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Tab Description */}
      <Text style={styles.tabDescription}>{tabDescription}</Text>
      
      {/* Scrollable Content */}
      <View style={styles.scrollContainer}>
        <LeftArrow />
        
        <FlatList
          ref={flatListRef}
          data={cryptos}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          initialNumToRender={5}  // Limits initial render batch
          maxToRenderPerBatch={5} // Limits the amount of items rendered per batch
          windowSize={5}          // Controls the number of items rendered outside the visible area
          removeClippedSubviews={true} // Unmounts components when outside of window
          getItemLayout={(data, index) => ({
            length: CARD_WIDTH + CARD_MARGIN,
            offset: (CARD_WIDTH + CARD_MARGIN) * index,
            index,
          })}
        />
        
        <RightArrow />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center'
  },
  tabDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    marginTop: -8,
    paddingLeft: 16,
    fontStyle: 'italic',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    marginBottom: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
  },
  scrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingRight: 16,
  },
  arrowButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  arrowText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  card: {
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    padding: 16,
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
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

export default CryptoTabs;