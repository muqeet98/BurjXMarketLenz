import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    Image,
    TextInput,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useTheme } from '../../../hooks/useTheme';
import { wp } from '../../../utils/Responsiveness';
import { SearchCVG, SparklineGreen, SparklineRed } from '../../../constants/svgs';
import ResponsiveText from '../../../components/common/ResponsiveText';
import { fonts } from '../../../constants/Fonts';
import { FlashList } from "@shopify/flash-list";


const ITEM_HEIGHT = wp(20) + 40; 
const INITIAL_RENDER_COUNT = 5;
const END_REACHED_THRESHOLD = 0.2;


const coinApiClient = axios.create({
    baseURL: 'https://coingeko.burjx.com',
    timeout: 15000,
});

const fetchCoinsApi = async ({ pageParam = 1, currency = 'usd' }) => {
    try {
        const response = await coinApiClient.get('/coin-prices-all', {
            params: {
                currency,
                page: pageParam,
                pageSize: 15,
            },
        });
        return response.data.data;
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timed out. Please check your network connection.');
        }
        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (error.response?.status >= 500) {
            throw new Error('Server error. Please try again later.');
        }
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            throw new Error('Cannot reach the server. Please check the API URL or your network.');
        }
        throw new Error('Failed to fetch coins. Please try again.');
    }
};

interface Coin {
    id: string;
    image: string;
    currentPrice: number;
    priceChangePercentage24h: number;
    symbol: string;
    name: string;
}

const CoinCard = React.memo(({ item, theme }: { item: Coin; theme: any }) => {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Image
                            source={{ uri: item?.image }}
                            style={{ width: wp(7), height: wp(7), borderRadius: wp(30) }}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.titleContainer}>
                        <ResponsiveText size={'h5'}>
                            {item?.symbol?.toUpperCase()}
                        </ResponsiveText>
                        <ResponsiveText fontFamily={fonts.LufgaLight} color={'#898989'} size={'h3'}>
                            {item?.name}
                        </ResponsiveText>
                    </View>
                </View>
                <View>
                    <View style={styles.percentageContainer}>
                        <Text style={[
                            styles.percentageText,
                            item?.priceChangePercentage24h < 0 && { color: theme.negative }
                        ]}>
                            {item?.priceChangePercentage24h >= 0 ? '+' : ''}
                            {item?.priceChangePercentage24h?.toFixed(2)}%
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.body}>
                <View style={{ width: '50%', justifyContent: 'flex-end', alignItems: 'baseline' }}>
                    <ResponsiveText size={'h45'}>
                        $ {item.currentPrice?.toLocaleString()}
                    </ResponsiveText>
                </View>
                <View style={{ width: '50%', height: wp(15), alignItems: 'flex-end' }}>
                    {item?.priceChangePercentage24h >= 0 ? <SparklineGreen /> : <SparklineRed />}
                </View>
            </View>
        </View>
    );
});

// Extract ListHeader component to improve rendering
const ListHeader = React.memo(({
    searchQuery,
    setSearchQuery,
    theme,
    isRefetching
}: {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    theme: any;
    isRefetching: boolean;
}) => {
    return (
        <View>
            <View style={styles.searchHeader}>
                <View style={styles.tabContainer}>
                    <ResponsiveText textAlign={'center'} margin={[wp(2), 0, wp(2), 0]} size={'h5'}>All Coins</ResponsiveText>
                </View>
                <View style={styles.searchContainer}>
                    <TextInput
                        placeholder="Search..."
                        placeholderTextColor={theme.secondaryText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={[
                            styles.searchInput,
                            {
                                backgroundColor: theme.cardBackground,
                                color: theme.text,
                            }
                        ]}
                    />
                    <View style={styles.searchIcon}>
                        <SearchCVG />
                    </View>
                </View>
            </View>
            {isRefetching && (
                <View style={styles.headerIndicatorContainer}>
                    <ActivityIndicator size="small" color={theme.BurjXGreen} />
                </View>
            )}
        </View>
    );
});

// Extract empty/footer components
const EmptyListComponent = React.memo(({ searchQuery }: { searchQuery: string }) => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
            {searchQuery ? `No coins found matching "${searchQuery}"` : "No coins available"}
        </Text>
    </View>
));

const ListFooter = React.memo(({ isFetchingNextPage, theme }: { isFetchingNextPage: boolean; theme: any }) => (
    isFetchingNextPage ? (
        <ActivityIndicator
            size="small"
            color={theme.BurjXGreen}
            style={styles.footerLoader}
        />
    ) : null
));

