import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCryptoData } from '../../../store/slices/coinsSlice';
import { CryptoCard } from './CryptoCard';
import { useTheme } from '../../../hooks/useTheme';
import ResponsiveText from '../../../components/common/ResponsiveText';
import { wp } from '../../../utils/Responsiveness';
import { iconPath } from '../../../constants/Icons';
import { useNavigation } from '@react-navigation/native';

const TABS = [
  { icon: iconPath?.starIcon, name: 'Featured', category: 'featured' },
  { icon: iconPath?.Rocket, name: 'Top Gainers', category: 'topGainers' },
  { icon: iconPath?.RedFlag, name: 'Top Losers', category: 'topLosers' },
  // Add more tabs if needed
];

export const CryptoTabs = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigation = useNavigation();
  
  const { featured, topGainers, topLosers, status, lastFetched } = useSelector(state => state.coins);
  
  const activeCategory = useMemo(() => TABS[activeTabIndex].category, [activeTabIndex]);
  
  const coinsForActiveTab = useMemo(() => {
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
  }, [activeCategory, featured, topGainers, topLosers]);
  
  // Initial data fetch
  useEffect(() => {
    const shouldFetch = 
      status === 'idle' || 
      !lastFetched || 
      (Date.now() - lastFetched > 60000); 
      
    if (shouldFetch) {
      dispatch(fetchCryptoData());
    }
    
    // Set up auto-refresh every minute
    const intervalId = setInterval(() => {
      dispatch(fetchCryptoData());
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [dispatch, status, lastFetched]);
  
  const handleTabChange = useCallback((index) => {
    setActiveTabIndex(index);
  }, []);
  
  const renderCryptoItem = useCallback(({ item }) => (
    <CryptoCard coin={item} navigate={navigate}/>
  ), [theme]);

  const navigate=(item)=>{
    navigation.navigate('CoinDetail', { coin: item});
  }
  
  const keyExtractor = useCallback((item) => item.id, []);
  
  const renderTabButton = useCallback((tab, index) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.tabButton,
        activeTabIndex === index && {borderBottomWidth: 2, borderColor: '#CDFF00'},
      ]}
      onPress={() => handleTabChange(index)}
    >
      <Image  source={tab.icon} style={{width:wp(6), height:wp(6)}}/>
      <ResponsiveText margin={[0,0,0,5]} size={'h5'}>
        {tab.name}
      </ResponsiveText>
    </TouchableOpacity>
  ), [activeTabIndex, handleTabChange]);

  const renderContent = useCallback(() => {
    if (status === 'loading' && coinsForActiveTab.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#CDFF00" />
          <Text style={styles.loadingText}>Loading cryptocurrencies...</Text>
        </View>
      );
    } 
    
    if (status === 'failed') {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load data</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => dispatch(fetchCryptoData())}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <FlashList
        data={coinsForActiveTab}
        renderItem={renderCryptoItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        estimatedItemSize={23}
        contentContainerStyle={styles.listContent}
      />
    );
  }, [status, coinsForActiveTab, renderCryptoItem, keyExtractor, dispatch]);
  
  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      {/* Scrollable Tab Bar */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.tabBarContainer}
        style={styles.tabBar}
      >
        {TABS.map(renderTabButton)}
      </ScrollView>
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    width: '100%',
    marginBottom: 16,
  },
  tabBar: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#262626',
    marginBottom: 16,
    flexGrow: 0,paddingLeft:wp(5)
  },
  tabBarContainer: {
    flexDirection: 'row',
    paddingRight: 16, // Add padding to ensure last tab is fully visible
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
  contentContainer: {
    justifyContent: 'center',
    minHeight: 150, // Ensure content area has minimum height even when empty
  },
  listContent: {
    paddingLeft: 16,
    paddingRight: 32,
  },
  loadingContainer: {
    paddingVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#6b7280',
  },
  errorContainer: {
    paddingVertical: 30,
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