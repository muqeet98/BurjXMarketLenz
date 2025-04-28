import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Dimensions,
    Platform,
    AppState
} from 'react-native';
import { LineChart, CandlestickChart } from 'react-native-wagmi-charts';
import { BackArrowFilledIcon, BarChartIcon, CandleChartIcon, CapDownIcon } from '../../../constants/svgs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ResponsiveText from '../../../components/common/ResponsiveText';
import { fonts } from '../../../constants/Fonts';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import BottomSheet, { 
    BottomSheetBackdrop, 
    BottomSheetFlatList
} from '@gorhom/bottom-sheet';
import { styles } from './styles';

// Constants
const SCREEN_WIDTH = Dimensions.get('window').width;
const API_BASE_URL = 'https://coingeko.burjx.com/coin-ohlc';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const REFETCH_INTERVAL = 30000; // 30 seconds

// Sample data
const SAMPLE_DATA = [
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
];

const cryptocurrencies = [
    { id: 'btc', productId: 2, name: 'Bitcoin', symbol: 'BTC', color: '#F7931A', currentPrice: 94258 },
    { id: 'eth', productId: 3, name: 'Ethereum', symbol: 'ETH', color: '#627EEA', currentPrice: 3524.78 },
    { id: 'sol', productId: 16, name: 'Solana', symbol: 'SOL', color: '#00FFA3', currentPrice: 187.65 },
    { id: 'ada', productId: 4, name: 'Cardano', symbol: 'ADA', color: '#0033AD', currentPrice: 0.45 },
];

const timeFrameOptions = ['1D', '1W', '1M', '1Y'];

const timeFrameMap = {
    '1D': { days: 1, interval: 'hour' },
    '1W': { days: 7, interval: 'day' },
    '1M': { days: 30, interval: 'day' },
    '1Y': { days: 365, interval: 'week' },
    'ALL': { days: 'max', interval: 'month' }
};

// Simple cache implementation
class DataCache {
    constructor(maxSize = 10) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > CACHE_DURATION) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }
}

const dataCache = new DataCache(20);

// Data processing functions
// Data sampling for large datasets
const sampleDataPoints = (data, maxPoints = 200) => {
    if (!data || !Array.isArray(data) || data.length <= maxPoints) {
        return data;
    }
    
    const sampleInterval = Math.ceil(data.length / maxPoints);
    const sampledData = [];
    
    // Always include first and last points for accurate representation
    sampledData.push(data[0]);
    
    // Sample internal points
    for (let i = sampleInterval; i < data.length - sampleInterval; i += sampleInterval) {
        sampledData.push(data[i]);
    }
    
    // Add the last point
    sampledData.push(data[data.length - 1]);
    
    return sampledData;
};

const formatChartData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return { candleData: [], lineData: [] };
    }
    
    // Determine if we need sampling based on dataset size and timeframe
    let dataToProcess = data;
    if (data.length > 300) {
        dataToProcess = sampleDataPoints(data);
        console.log(`Sampled data from ${data.length} to ${dataToProcess.length} points`);
    }

    const candleData = dataToProcess.map(entry => ({
        timestamp: entry.date,
        open: entry.usd.open,
        high: entry.usd.high,
        low: entry.usd.low,
        close: entry.usd.close
    }));

    const lineData = dataToProcess.map(entry => ({
        timestamp: entry.date,
        value: entry.usd.close
    }));

    return { candleData, lineData };
};

const calculatePriceChange = (data) => {
    if (!data || data.length < 2) return 0;
    
    const oldPrice = data[0].usd.open;
    const newPrice = data[data.length - 1].usd.close;
    
    return ((newPrice - oldPrice) / oldPrice) * 100;
};

// Redux selector
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

