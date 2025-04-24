import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useCoinsList } from '../../hooks/useCoinData';
import { theme } from '../../theme';
import { CoinListItem } from '../common/CoinListItem';
import { LoadingIndicator } from '../common/LoadingIndicator';
import { Text } from '../common/Text';
import { Coin } from '../../types';

interface TopLosersTabProps {
  onSelectCoin: (coin: Coin) => void;
}

export const TopLosersTab: React.FC<TopLosersTabProps> = ({ onSelectCoin }) => {
  const { coins, loading, error, refresh, loadMore, hasMore } = useCoinsList('losers');

  if (loading && coins.length === 0) {
    return <LoadingIndicator message="Loading top losers..." />;
  }

  if (error && coins.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="body" color={theme.colors.error}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={coins}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CoinListItem coin={item} onPress={onSelectCoin} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore && loading ? (
            <View style={styles.footer}>
              <LoadingIndicator size="small" />
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: theme.metrics.mediumSpacing,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: theme.metrics.mediumSpacing,
  },
});