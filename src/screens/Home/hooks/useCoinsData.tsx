// src/screens/HomeScreen/hooks/useCoinsData.ts
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchCoinsApi } from '../utils/api';
import { loadCachedData, persistDataToStorage } from '../utils/storage';

// Constants
const REFRESH_INTERVAL = 60000; // Reduced to once per minute (was 30 seconds)
const INITIAL_FETCH_SIZE = 15;

export const useCoinsData = (searchQuery: string, isOffline: boolean) => {
    const queryClient = useQueryClient();
    const currency = 'usd';
    
    // Pagination state
    const [isScrolling, setIsScrolling] = useState(false);
    const [paginationEnabled, setPaginationEnabled] = useState(true);
    
    // Refs for scroll optimization
    const lastContentHeight = useRef(0);
    const lastContentOffsetY = useRef(0);
    const loadingMoreRef = useRef(false);
    const dataFetchInterval = useRef<NodeJS.Timeout | null>(null);
    const isComponentMounted = useRef(true);
    const appStateRef = useRef(AppState.currentState);
    const isRefreshingRef = useRef(false);
    const lastRefreshTime = useRef(0);
    const forceUpdateKey = useRef(0);
    
    // Add throttling for refresh operations
    const shouldRefresh = useCallback(() => {
        const now = Date.now();
        // Don't refresh if less than 5 seconds since last refresh
        if (now - lastRefreshTime.current < 5000) {
            return false;
        }
        
        // Don't refresh if we're already refreshing
        if (isRefreshingRef.current) {
            return false;
        }
        
        lastRefreshTime.current = now;
        return true;
    }, []);
    
    // Main data fetching query with cache support
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
        queryKey: ['coins', currency, forceUpdateKey.current],
        queryFn: async ({ pageParam = 1 }) => {
            // If offline, try to return cached data for initial page
            if (isOffline && pageParam === 1) {
                const cachedData = await loadCachedData();
                if (cachedData) {
                    return cachedData.allCoins;
                }
                throw new Error('You are offline and no cached data is available');
            }
            
            return fetchCoinsApi({ pageParam, currency });
        },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage && lastPage.length === INITIAL_FETCH_SIZE ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
        retry: 2, // Reduced from 3 to avoid excessive retries
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
        staleTime: 120000, // Increased to 2 minutes (was 1 minute)
        gcTime: 300000,   // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: false, // Changed from true to avoid repeated refreshes
        
        onSuccess: (data) => {
            // Persist data to storage when successfully fetched
            if (data.pages.length > 0) {
                const allCoins = data.pages.flat();
                persistDataToStorage(allCoins, data.pageParams[data.pageParams.length - 1] as number);
            }
            
            // Clear the refreshing flag
            isRefreshingRef.current = false;
        },
        onError: () => {
            // Clear the refreshing flag on error too
            isRefreshingRef.current = false;
        }
    });
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isComponentMounted.current = false;
            if (dataFetchInterval.current) {
                clearInterval(dataFetchInterval.current);
                dataFetchInterval.current = null;
            }
        };
    }, []);
    
    // App state monitoring for background/foreground transitions
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            // Only refresh when coming from background to foreground
            if (appStateRef.current.match(/inactive|background/) && 
                nextAppState === 'active' && 
                !isOffline && 
                shouldRefresh()) {
                
                refetchSafely();
            }
            appStateRef.current = nextAppState;
        });
        
        return () => {
            subscription.remove();
        };
    }, [isOffline, shouldRefresh]);
    
    // Safe refetch with flags and throttling
    const refetchSafely = useCallback(() => {
        if (!shouldRefresh()) return;
        
        isRefreshingRef.current = true;
        refetch().catch(() => {
            isRefreshingRef.current = false;
        });
    }, [refetch, shouldRefresh]);
    
    // Set up data polling and refetch on focus - with reduced frequency
    useFocusEffect(
        useCallback(() => {
            // Only fetch on focus if we don't have data yet
            if (!isOffline && !isLoading && !data && shouldRefresh()) {
                refetchSafely();
            }
            
            // Setup polling interval for real-time updates - but with lower frequency
            if (dataFetchInterval.current) {
                clearInterval(dataFetchInterval.current);
            }
            
            dataFetchInterval.current = setInterval(() => {
                if (!isOffline && !isScrolling && 
                    appStateRef.current === 'active' && 
                    shouldRefresh()) {
                    
                    // Use price updates instead of full refetch
                    updatePrices();
                }
            }, REFRESH_INTERVAL);
            
            return () => {
                if (dataFetchInterval.current) {
                    clearInterval(dataFetchInterval.current);
                    dataFetchInterval.current = null;
                }
            };
        }, [isOffline, isLoading, data, isScrolling, shouldRefresh])
    );
    
    // Force a new query when search changes, but don't refetch if search is empty
    useEffect(() => {
        if (searchQuery) {
            lastContentHeight.current = 0;
            lastContentOffsetY.current = 0;
            setPaginationEnabled(true);
            loadingMoreRef.current = false;
        }
    }, [searchQuery]);
    
    // Real-time price update without full refetch
    const updatePrices = useCallback(async () => {
        // Skip updates if already fetching anything
        if (isFetching || isRefetching || isScrolling || isRefreshingRef.current) {
            return;
        }
        
        try {
            isRefreshingRef.current = true;
            const newData = await fetchCoinsApi({ pageParam: 1, currency });
            
            // Only update if we have data and component is still mounted
            if (!isComponentMounted.current || !newData) {
                return;
            }
            
            queryClient.setQueryData(['coins', currency, forceUpdateKey.current], (oldData: { pages: any[]; pageParams: any[] } | undefined) => {
                if (!oldData || !oldData.pages || !oldData.pages.length) return oldData;
                
                const updatedPages = [...oldData.pages];
                
                // Only update existing coins - don't add/remove any
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
            // Silent fail for background updates
            console.log('Background update failed silently');
        } finally {
            isRefreshingRef.current = false;
        }
    }, [isFetching, isRefetching, queryClient, currency, isScrolling]);
    
    // Scroll event handlers - optimized with better flags
    const handleScrollBegin = useCallback(() => {
        if (!isScrolling) {
            setIsScrolling(true);
        }
    }, [isScrolling]);
    
    const handleScrollEnd = useCallback(() => {
        if (isScrolling) {
            // Use requestAnimationFrame for smoother transitions
            requestAnimationFrame(() => {
                if (isComponentMounted.current) {
                    setIsScrolling(false);
                    loadingMoreRef.current = false;
                }
            });
        }
    }, [isScrolling]);
    
    // Optimized scroll handler with reduced work
    const handleScroll = useCallback(event => {
        // Skip all processing if we're already loading or reached the end
        if (!paginationEnabled || isFetchingNextPage || loadingMoreRef.current || !hasNextPage) {
            return;
        }
        
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
        
        // Only check scroll direction if we're near the bottom
        if (distanceFromBottom < layoutMeasurement.height * 0.2) {
            const isScrollingDown = contentOffset.y > lastContentOffsetY.current;
            lastContentOffsetY.current = contentOffset.y;
            
            if (
                isScrollingDown &&
                contentSize.height > lastContentHeight.current &&
                !loadingMoreRef.current
            ) {
                lastContentHeight.current = contentSize.height;
                loadingMoreRef.current = true;
                
                // Fetch next page in the next frame to avoid blocking UI
                requestAnimationFrame(() => {
                    if (isComponentMounted.current) {
                        fetchNextPage().catch(() => {
                            loadingMoreRef.current = false;
                        });
                    }
                });
            }
        }
    }, [hasNextPage, isFetchingNextPage, paginationEnabled, fetchNextPage]);
    
    // Handle list refresh - with forceful data reset
    const handleRefresh = useCallback(() => {
        if (!shouldRefresh()) return;
        
        // Clear pagination cache by incrementing the key
        forceUpdateKey.current += 1;
        
        // Reset scroll position tracking
        lastContentHeight.current = 0;
        lastContentOffsetY.current = 0;
        loadingMoreRef.current = false;
        setPaginationEnabled(true);
        isRefreshingRef.current = true;
        
        // Explicitly invalidate the query instead of just refetching
        return queryClient.invalidateQueries({
            queryKey: ['coins', currency],
            exact: false
        }).then(() => {
            return refetch();
        }).finally(() => {
            isRefreshingRef.current = false;
        });
    }, [queryClient, refetch, currency, shouldRefresh]);
    
    // Handle loading more data - with better debouncing
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && !loadingMoreRef.current && paginationEnabled) {
            loadingMoreRef.current = true;
            
            fetchNextPage().finally(() => {
                // Only disable pagination if we're really at the end
                if (!hasNextPage) {
                    setPaginationEnabled(false);
                }
                
                // Use requestAnimationFrame to reduce UI jank
                requestAnimationFrame(() => {
                    if (isComponentMounted.current) {
                        loadingMoreRef.current = false;
                    }
                });
            });
        }
    }, [hasNextPage, isFetchingNextPage, paginationEnabled, fetchNextPage]);
    
    // Memoized data - with stability optimizations
    const allCoins = useMemo(() => {
        const coins = data?.pages?.flat() ?? [];
        // Ensure stability of the array reference when content is the same
        return coins;
    }, [data?.pages]);
    
    // Stable filtered coins implementation - only recompute when necessary
    const filteredCoins = useMemo(() => {
        if (!searchQuery) {
            return allCoins;
        }
        
        const lowercaseQuery = searchQuery.toLowerCase().trim();
        if (!lowercaseQuery) {
            return allCoins;
        }
        
        return allCoins.filter(coin =>
            coin.name.toLowerCase().includes(lowercaseQuery) ||
            coin.symbol.toLowerCase().includes(lowercaseQuery)
        );
    }, [allCoins, searchQuery]);
    
    // Create stable featured sections that don't change unnecessarily
    const featuredCoins = useMemo(() => {
        return allCoins.slice(0, 5);
    }, [allCoins]);
    
    const topGainers = useMemo(() => {
        if (allCoins.length === 0) return [];
        
        return [...allCoins]
            .sort((a, b) => b.priceChangePercentage24h - a.priceChangePercentage24h)
            .slice(0, 5);
    }, [allCoins]);
    
    const topLosers = useMemo(() => {
        if (allCoins.length === 0) return [];
        
        return [...allCoins]
            .sort((a, b) => a.priceChangePercentage24h - b.priceChangePercentage24h)
            .slice(0, 5);
    }, [allCoins]);
    
    return {
        allCoins,
        filteredCoins,
        featuredCoins,
        topGainers,
        topLosers,
        isLoading,
        isRefetching,
        isFetchingNextPage,
        error,
        refetch: refetchSafely,
        hasNextPage,
        fetchNextPage,
        handleScroll,
        handleScrollBegin,
        handleScrollEnd,
        handleRefresh,
        handleLoadMore,
        // Export forceUpdateKey to help with tab navigation
        forceUpdateKey: forceUpdateKey.current
    };
};