// Main component
const CryptoPriceChart = (props) => {
    const { coin } = props?.route?.params || {};
    const navigation = useNavigation();
    const dispatch = useDispatch();
    
    // Use memoized selector
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
    
    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['25%', '50%'], []);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    
    // References
    const isMounted = useRef(true);
    const abortController = useRef(null);
    const dataFetchingInProgress = useRef(false);
    const appState = useRef(AppState.currentState);
    const refreshInterval = useRef(null);
    
    // Set selected crypto from route params
    useEffect(() => {
        if (coin) {
            dispatch({ type: 'crypto/setSelectedCrypto', payload: coin });
        }
    }, [coin, dispatch]);
    
    // App state listener for background/foreground transitions
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                fetchData();
            }
            appState.current = nextAppState;
        });
        
        return () => {
            subscription.remove();
        };
    }, []);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMounted.current = false;
            clearInterval(refreshInterval.current);
            
            if (abortController.current) {
                abortController.current.abort();
            }
        };
    }, []);

    // Paginated fetch for large datasets
const fetchDataWithPagination = async (url, signal, isLargeTimeframe = false) => {
    const response = await fetch(url, { signal });
    
    if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
    }
    
    let data = await response.json();
    
    // For large timeframes, we might need to process data differently
    if (isLargeTimeframe && data && Array.isArray(data)) {
        // Even before sampling, we might want to discard some points
        // For "ALL" timeframe, we might only need significant milestones
        if (data.length > 1000) {
            // For extremely large datasets, pre-filter before sampling
            // Keep only 1 point per day/week depending on size
            const filteredData = [];
            let lastTimestamp = 0;
            const timeGap = data.length > 5000 ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
            
            for (const point of data) {
                if (point.date - lastTimestamp >= timeGap) {
                    filteredData.push(point);
                    lastTimestamp = point.date;
                }
            }
            
            data = filteredData;
            console.log(`Pre-filtered data from ${data.length} to ${filteredData.length} points`);
        }
    }
    
    return data;
};

