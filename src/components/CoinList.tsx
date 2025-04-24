import React from 'react';
import { FlatList, StyleSheet, ActivityIndicator, Text, View, RefreshControl } from 'react-native';
import { Coin, TabType } from '../types';
import CoinCard from './CoinCard';
import { useCoinList } from '../hooks/useCoinData';
import { useTheme } from '../hooks/useTheme';

interface CoinListProps {
  tabType: TabType;
  onCoinPress?: (coin: Coin) => void;
}

const CoinList: React.FC<CoinListProps> = ({ tabType, onCoinPress }) => {
  const { theme } = useTheme();
  const { 
    data, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch,
    isRefetching
  } = useCoinList(tabType);
  
  const coins = React.useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.data || []);
  }, [data?.pages]);
  
  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };
  
  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }
  
  if (isError) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Failed to load coins. Please try again.</Text>
      </View>
    );
  }
  
  return (
    <FlatList
      data={coins}
      renderItem={({ item }) => (
        <CoinCard 
          coin={item} 
          onPress={() => onCoinPress?.(item)}
          showDetailsChart={true}
        />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          colors={[theme.accent]}
          tintColor={theme.accent}
        />
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footer}>
            <ActivityIndicator color={theme.accent} />
          </View>
        ) : null
      }
    />
  );
};


const styles = StyleSheet.create({
    listContainer: {
      padding: 16,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    footer: {
      paddingVertical: 20,
      alignItems: 'center',
    },
  });
  
  export default CoinList;