// src/screens/HomeScreen/TabManager.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { wp } from '../../utils/Responsiveness';
import ResponsiveText from '../../components/common/ResponsiveText';
import { FlashList } from "@shopify/flash-list";
import { FeaturedCoinCard } from './components/FeaturedCoinCard';
import { CoinCard } from './components/CoinCard';
import { TABS, FEATURED_ITEM_WIDTH, ITEM_HEIGHT } from './constants';
import { styles } from './styles';
import { ListHeader } from './components/ListHeader';
import { EmptyState, EmptyFeaturedState } from './components/EmptyState';
import { ListFooter } from './components/ListFooter';
import { OfflineNotice } from './components/OfflineNotice';
import { useCoinsData } from './hooks/useCoinsData';
import { useNetworkStatus } from './hooks/useNetworkStatus';

// A completely rebuilt approach to tabs and scrolling
const TabManager = () => {
    const { theme, isDarkMode } = useTheme();
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    
    const networkStatus = useNetworkStatus();
    const isOffline = networkStatus === 'disconnected';
    
    // Fetch coin data
    const {
        allCoins,
        filteredCoins,
        featuredCoins,
        topGainers,
        topLosers,
        isLoading,
        isRefetching,
        isFetchingNextPage,
        error,
        refetch,
        hasNextPage,
        handleScroll,
        handleScrollBegin,
        handleScrollEnd,
        handleRefresh,
        handleLoadMore
    } = useCoinsData(debouncedSearchQuery, isOffline);
    
    // Get navigation
    const { useNavigation } = require('@react-navigation/native');
    const navigation = useNavigation();
    
    // Import required components
    const { ActivityIndicator, RefreshControl } = require('react-native');
    
    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        
        return () => clearTimeout(handler);
    }, [searchQuery]);
    
    // Tab data mapping - direct simplified approach
    const getCategoryData = useCallback(() => {
        switch (activeTabIndex) {
            case 0: return featuredCoins;
            case 1: return topGainers;
            case 2: return topLosers;
            default: return featuredCoins;
        }
    }, [activeTabIndex, featuredCoins, topGainers, topLosers]);
    
    // Navigation handler
    const navigateToCoin = useCallback((coin) => {
        navigation.navigate('CoinDetail', { coin });
    }, [navigation]);
    
    // Tab change handler
    const handleTabPress = (index) => {
        setActiveTabIndex(index);
    };
    
    // Render Tab Buttons - direct approach without complex components
    const renderTabs = () => {
        return (
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tabStyles.tabsContainer}
            >
                {TABS.map((tab, index) => (
                    <TouchableOpacity
                        key={`tab-${index}-${tab.name}`}
                        style={[
                            tabStyles.tabButton,
                            activeTabIndex === index && tabStyles.activeTabButton
                        ]}
                        onPress={() => handleTabPress(index)}
                        activeOpacity={0.7}
                    >
                        {tab.icon && (
                            <Image 
                                source={tab.icon} 
                                style={tabStyles.tabIcon} 
                            />
                        )}
                        <Text 
                            style={[
                                tabStyles.tabText,
                                activeTabIndex === index && tabStyles.activeTabText
                            ]}
                        >
                            {tab.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };
    
    // Featured coins list - completely direct rendering approach
    const renderFeatured = () => {
        const data = getCategoryData();
        
        if (isLoading && !allCoins.length) {
            return (
                <View style={tabStyles.loaderContainer}>
                    <ActivityIndicator size="large" color={theme.BurjXGreen} />
                </View>
            );
        }
        
        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tabStyles.featuredContainer}
            >
                {data.length > 0 ? (
                    data.map(item => (
                        <FeaturedCoinCard 
                            key={`featured-${item.id}`}
                            item={item} 
                            onPress={navigateToCoin}
                        />
                    ))
                ) : (
                    <EmptyFeaturedState isOffline={isOffline} />
                )}
            </ScrollView>
        );
    };
    
    // Main coin list
    const renderCoinList = () => {
        return (
            <FlashList
                data={filteredCoins}
                renderItem={({ item }) => (
                    <CoinCard item={item} onPress={navigateToCoin} />
                )}
                keyExtractor={(item) => item.id}
                estimatedItemSize={ITEM_HEIGHT}
                initialNumToRender={5}
                onScrollBeginDrag={handleScrollBegin}
                onScrollEndDrag={handleScrollEnd}
                onMomentumScrollBegin={handleScrollBegin}
                onMomentumScrollEnd={handleScrollEnd}
                onScroll={handleScroll}
                scrollEventThrottle={32}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    <EmptyState 
                        searchQuery={debouncedSearchQuery} 
                        isOffline={isOffline}
                    />
                }
                ListFooterComponent={
                    <ListFooter 
                        isFetchingNextPage={isFetchingNextPage} 
                        theme={theme}
                        hasNextPage={hasNextPage}
                    />
                }
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        colors={[theme.BurjXGreen]}
                        tintColor={theme.BurjXGreen}
                        onRefresh={handleRefresh}
                        progressViewOffset={10}
                        progressBackgroundColor={theme.background}
                    />
                }
                removeClippedSubviews={true}
            />
        );
    };
    
    // Main component render
    return (
        <SafeAreaView style={[tabStyles.container, { backgroundColor: theme.background }]}>
            <View style={tabStyles.categoriesSection}>
                {renderTabs()}
                {renderFeatured()}
            </View>
            
            <View style={tabStyles.allCoinsSection}>
                <ListHeader
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    theme={theme}
                    isRefetching={isRefetching}
                />
                
                {renderCoinList()}
            </View>
            
            {isOffline && <OfflineNotice />}
        </SafeAreaView>
    );
};

// Local component imports
const { Image } = require('react-native');

// Dedicated styles just for this component
const tabStyles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#13151A',
    },
    categoriesSection: {
        // backgroundColor: '#1B1B1B',
        paddingTop: 16,
        paddingBottom: 20,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingLeft: wp(5),
        paddingRight: wp(5),
        borderBottomWidth: 0.5,
        // borderBottomColor: '#262626',
        paddingBottom: 16,
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
        borderColor: '#CDFF00',
    },
    tabIcon: {
        width: wp(6),
        height: wp(6),
        marginRight: 5,
    },
    tabText: {
        fontSize: wp(4),
        color: '#898989',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    featuredContainer: {
        paddingLeft: wp(5),
        paddingRight: wp(5),
        paddingTop: 16,
    },
    loaderContainer: {
        height: 170,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    allCoinsSection: {
        flex: 1,
    },
});

export default TabManager;