export default function CoinList() {
    const { theme } = useTheme();
    const currency = 'usd';
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [isScrolling, setIsScrolling] = useState(false);
    const [paginationEnabled, setPaginationEnabled] = useState(true);
    const lastContentHeight = React.useRef(0);
    const lastContentOffsetY = React.useRef(0);
    const flashListRef = React.useRef(null);
    const loadingMoreRef = React.useRef(false);

    // Handle scroll events for better performance
    const handleScrollBegin = useCallback(() => {
        setIsScrolling(true);
    }, []);

    const handleScrollEnd = useCallback(() => {
        setTimeout(() => {
            setIsScrolling(false);
            loadingMoreRef.current = false;
        }, 500);
    }, []);

    // Debounce search query for better performance
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch,
        isRefetching,
        isFetching,
    } = useInfiniteQuery({
        queryKey: ['coins', currency],
        queryFn: ({ pageParam = 1 }) => fetchCoinsApi({ pageParam, currency }),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage && lastPage.length === 15 ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
        staleTime: 30000, // Reuse cached data for 30 seconds
    });

    // A reliable custom scroll handler for pagination
    const handleScroll = useCallback(event => {
        if (!paginationEnabled || isFetchingNextPage || loadingMoreRef.current) return;
        
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
        
        // Track direction and only paginate when scrolling down
        const isScrollingDown = contentOffset.y > lastContentOffsetY.current;
        lastContentOffsetY.current = contentOffset.y;
        
        // Only fetch more if:
        // 1. We're scrolling down
        // 2. We're close to the bottom (within 20% of screen height)
        // 3. Content has grown since last check (not an issue with content container)
        // 4. Not currently fetching
        if (
            isScrollingDown && 
            distanceFromBottom < layoutMeasurement.height * 0.2 && 
            contentSize.height > lastContentHeight.current &&
            hasNextPage &&
            !loadingMoreRef.current
        ) {
            lastContentHeight.current = contentSize.height;
            loadingMoreRef.current = true;
            console.log('Fetching next page from scroll handler');
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, paginationEnabled, fetchNextPage]);

    useEffect(() => {
        lastContentHeight.current = 0;
        lastContentOffsetY.current = 0;
        setPaginationEnabled(true);
        loadingMoreRef.current = false;
    }, [debouncedSearchQuery]);

    const updatePrices = useCallback(async () => {
        if (isFetching || isRefetching || isScrolling) return;

        try {
            const newData = await fetchCoinsApi({ pageParam: 1, currency });
            queryClient.setQueryData(['coins', currency], (oldData: { pages: any[]; pageParams: any[] } | undefined) => {
                if (!oldData || !oldData.pages || !newData) return oldData;

                const updatedPages = [...oldData.pages];
                if (updatedPages.length > 0) {
                    updatedPages[0] = updatedPages[0].map(coin => {
                        const updatedCoin = newData.find(c => c.id === coin.id);
                        if (updatedCoin) {
                            return {
                                ...coin,
                                currentPrice: updatedCoin.currentPrice,
                                priceChangePercentage24h: updatedCoin.priceChangePercentage24h
                            };
                        }
                        return coin;
                    });
                }

                return {
                    ...oldData,
                    pages: updatedPages,
                };
            });
        } catch (error) {
            // console.error('Polling Error:', error.message);
        }
    }, [isFetching, isRefetching, queryClient, currency, isScrolling]);

    useEffect(() => {
        const intervalId = setInterval(updatePrices, 15000);
        return () => clearInterval(intervalId);
    }, [updatePrices]);

    const handleRefresh = useCallback(() => {
        queryClient.setQueryData(['coins', currency], (oldData) => ({
            pages: oldData?.pages?.slice(0, 1) || [],
            pageParams: [1],
        }));
        lastContentHeight.current = 0;
        lastContentOffsetY.current = 0;
        loadingMoreRef.current = false;
        setPaginationEnabled(true);
        refetch();
    }, [queryClient, refetch, currency]);

    // Manual pagination handler as a backup
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && !loadingMoreRef.current && paginationEnabled) {
            loadingMoreRef.current = true;
            console.log('Fetching next page from manual handler');
            fetchNextPage().finally(() => {
                // Reset if we're at the end
                if (!hasNextPage) {
                    setPaginationEnabled(false);
                }
                
                // Allow more fetches after a delay
                setTimeout(() => {
                    loadingMoreRef.current = false;
                }, 1000);
            });
        }
    }, [hasNextPage, isFetchingNextPage, paginationEnabled, fetchNextPage]);

    const coins = useMemo(() => {
        const allCoins: Coin[] = data?.pages?.flat() ?? [];

        if (!debouncedSearchQuery) return allCoins;

        return allCoins.filter(coin =>
            coin.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
    }, [data?.pages, debouncedSearchQuery]);

    const keyExtractor = useCallback((item: Coin) =>
        item.id?.toString() || Math.random().toString()
    , []);

    const renderItem = useCallback(({ item }: { item: Coin }) => (
        <CoinCard item={item} theme={theme} />
    ), [theme]);

    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.BurjXGreen} style={styles.topIndicator} />
                <ResponsiveText size={'h6'}>Loading Coins...</ResponsiveText>
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <Text style={[styles.errorText, { color: theme.negative }]}>{error.message}</Text>
                <Text
                    style={[styles.retryText, { color: theme.text }]}
                    onPress={handleRefresh}
                >
                    Tap to retry
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <FlashList
                ref={flashListRef}
                data={coins}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                estimatedItemSize={ITEM_HEIGHT}
                initialNumToRender={INITIAL_RENDER_COUNT}
                onScrollBeginDrag={handleScrollBegin}
                onScrollEndDrag={handleScrollEnd}
                onMomentumScrollBegin={handleScrollBegin}
                onMomentumScrollEnd={handleScrollEnd}
                onScroll={handleScroll}
                scrollEventThrottle={16} 
                onEndReached={handleLoadMore} 
                onEndReachedThreshold={0.1} 
                extraData={[coins.length, isFetchingNextPage, paginationEnabled]}
                ListHeaderComponent={
                    <ListHeader 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        theme={theme}
                        isRefetching={isRefetching}
                    />
                }
                ListEmptyComponent={<EmptyListComponent searchQuery={debouncedSearchQuery} />}
                ListFooterComponent={
                    <>
                        <ListFooter isFetchingNextPage={isFetchingNextPage} theme={theme} />
                        {coins.length > 0 && !isFetchingNextPage && hasNextPage && (
                            <TouchableOpacity 
                                onPress={handleLoadMore} 
                                style={styles.loadMoreButton}
                                disabled={isFetchingNextPage || !paginationEnabled}
                            >
                                <Text style={styles.loadMoreText}>Load More</Text>
                            </TouchableOpacity>
                        )}
                    </>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        colors={[theme.BurjXGreen]}
                        tintColor={theme.BurjXGreen}
                        onRefresh={handleRefresh}
                    />
                }
                drawDistance={ITEM_HEIGHT * 5} // Reduced for better performance
                contentContainerStyle={{ 
                    paddingBottom: wp(20), // More padding at bottom
                    minHeight: '100%', // Important for short lists
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerIndicatorContainer: {
        padding: 10,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    topIndicator: {
        marginBottom: 10,
    },
    errorText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    retryText: {
        marginTop: 10,
        fontSize: 16,
        textDecorationLine: 'underline',
    },

    card: {
        backgroundColor: '#1B1B1B',
        borderRadius: 12,
        padding: 20,
        paddingVertical: 15,
        marginVertical: 2,
        width: '90%',
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: wp(8),
        height: wp(8),
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        marginLeft: 10,
    },
    body: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    percentageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2C2C2C',
        padding: 5,
        borderRadius: 5
    },
    percentageText: {
        fontWeight: 'bold',
        color: '#4CAF50',
        fontFamily: fonts.LufgaRegular,
        fontSize: wp(3)
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    searchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        marginTop: wp(5),
        marginBottom: wp(2)
    },
    tabContainer: {
        width: '35%',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#4CAF50',
        justifyContent: 'center'
    },
    searchContainer: {
        borderRadius: wp(20),
        width: '55%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative'
    },
    searchInput: {
        padding: wp(3),
        paddingRight: wp(10),
        paddingLeft: wp(5),
        height: wp(12),
        borderRadius: wp(20),
        fontSize: wp(4),
        width: '100%'
    },
    searchIcon: {
        position: 'absolute',
        right: wp(3)
    },
    emptyContainer: {
        padding: wp(10),
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyText: {
        color: '#898989',
        fontSize: wp(4),
        textAlign: 'center'
    },
    footerLoader: {
        marginVertical: wp(5)
    },
    loadMoreButton: {
        backgroundColor: '#2C2C2C',
        padding: wp(3),
        borderRadius: wp(5),
        alignItems: 'center',
        marginVertical: wp(5),
        width: '50%',
        alignSelf: 'center',
    },
    loadMoreText: {
        color: '#FFFFFF',
        fontSize: wp(4),
        fontFamily: fonts.LufgaRegular,
    }
});