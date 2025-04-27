import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Dimensions,
    InteractionManager,
    Platform,
    AppState,
    UIManager,
    LayoutAnimation
} from 'react-native';
import { LineChart, CandlestickChart } from 'react-native-wagmi-charts';
import { BackArrowFilledIcon, BarChartIcon, CandleChartIcon, CapDownIcon } from '../../../constants/svgs';
import { wp } from '../../../utils/Responsiveness';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ResponsiveText from '../../../components/common/ResponsiveText';
import { fonts } from '../../../constants/Fonts';
import { FlashList } from '@shopify/flash-list';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import BottomSheet, { 
    BottomSheetBackdrop, 
    BottomSheetFlatList
} from '@gorhom/bottom-sheet';
import { styles } from './styles';
// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Constants
const SCREEN_WIDTH = Dimensions.get('window').width;
const API_BASE_URL = 'https://coingeko.burjx.com/coin-ohlc';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const REFETCH_INTERVAL = 30000; // 30 seconds
const ITEMS_PER_PAGE = 100; // For paginated data loading

// Sample data (frozen to prevent mutations)
const SAMPLE_DATA = Object.freeze([
    {
        "date": 1745672400000,
        "usd": { "open": 94345, "high": 94345, "low": 94251, "close": 94258 },
        "aed": { "open": 346528, "high": 346528, "low": 346184, "close": 346211 }
    },
    {
        "date": 1745674200000,
        "usd": { "open": 94262, "high": 94296, "low": 94218, "close": 94218 },
        "aed": { "open": 346223, "high": 346348, "low": 346064, "close": 346064 }
    }
]);

const cryptocurrencies = Object.freeze([
    { id: 'btc', productId: 2, name: 'Bitcoin', symbol: 'BTC', color: '#F7931A', currentPrice: 94258 },
    { id: 'eth', productId: 3, name: 'Ethereum', symbol: 'ETH', color: '#627EEA', currentPrice: 3524.78 },
    { id: 'sol', productId: 16, name: 'Solana', symbol: 'SOL', color: '#00FFA3', currentPrice: 187.65 },
    { id: 'ada', productId: 4, name: 'Cardano', symbol: 'ADA', color: '#0033AD', currentPrice: 0.45 },
]);

const timeFrameOptions = Object.freeze(['1D', '1W', '1M', '1Y', 'ALL']);

const timeFrameMap = Object.freeze({
    '1D': { days: 1, interval: 'hour' },
    '1W': { days: 7, interval: 'day' },
    '1M': { days: 30, interval: 'day' },
    '1Y': { days: 365, interval: 'week' },
    'ALL': { days: 'max', interval: 'month' }
});

class LRUCache {
    constructor(maxSize = 10) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) return null;
        
        const item = this.cache.get(key);
        
        // Check if the item is still valid
        if (Date.now() - item.timestamp > CACHE_DURATION) {
            this.cache.delete(key);
            return null;
        }
        
        // Refresh item position (most recently used)
        this.cache.delete(key);
        this.cache.set(key, item);
        
        return item.value;
    }

    set(key, value) {
        // If cache is full, remove the least recently used item
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    clear() {
        this.cache.clear();
    }
}

const dataCache = new LRUCache(20);

const setupWorker = () => {
    if (typeof Worker !== 'undefined') {
        const worker = new Worker(
            URL.createObjectURL(
                new Blob([
                    `
                    self.onmessage = function(e) {
                        const { type, data } = e.data;
                        
                        if (type === 'formatChartData') {
                            const result = formatChartData(data);
                            self.postMessage({ type: 'chartDataFormatted', result });
                        } else if (type === 'calculatePriceChange') {
                            const result = calculatePriceChange(data);
                            self.postMessage({ type: 'priceChangeCalculated', result });
                        }
                    };
                    
                    function formatChartData(data) {
                        if (!data || !Array.isArray(data) || data.length === 0) {
                            return { candleData: [], lineData: [] };
                        }
                    
                        const candleData = data.map(entry => ({
                            timestamp: entry.date,
                            open: entry.usd.open,
                            high: entry.usd.high,
                            low: entry.usd.low,
                            close: entry.usd.close
                        }));
                    
                        const lineData = data.map(entry => ({
                            timestamp: entry.date,
                            value: entry.usd.close
                        }));
                    
                        return { candleData, lineData };
                    }
                    
                    function calculatePriceChange(data) {
                        if (!data || data.length < 2) return 0;
                        const oldPrice = data[0].usd.open;
                        const newPrice = data[data.length - 1].usd.close;
                        return ((newPrice - oldPrice) / oldPrice) * 100;
                    }
                    `
                ], { type: 'application/javascript' })
            )
        );
        
        return worker;
    }
    
    return null;
};

