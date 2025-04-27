import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCryptoData } from '../../../store/slices/coinsSlice';
import { CryptoCard } from './CryptoCard';

const TABS = [
  { icon: '⭐', name: 'Featured', category: 'featured' },
  { icon: '📈', name: 'Top Gainers', category: 'topGainers' },
  { icon: '📉', name: 'Top Losers', category: 'topLosers' }
];

const TAB_DESCRIPTIONS = {
  featured: 'Top 20 cryptocurrencies by market cap',
  topGainers: 'Top 20 by 24-hour percentage gain',
  topLosers: 'Top 20 by 24-hour percentage loss'
};

export const CryptoTabs = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const dispatch = useDispatch();
  
  const { featured, topGainers, topLosers, status, lastFetched } = useSelector(state => state.coins);
  
  // Get the active category based on the tab index
  const activeCategory = TABS[activeTabIndex].category;
  console.log("featuredfeatured",featured);
  
  // Get the coins for the current tab - no sorting needed, already done in the reducer
  const getCoinsForActiveTab = () => {
    switch (activeCategory) {
      case 'featured':
        return featured;
      case 'topGainers':
        return topGainers;
      case 'topLosers':
        return topLosers;
      default:
        return featured;
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    const shouldFetch = 
      status === 'idle' || 
      !lastFetched || 
      (Date.now() - lastFetched > 60000); // Refetch if data is older than 1 minute
      
    if (shouldFetch) {
      dispatch(fetchCryptoData());
    }
    
    // Set up auto-refresh every minute
    const intervalId = setInterval(() => {
    //   dispatch(fetchCryptoData());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [dispatch, status, lastFetched]);
  
  // Tab change handler
  const handleTabChange = useCallback((index) => {
    setActiveTabIndex(index);
  }, []);
  
  // Render item callback - uses memoized CryptoCard component
  const renderCryptoItem = useCallback(({ item }) => (
    <CryptoCard coin={item} />
  ), []);
  
  // Unique key for list items
  const keyExtractor = useCallback((item) => item.id, []);
  
  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tabButton,
              activeTabIndex === index && styles.activeTabButton
            ]}
            onPress={() => handleTabChange(index)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text 
              style={[
                styles.tabText,
                activeTabIndex === index && styles.activeTabText
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Tab Description */}
      <Text style={styles.tabDescription}>
        {TAB_DESCRIPTIONS[activeCategory]}
      </Text>
      
      {/* Coin List */}
      <View style={styles.contentContainer}>
        {status === 'loading' && getCoinsForActiveTab().length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading cryptocurrencies...</Text>
          </View>
        ) : status === 'failed' ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load data</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => dispatch(fetchCryptoData())}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlashList
            data={getCoinsForActiveTab()}
            renderItem={renderCryptoItem}
            keyExtractor={keyExtractor}
            horizontal
            showsHorizontalScrollIndicator={false}
            estimatedItemSize={160}
            contentContainerStyle={styles.listContent}
          />
        )}
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
    width: '100%'
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
  tabDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    paddingLeft: 16,
    fontStyle: 'italic',
  },
  contentContainer: {
    height: 160,
    justifyContent: 'center',
  },
  listContent: {
    paddingLeft: 16,
    paddingRight: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryText: {
    color: 'white',
    fontWeight: '500',
  }
});