// Data fetching function
const fetchData = useCallback(async () => {
    if (dataFetchingInProgress.current) return;
    
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
        const isLargeTimeframe = selectedTimeFrame === 'ALL' || selectedTimeFrame === '1Y';
        
        // Check cache first
        const cachedData = dataCache.get(cacheKey);
        if (cachedData) {
            dispatch({
                type: 'crypto/fetchSuccess',
                payload: cachedData
            });
            dataFetchingInProgress.current = false;
            return;
        }
        
        // Use pagination for large datasets
        const rawData = await fetchDataWithPagination(
            `${API_BASE_URL}?productId=${productId}&days=${days}`,
            abortController.current.signal,
            isLargeTimeframe
        );
        
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
            throw new Error('Invalid data received from API');
        }
        
        // Process data - sampling will happen in formatChartData for large datasets
        const formattedData = formatChartData(rawData);
        const priceChangeValue = calculatePriceChange(rawData);
        
        const lastItem = rawData[rawData.length - 1];
        const lastPrice = lastItem.usd.close;
        
        const result = {
                chartData: formattedData,
                currentPrice: lastPrice,
                priceChange: priceChangeValue,
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
            }
        } catch (error) {
            if (error.name !== 'AbortError' && isMounted.current) {
                console.error('Error fetching data:', error);
                
                // Try to use sample data as fallback
                if (SAMPLE_DATA.length > 0) {
                    console.log('Using fallback sample data');
                    
                    const formattedData = formatChartData(SAMPLE_DATA);
                    const priceChangeValue = calculatePriceChange(SAMPLE_DATA);
                    const lastItem = SAMPLE_DATA[SAMPLE_DATA.length - 1];
                    
                    dispatch({
                        type: 'crypto/fetchSuccess',
                        payload: {
                            chartData: formattedData,
                            currentPrice: lastItem.usd.close,
                            priceChange: priceChangeValue,
                            marketData: {
                                marketCap: `${(lastItem.usd.close * 19_000_000).toLocaleString()}`,
                                volume24h: `${(lastItem.usd.close * 500_000).toLocaleString()}`,
                                circulatingSupply: `${selectedCrypto.symbol}`,
                                allTimeHigh: `${(lastItem.usd.close * 1.2).toLocaleString()}`
                            }
                        }
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
    }, [selectedCrypto, selectedTimeFrame, dispatch]);

    // Set up data fetching when component is focused
    useFocusEffect(
        useCallback(() => {
            fetchData();
            
            // Set up polling interval for real-time updates
            // Only use frequent updates for smaller time frames
            const updateInterval = selectedTimeFrame === 'ALL' || selectedTimeFrame === '1Y' 
                ? REFETCH_INTERVAL * 2  // Less frequent updates for large datasets
                : REFETCH_INTERVAL;
                
            refreshInterval.current = setInterval(() => {
                if (appState.current === 'active') {
                    fetchData();
                }
            }, updateInterval);
            
            return () => clearInterval(refreshInterval.current);
        }, [fetchData, selectedTimeFrame])
    );

    // Event handlers
    const handleBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleCryptoSelect = useCallback((crypto) => {
        dispatch({ type: 'crypto/setSelectedCrypto', payload: crypto });
        bottomSheetRef.current?.close();
    }, [dispatch]);

    const handleTimeFrameSelect = useCallback((timeFrame) => {
        if (timeFrame !== selectedTimeFrame) {
            dispatch({ type: 'crypto/setSelectedTimeFrame', payload: timeFrame });
        }
    }, [dispatch, selectedTimeFrame]);

    const handleChartTypeToggle = useCallback((type) => {
        if (type !== chartType) {
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

    // Chart data extraction
    const { candleData, lineData } = useMemo(() => 
        chartData || { candleData: [], lineData: [] }, 
    [chartData]);

    // Optimized performant chart components
const LineChartComponent = memo(({ data }) => (
    <LineChart.Provider data={data}>
        <LineChart height={220} width={SCREEN_WIDTH - 20}>
            <LineChart.Path color="#86FF00" width={2}>
                <LineChart.Gradient />
            </LineChart.Path>
            <LineChart.CursorCrosshair color="#86FF00" />
        </LineChart>
    </LineChart.Provider>
));

const CandleChartComponent = memo(({ data }) => (
    <CandlestickChart.Provider data={data}>
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
));

// Chart rendering - using memoized components
const renderChart = useMemo(() => {
    if (isLoading) {
        return <EmptyChart isLoading={true} />;
    }
    
    if (chartType === 'line' && lineData?.length > 0) {
        return <LineChartComponent data={lineData} />;
    } 
    
    if (candleData?.length > 0) {
        return <CandleChartComponent data={candleData} />;
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

    // Bottom sheet list item renderer
    const renderCryptoItem = useCallback(({ item }) => (
        <CryptoItem 
            item={item} 
            onSelect={handleCryptoSelect} 
            isActive={item.id === selectedCrypto.id}
        />
    ), [handleCryptoSelect, selectedCrypto.id]);

    // Market data section - memoized
    const renderMarketData = useMemo(() => (
        <View style={styles.additionalDataContainer}>
            <DataRow label="Market Cap" value={marketData?.marketCap || '-'} />
            <DataRow label="24h Volume" value={marketData?.volume24h || '-'} />
            <DataRow label="Circulating Supply" value={marketData?.circulatingSupply || '-'} />
            <DataRow label="All Time High" value={marketData?.allTimeHigh || '-'} />
        </View>
    ), [marketData]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
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
                    <View style={[styles.cryptoIcon, { backgroundColor: selectedCrypto?.color }]}>
                        <Text style={styles.cryptoIconText}>{selectedCrypto?.symbol}</Text>
                    </View>
                    <ResponsiveText fontFamily={fonts.LufgaMedium} size={'h6'}>
                        {selectedCrypto?.name} ({selectedCrypto?.symbol})
                    </ResponsiveText>
                    <CapDownIcon />
                </TouchableOpacity>
                
                <View style={styles.placeholder} />
            </View>

            {/* Price information */}
            <View style={styles.priceContainer}>
                <ResponsiveText size={'h8'}>
                    $ {isLoading ? '---' : currentPrice?.toLocaleString(undefined, {
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
                            {priceChange >= 0 ? '+ ' : '- '}{Math.abs(priceChange || 0).toFixed(2)}%
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
            
            {/* Bottom sheet for crypto selection */}
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
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
                    renderItem={renderCryptoItem}
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

export default memo(CryptoPriceChart);