// Fallback data processing functions (when worker is not available)
const formatChartData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return { candleData: [], lineData: [] };
    }

    const totalItems = data.length;
    const chunkSize = 50;
    const candleData = [];
    const lineData = [];

    for (let i = 0; i < totalItems; i += chunkSize) {
        const chunk = data.slice(i, Math.min(i + chunkSize, totalItems));
        
        for (let j = 0; j < chunk.length; j++) {
            const entry = chunk[j];
            
            candleData.push({
                timestamp: entry.date,
                open: entry.usd.open,
                high: entry.usd.high,
                low: entry.usd.low,
                close: entry.usd.close
            });
            
            lineData.push({
                timestamp: entry.date,
                value: entry.usd.close
            });
        }
    }

    return { candleData, lineData };
};

const calculatePriceChange = (data) => {
    if (!data || data.length < 2) return 0;
    
    const oldPrice = data[0].usd.open;
    const newPrice = data[data.length - 1].usd.close;
    
    return ((newPrice - oldPrice) / oldPrice) * 100;
};

// Redux selector for performance optimization
const selectCryptoData = createSelector(
    state => state.crypto.selectedCrypto,
    state => state.crypto.selectedTimeFrame,
    state => state.crypto.chartType,
    state => state.crypto.isLoading,
    state => state.crypto.chartData,
    state => state.crypto.currentPrice,
    state => state.crypto.priceChange,
    state => state.crypto.marketData,
    (
        selectedCrypto,
        selectedTimeFrame,
        chartType,
        isLoading,
        chartData,
        currentPrice,
        priceChange,
        marketData
    ) => ({
        selectedCrypto,
        selectedTimeFrame,
        chartType,
        isLoading,
        chartData,
        currentPrice,
        priceChange,
        marketData
    })
);

// Optimized components
const EmptyChart = memo(({ isLoading }) => (
    <View style={styles.emptyChart}>
        {isLoading ? (
            <ActivityIndicator size="large" color="#86FF00" />
        ) : (
            <Text style={styles.emptyChartText}>No data available</Text>
        )}
    </View>
));

