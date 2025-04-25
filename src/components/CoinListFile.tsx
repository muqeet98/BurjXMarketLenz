import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    Image
} from 'react-native';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useTheme } from '../hooks/useTheme';
// import { Image } from 'react-native-svg';
import { wp } from '../utils/Responsiveness';
import { LineChart } from 'react-native-wagmi-charts';
import SparklineChart from './common/SparklineChart';
import { SparklineGreen, SparklineRed } from '../constants/svgs';

// Fetch coins from the provided API
const fetchCoinsApi = async ({ pageParam = 1, currency = 'usd' }) => {
    try {
        const response = await axios.get('https://coingeko.burjx.com/coin-prices-all', {
            params: {
                currency,
                page: pageParam,
                pageSize: 15,
            },
            timeout: 15000,
        });
        console.log('API Response:', response.data);
        return response.data.data;
    } catch (error) {
        console.error('API Error:', {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
        });

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

export default function CoinList() {
    const { theme } = useTheme();
    const currency = 'usd';
    const queryClient = useQueryClient();
    const data2 = [50, 10, 40, 95, 85, 91, 35, 53, 24, 50, 70, 85, 95, 100];

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
            return lastPage.length === 15 ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
        // staleTime: 3000,
        // staleTime: 15000,

    });

    // Polling logic to update only prices every 3 seconds
    const updatePrices = useCallback(async () => {
        if (isFetching || isRefetching) return;

        try {
            const newData = await fetchCoinsApi({ pageParam: 1, currency });
            queryClient.setQueryData(['coins', currency], (oldData) => {
                if (!oldData || !oldData.pages || !newData) return oldData;

                // Update prices for the first page only
                const updatedPages = oldData.pages.map((page, index) => {
                    if (index === 0) {
                        return page.map((coin, i) => ({
                            ...coin,
                            currentPrice: newData[i]?.currentPrice ?? coin.currentPrice,
                        }));
                    }
                    return page;
                });

                return {
                    ...oldData,
                    pages: updatedPages,
                };
            });
        } catch (error) {
            console.error('Polling Error:', error.message);
        }
    }, [isFetching, isRefetching, queryClient, currency]);

    useEffect(() => {
        const intervalId = setInterval(updatePrices, 15000);
        return () => clearInterval(intervalId);
    }, [updatePrices]);

    // Handle pull-to-refresh with reset
    const handleRefresh = useCallback(() => {
        // Reset to first page before refetch
        queryClient.setQueryData(['coins', currency], (oldData) => ({
            pages: oldData?.pages?.slice(0, 1) || [],
            pageParams: [1],
        }));
        refetch();
    }, [queryClient, refetch, currency]);

    // Loading state (initial load)
    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.BurjXGreen} style={styles.topIndicator} />
                <Text style={[styles.loadingText, { color: theme.text }]}>Loading coins...</Text>
            </View>
        );
    }

    // Error state with retry option
    if (error) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <Text style={[styles.errorText, { color: theme.error }]}>{error.message}</Text>
                <Text
                    style={[styles.retryText, { color: theme.text }]}
                    onPress={handleRefresh}
                >
                    Tap to retry
                </Text>
            </View>
        );
    }

    // Flatten coin data
    const coins = data?.pages?.flat() ?? [];

    const renderItem = ({ item }) => (
        // <View style={[styles.itemContainer, { borderColor: theme.border, flexDirection: 'row', padding: wp(2) }]}>
        //     <View style={{ width: '50%', borderWidth: 1, borderColor: 'red' }}>
        //         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        //             <Image source={{ uri: item?.image }} style={{ width: wp(7), height: wp(7), borderRadius: wp(30) }} />
        //             <View >
        //                 <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
        //                 <Text style={[styles.price, { color: theme.BurjXGreen }]}>
        //                     {currency.toUpperCase()} ${item.currentPrice ?? 'N/A'}
        //                 </Text>
        //             </View>
        //         </View>
        //         <Text style={[styles.price, { color: theme.BurjXGreen }]}>wefew</Text>
        //     </View>
        //     <View style={{ width: '50%', borderWidth: 1, borderColor: 'green' }}>
        //         <View>
        //         </View>
        //     </View>
        // </View>
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    {/* Replace with your own Bitcoin image if needed */}
                    <View style={styles.iconCircle}>
                        <Image source={{ uri: item?.image }} style={{ width: wp(7), height: wp(7), borderRadius: wp(30) }} />
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.symbol}>BTC</Text>
                        <Text style={styles.name}>Bitcoin</Text>
                    </View>
                </View>
                <View style={styles.percentageContainer}>
                    <Text style={styles.percentageText}>+ 5.42 %</Text>
                </View>
            </View>

            <View style={styles.body}>
                <View style={{ width: '50%', justifyContent:'flex-end', alignItems:'baseline' }}>
                    <Text style={styles.price}>$${item.currentPrice}</Text>
                </View>
                <View style={{ width: '50%' ,height:wp(15)}}>
                    {item?.priceChangePercentage24h >= 0 ?
                        <SparklineGreen /> :
                        <SparklineRed />
                    }
                </View>
            </View>
        </View>
    );

    // Header component for refetching indicator
    const renderHeader = () => (
        isRefetching ? (
            <View style={styles.headerIndicatorContainer}>
                <ActivityIndicator size="small" color={theme.BurjXGreen} />
            </View>
        ) : null
    );

    return (
        <FlatList
            data={coins}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={renderItem}
            initialNumToRender={15}
            maxToRenderPerBatch={15}
            windowSize={10}
            removeClippedSubviews
            onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            }}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={() =>
                isFetchingNextPage ? (
                    <ActivityIndicator size="small" color={theme.BurjXGreen} />
                ) : null
            }
            refreshControl={
                <RefreshControl
                    refreshing={false} // Suppress default spinner
                    colors={[theme.BurjXGreen]}
                    tintColor={theme.BurjXGreen}
                    onRefresh={handleRefresh}
                />
            }
            style={{ backgroundColor: theme.background }}
        />
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
    itemContainer: {
        padding: 12,
        borderBottomWidth: 0.5,
    },
    price: {
        fontSize: 14,
        marginTop: 4,
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
    loadingText: {
        fontSize: 16,
        textAlign: 'center',
    },

    card: {
        backgroundColor: '#1B1B1B',
        borderRadius: 12,
        padding: 20,
        margin: 2,
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
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#CC7722', // Bitcoin Orange
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        marginLeft: 10,
    },
    symbol: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    name: {
        color: '#AAAAAA',
        fontSize: 14,
    },
    percentageContainer: {
        backgroundColor: '#2C2C2C',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    percentageText: {
        color: '#CCFF00',
        fontSize: 14,
    },
    body: {
        marginTop: 20,
        flexDirection: 'row',
        // justifyContent: 'space-between',
        // borderWidth: 1,
        borderColor: 'red',
        // alignItems: 'baseline',
        // alignContent:'flex-end'
    },
    price: {
        alignSelf: 'baseline',
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
    },



});