const ChartToggleButton = memo(({ active, onPress, children }) => (
    <TouchableOpacity
        style={[styles.toggleButton, active && styles.activeToggle]}
        onPress={onPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
        {children}
    </TouchableOpacity>
));

const TimeFrameButton = memo(({ timeFrame, isSelected, onPress, isDisabled }) => (
    <TouchableOpacity
        style={[
            styles.timeFrameButton,
            isSelected && styles.selectedTimeFrame
        ]}
        onPress={onPress}
        disabled={isDisabled}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
    >
        <ResponsiveText 
            size={'h12'} 
            color={isSelected ? '#000' : '#8D8D8D'}
        >
            {timeFrame}
        </ResponsiveText>
    </TouchableOpacity>
));

const DataRow = memo(({ label, value }) => (
    <View style={styles.dataRow}>
        <Text style={styles.dataLabel}>{label}</Text>
        <Text style={styles.dataValue}>{value}</Text>
    </View>
));

const CryptoItem = memo(({ item, onSelect, isActive }) => (
    <TouchableOpacity
        style={[styles.cryptoItem, isActive && styles.activeCryptoItem]}
        onPress={() => onSelect(item)}
    >
        <View style={[styles.cryptoIcon, { backgroundColor: item.color }]}>
            <Text style={styles.cryptoIconText}>{item.symbol}</Text>
        </View>
        <Text style={styles.cryptoItemName}>{item.name} ({item.symbol})</Text>
    </TouchableOpacity>
));

// Main component implementation
const CryptoPriceChart = (props) => {
    const {coin} = props?.route?.params;
    const navigation = useNavigation();
    const dispatch = useDispatch();

    
    // Use memoized selector instead of multiple useSelector calls
    const {
        selectedCrypto,
        selectedTimeFrame,
        chartType,
        isLoading,
        chartData,
        currentPrice,
        priceChange,
        marketData
    } = useSelector(selectCryptoData);
    
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    
    const bottomSheetRef = useRef(null);
    const initialSnapPoints = useMemo(() => ['25%', '50%'], []);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    
    useEffect(() => {
        if (coin) {
                dispatch({ type: 'crypto/setSelectedCrypto', payload: coin });
        }
    }, [coin, dispatch]);
    
    const isMounted = useRef(true);
    const abortController = useRef(null);
    const worker = useRef(null);
    const dataFetchingInProgress = useRef(false);
    const appState = useRef(AppState.currentState);
    const refreshInterval = useRef(null);
    
    useEffect(() => {
        worker.current = setupWorker();
        
        return () => {
            if (worker.current) {
                worker.current.terminate();
            }
        };
    }, []);
    
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) && 
                nextAppState === 'active'
            ) {
                fetchData();
            }
            
            appState.current = nextAppState;
        });
        
        return () => {
            subscription.remove();
        };
    }, []);
    
    // Component lifecycle management
    useEffect(() => {
        return () => {
            isMounted.current = false;
            clearInterval(refreshInterval.current);
            
            if (abortController.current) {
                abortController.current.abort();
            }
        };
    }, []);

    const processData = useCallback((rawData) => {
        return new Promise((resolve) => {
            if (worker.current) {
                const messageHandler = (e) => {
                    const { type, result } = e.data;
                    
                    if (type === 'chartDataFormatted') {
                        worker.current.postMessage({
                            type: 'calculatePriceChange',
                            data: rawData
                        });
                    } else if (type === 'priceChangeCalculated') {
                        worker.current.removeEventListener('message', messageHandler);
                        resolve({
                            formattedData: result.formattedData,
                            priceChange: result.priceChange
                        });
                    }
                };
                
                worker.current.addEventListener('message', messageHandler);
                worker.current.postMessage({
                    type: 'formatChartData',
                    data: rawData
                });
            } else {
                InteractionManager.runAfterInteractions(() => {
                    const formattedData = formatChartData(rawData);
                    const change = calculatePriceChange(rawData);
                    resolve({
                        formattedData,
                        priceChange: change
                    });
                });
            }
        });
    }, []);

    const fetchData = useCallback(async () => {
        if (dataFetchingInProgress.current) {
            return;
        }
        
        if (abortController.current) {
            abortController.current.abort();
        }
        
        abortController.current = new AbortController();
        dataFetchingInProgress.current = true;
        
        try {
            dispatch({ type: 'crypto/fetchStart' });
            
            const { productId } = selectedCrypto;
            const { days } = timeFrameMap[selectedTimeFrame];
            const cacheKey = `${productId}-${days}`;
            
            const cachedData = dataCache.get(cacheKey);
            if (cachedData) {
                dispatch({
                    type: 'crypto/fetchSuccess',
                    payload: cachedData
                });
                
                if (isInitialLoad) {
                    setIsInitialLoad(false);
                }
                
                dataFetchingInProgress.current = false;
                return;
            }
            
            const response = await fetch(
                `${API_BASE_URL}?productId=${productId}&days=${days}`,
                { signal: abortController.current.signal }
            );
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }
            
            const rawData = await response.json();
            
            if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
                throw new Error('Invalid data received from API');
            }
            
            const { formattedData, priceChange } = await processData(rawData);
            
            const lastItem = rawData[rawData.length - 1];
            const lastPrice = lastItem.usd.close;
            const aedPrice = lastItem.aed.close;
            
            const result = {
                chartData: formattedData,
                currentPrice: lastPrice,
                priceChange,
                marketData: {
                    marketCap: `${(lastPrice * 19_000_000).toLocaleString()}`,
                    volume24h: `${(lastPrice * 500_000).toLocaleString()}`,
                    circulatingSupply: `${selectedCrypto.symbol}`,
                    allTimeHigh: `${(lastPrice * 1.2).toLocaleString()}`
                }
            };
            
            // Cache the result
            dataCache.set(cacheKey, result);
            
            // Update Redux only if component is still mounted
            if (isMounted.current) {
                dispatch({
                    type: 'crypto/fetchSuccess',
                    payload: result
                });
                
                if (isInitialLoad) {
                    setIsInitialLoad(false);
                }
            }
        } catch (error) {
            if (error.name !== 'AbortError' && isMounted.current) {
                console.error('Error fetching data:', error);
                
                // Try to use sample data as fallback
                if (SAMPLE_DATA.length > 0) {
                    console.log('Using fallback sample data');
                    
                    const { formattedData, priceChange } = await processData(SAMPLE_DATA);
                    const lastItem = SAMPLE_DATA[SAMPLE_DATA.length - 1];
                    
                    const fallbackResult = {
                        chartData: formattedData,
                        currentPrice: lastItem.usd.close,
                        priceChange,
                        marketData: {
                            marketCap: `${(lastItem.usd.close * 19_000_000).toLocaleString()}`,
                            volume24h: `${(lastItem.usd.close * 500_000).toLocaleString()}`,
                            circulatingSupply: `${selectedCrypto.symbol}`,
                            allTimeHigh: `${(lastItem.usd.close * 1.2).toLocaleString()}`
                        }
                    };
                    
                    dispatch({
                        type: 'crypto/fetchSuccess',
                        payload: fallbackResult
                    });
                } else {
                    dispatch({
                        type: 'crypto/fetchError',
                        payload: error.message
                    });
                }
            }
        } finally {
            dataFetchingInProgress.current = false;
        }
    }, [selectedCrypto, selectedTimeFrame, dispatch, processData, isInitialLoad]);

    // Set up data fetching when component is focused
    useFocusEffect(
        useCallback(() => {
            // Fetch immediately when focused
            fetchData();
            
            // Set up polling interval for real-time updates
            refreshInterval.current = setInterval(() => {
                if (appState.current === 'active') {
                    fetchData();
                }
            }, REFETCH_INTERVAL);
            
            return () => {
                clearInterval(refreshInterval.current);
            };
        }, [fetchData])
    );

    // Event handlers - memoized with useCallback
    const handleBackPress = useCallback(() => {
        // Use LayoutAnimation for smooth transition
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        navigation.goBack();
    }, [navigation]);

    const handleCryptoSelect = useCallback((crypto) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        dispatch({ type: 'crypto/setSelectedCrypto', payload: crypto });
        bottomSheetRef.current?.close();
    }, [dispatch]);

    const handleTimeFrameSelect = useCallback((timeFrame) => {
        if (timeFrame !== selectedTimeFrame) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            dispatch({ type: 'crypto/setSelectedTimeFrame', payload: timeFrame });
        }
    }, [dispatch, selectedTimeFrame]);

    const handleChartTypeToggle = useCallback((type) => {
        if (type !== chartType) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            dispatch({ type: 'crypto/setChartType', payload: type });
        }
    }, [dispatch, chartType]);

    const handleBottomSheetOpen = useCallback(() => {
        bottomSheetRef.current?.expand();
    }, []);

    // Bottom sheet callbacks
    const handleSheetChanges = useCallback((index) => {
        setIsBottomSheetOpen(index > 0);
    }, []);

    const renderBackdrop = useCallback(
        props => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior={'close'}
            />
        ),
        []
    );

    const { candleData, lineData } = useMemo(() => chartData || { candleData: [], lineData: [] }, [chartData]);

    const renderChart = useMemo(() => {
        if (isLoading) {
            return <EmptyChart isLoading={true} />;
        }
        if (chartType === 'line' && lineData && lineData.length > 0) {
            return (
                <LineChart.Provider data={lineData}>
                    <LineChart height={220} width={SCREEN_WIDTH - 20}>
                        <LineChart.Path color="#86FF00" width={2}>
                            <LineChart.Gradient />
                        </LineChart.Path>
                        <LineChart.CursorCrosshair color="#86FF00" />
                    </LineChart>
                </LineChart.Provider>
            );
        } 
        
        if (candleData && candleData.length > 0) {
            return (
                <CandlestickChart.Provider data={candleData}>
                    <CandlestickChart height={220} width={SCREEN_WIDTH - 20}>
                        <CandlestickChart.Candles
                            positiveColor="#86FF00"
                            negativeColor="#FF4D4D"
                            wickColor="white"
                        />
                        <CandlestickChart.Crosshair>
                            <CandlestickChart.Tooltip />
                        </CandlestickChart.Crosshair>
                    </CandlestickChart>
                </CandlestickChart.Provider>
            );
        }
        
        return <EmptyChart isLoading={false} />;
    }, [chartType, lineData, candleData, isLoading]);

    // Memoized time frame buttons
    const renderTimeFrameButtons = useMemo(() => (
        <View style={styles.timeFrameContainer}>
            {timeFrameOptions.map((timeFrame) => (
                <TimeFrameButton
                    key={timeFrame}
                    timeFrame={timeFrame}
                    isSelected={selectedTimeFrame === timeFrame}
                    onPress={() => handleTimeFrameSelect(timeFrame)}
                    isDisabled={isLoading}
                />
            ))}
        </View>
    ), [selectedTimeFrame, handleTimeFrameSelect, isLoading]);

    // Memoized crypto list (for bottom sheet)
    const renderCryptoList = useCallback(({ item }) => (
        <CryptoItem 
            item={item} 
            onSelect={handleCryptoSelect} 
            isActive={item.id === selectedCrypto.id}
        />
    ), [handleCryptoSelect, selectedCrypto.id]);

    const renderMarketData = useMemo(() => (
        <View style={styles.additionalDataContainer}>
            <DataRow label="Market Cap" value={marketData.marketCap} />
            <DataRow label="24h Volume" value={marketData.volume24h} />
            <DataRow label="Circulating Supply" value={marketData.circulatingSupply} />
            <DataRow label="All Time High" value={marketData.allTimeHigh} />
        </View>
    ), [marketData]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity 
                    activeOpacity={0.8} 
                    onPress={handleBackPress}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <BackArrowFilledIcon />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.cryptoSelector}
                    onPress={handleBottomSheetOpen}
                    activeOpacity={0.7}
                >
                    <View style={[styles.cryptoIcon, { backgroundColor: selectedCrypto.color }]}>
                        <Text style={styles.cryptoIconText}>{selectedCrypto.symbol}</Text>
                    </View>
                    <ResponsiveText fontFamily={fonts.LufgaMedium} size={'h6'}>
                        {selectedCrypto.name} ({selectedCrypto.symbol})
                    </ResponsiveText>
                    <CapDownIcon />
                </TouchableOpacity>
                <View style={styles.placeholder} />
            </View>

            {/* Price information */}
            <View style={styles.priceContainer}>
                <ResponsiveText size={'h8'}>
                    $ {isLoading ? '---' : currentPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </ResponsiveText>

                <View style={{ alignItems: 'flex-start' }}>
                    <View style={styles.changeContainer}>
                        <Text style={[
                            styles.changeText,
                            { color: priceChange >= 0 ? '#86FF00' : '#FF4D4D' }
                        ]}>
                            {priceChange >= 0 ? '+ ' : '- '}{Math.abs(priceChange).toFixed(2)}%
                        </Text>
                    </View>
                </View>
            </View>

            {/* Chart type toggle */}
            <View style={styles.chartToggle}>
                <ChartToggleButton
                    active={chartType === 'line'}
                    onPress={() => handleChartTypeToggle('line')}
                >
                    <BarChartIcon />
                </ChartToggleButton>
                <ChartToggleButton
                    active={chartType === 'candle'}
                    onPress={() => handleChartTypeToggle('candle')}
                >
                    <CandleChartIcon />
                </ChartToggleButton>
            </View>

            {/* Chart area */}
            <View style={styles.chartContainer}>
                {renderChart}
            </View>

            {renderTimeFrameButtons}
            {renderMarketData}
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={initialSnapPoints}
                onChange={handleSheetChanges}
                enablePanDownToClose={true}
                backgroundStyle={styles.bottomSheetBackground}
                handleIndicatorStyle={styles.bottomSheetIndicator}
                backdropComponent={renderBackdrop}
            >
                <View style={styles.bottomSheetHeader}>
                    <Text style={styles.bottomSheetTitle}>Select Cryptocurrency</Text>
                </View>
                <BottomSheetFlatList
                    data={cryptocurrencies}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCryptoList}
                    contentContainerStyle={styles.bottomSheetContent}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={4}
                    maxToRenderPerBatch={4}
                    windowSize={2}
                    removeClippedSubviews={Platform.OS === 'android'}
                />
            </BottomSheet>
        </SafeAreaView>
    );
};

// Optimized styles with exact dimensions

// Export memoized component
export default memo(CryptoPriceChart);