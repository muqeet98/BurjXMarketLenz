import { createSlice } from '@reduxjs/toolkit';

// Default cryptocurrency data
const defaultCrypto = { 
    id: 'btc', 
    productId: 2, 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    color: '#F7931A', 
    currentPrice: 94258 
};

// Initial state
const initialState = {
    selectedCrypto: defaultCrypto,
    selectedTimeFrame: '1D',
    chartType: 'line',
    isLoading: false,
    error: null,
    chartData: { candleData: [], lineData: [] },
    currentPrice: defaultCrypto.currentPrice,
    priceChange: 0,
    marketData: {
        marketCap: '-',
        volume24h: '-',
        circulatingSupply: '-',
        allTimeHigh: '-'
    },
    // New fields for storage integration
    lastUpdated: null,
    dataSource: null, // 'cache', 'database', 'api', or 'fallback'
    isBackgroundRefreshing: false
};

// Create slice
const cryptoSlice = createSlice({
    name: 'crypto',
    initialState,
    reducers: {
        setSelectedCrypto: (state, action) => {
            state.selectedCrypto = action.payload;
            state.isLoading = true;
            state.error = null;
            // Reset chart data when switching cryptos
            state.chartData = { candleData: [], lineData: [] };
        },
        setSelectedTimeFrame: (state, action) => {
            state.selectedTimeFrame = action.payload;
            state.isLoading = true;
            state.error = null;
            // Keep old chart data visible while loading new data
        },
        setChartType: (state, action) => {
            state.chartType = action.payload;
        },
        fetchStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        fetchSuccess: (state, action) => {
            const { chartData, currentPrice, priceChange, marketData, dataSource } = action.payload;
            state.chartData = chartData;
            state.currentPrice = currentPrice;
            state.priceChange = priceChange;
            state.marketData = marketData;
            state.isLoading = false;
            state.lastUpdated = Date.now();
            state.dataSource = dataSource || 'api'; // Default to 'api' if not specified
        },
        fetchError: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        backgroundRefreshStart: (state) => {
            state.isBackgroundRefreshing = true;
        },
        backgroundRefreshComplete: (state, action) => {
            const { chartData, currentPrice, priceChange, marketData } = action.payload;
            // Update data but don't change loading state
            state.chartData = chartData;
            state.currentPrice = currentPrice;
            state.priceChange = priceChange;
            state.marketData = marketData;
            state.lastUpdated = Date.now();
            state.isBackgroundRefreshing = false;
            state.dataSource = 'api';
        },
        // Used when data is loaded from storage
        cachedDataLoaded: (state, action) => {
            const { chartData, currentPrice, priceChange, marketData, source } = action.payload;
            state.chartData = chartData;
            state.currentPrice = currentPrice;
            state.priceChange = priceChange;
            state.marketData = marketData;
            state.isLoading = false;
            state.dataSource = source || 'cache';
            state.lastUpdated = Date.now();
        }
    }
});

// Export actions and reducer
export const { 
    setSelectedCrypto, 
    setSelectedTimeFrame, 
    setChartType,
    fetchStart,
    fetchSuccess,
    fetchError,
    backgroundRefreshStart,
    backgroundRefreshComplete,
    cachedDataLoaded
} = cryptoSlice.actions;

export default cryptoSlice.reducer;

// Thunks for async operations with storage integration
import { getCryptoData } from '../utils/crypto-storage-utils';

// Thunk to fetch crypto data with storage integration
export const fetchCryptoData = (cryptoId, productId, timeframe) => async (dispatch) => {
    dispatch(fetchStart());
    
    try {
        // Use our storage utility to get data from the best source
        const result = await getCryptoData(
            cryptoId, 
            productId, 
            timeframe,
            async (id, prodId, tf) => {
                // This is the API fetch function that will be called if needed
                const response = await fetch(
                    `https://coingeko.burjx.com/coin-ohlc?productId=${prodId}&days=${
                        tf === '1D' ? 1 : 
                        tf === '1W' ? 7 : 
                        tf === '1M' ? 30 : 
                        tf === '1Y' ? 365 : 'max'
                    }`
                );
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                return await response.json();
            }
        );
        
        const { data, source, needsRefresh } = result;
        
        // Format the data for the chart
        const formattedData = formatChartData(data);
        const priceChangeValue = calculatePriceChange(data);
        const lastItem = data[data.length - 1];
        
        // Dispatch success with the source information
        dispatch(fetchSuccess({
            chartData: formattedData,
            currentPrice: lastItem.usd.close,
            priceChange: priceChangeValue,
            marketData: {
                marketCap: `${(lastItem.usd.close * 19_000_000).toLocaleString()}`,
                volume24h: `${(lastItem.usd.close * 500_000).toLocaleString()}`,
                circulatingSupply: cryptoId.toUpperCase(),
                allTimeHigh: `${(lastItem.usd.close * 1.2).toLocaleString()}`
            },
            dataSource: source
        }));
        
        // If data needs background refresh, do it
        if (needsRefresh) {
            dispatch(backgroundRefreshData(cryptoId, productId, timeframe));
        }
        
    } catch (error) {
        console.error('Error in fetchCryptoData thunk:', error);
        dispatch(fetchError(error.message));
        
        // Try to use sample data as fallback
        const SAMPLE_DATA = getSampleData(cryptoId);
        if (SAMPLE_DATA.length > 0) {
            const formattedData = formatChartData(SAMPLE_DATA);
            const priceChangeValue = calculatePriceChange(SAMPLE_DATA);
            const lastItem = SAMPLE_DATA[SAMPLE_DATA.length - 1];
            
            dispatch(fetchSuccess({
                chartData: formattedData,
                currentPrice: lastItem.usd.close,
                priceChange: priceChangeValue,
                marketData: {
                    marketCap: `${(lastItem.usd.close * 19_000_000).toLocaleString()}`,
                    volume24h: `${(lastItem.usd.close * 500_000).toLocaleString()}`,
                    circulatingSupply: cryptoId.toUpperCase(),
                    allTimeHigh: `${(lastItem.usd.close * 1.2).toLocaleString()}`
                },
                dataSource: 'fallback'
            }));
        }
    }
};

// Background refresh thunk
export const backgroundRefreshData = (cryptoId, productId, timeframe) => async (dispatch) => {
    dispatch(backgroundRefreshStart());
    
    try {
        // Fetch fresh data directly from API
        const response = await fetch(
            `https://coingeko.burjx.com/coin-ohlc?productId=${productId}&days=${
                timeframe === '1D' ? 1 : 
                timeframe === '1W' ? 7 : 
                timeframe === '1M' ? 30 : 
                timeframe === '1Y' ? 365 : 'max'
            }`
        );
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Store the new data
        if (['1D', '1W'].includes(timeframe)) {
            // Use MMKV for shorter timeframes
            storage.set(`crypto_${cryptoId}_${timeframe}`, JSON.stringify(data));
            storage.set(`crypto_${cryptoId}_${timeframe}_timestamp`, Date.now());
        } else {
            // Use SQLite for longer timeframes
            await storeChartDataInSQLite(cryptoId, productId, timeframe, data);
        }
        
        // Format the data for the chart
        const formattedData = formatChartData(data);
        const priceChangeValue = calculatePriceChange(data);
        const lastItem = data[data.length - 1];
        
        // Update Redux with fresh data
        dispatch(backgroundRefreshComplete({
            chartData: formattedData,
            currentPrice: lastItem.usd.close,
            priceChange: priceChangeValue,
            marketData: {
                marketCap: `${(lastItem.usd.close * 19_000_000).toLocaleString()}`,
                volume24h: `${(lastItem.usd.close * 500_000).toLocaleString()}`,
                circulatingSupply: cryptoId.toUpperCase(),
                allTimeHigh: `${(lastItem.usd.close * 1.2).toLocaleString()}`
            }
        }));
        
    } catch (error) {
        console.error('Background refresh failed:', error);
        // Don't dispatch error for background refresh - just silently fail
        dispatch(backgroundRefreshComplete({
            // Keep existing data
        }));
    }
};

// Helper functions
const formatChartData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return { candleData: [], lineData: [] };
    }
    
    // Determine if we need sampling based on dataset size
    let dataToProcess = data;
    if (data.length > 300) {
        dataToProcess = sampleDataPoints(data);
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

// Get fallback sample data
const getSampleData = (cryptoId) => {
    const SAMPLE_DATA = {
        btc: [
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
        ],
        eth: [
            {
                "date": 1745672400000,
                "usd": { "open": 3524.78, "high": 3538.55, "low": 3511.23, "close": 3525.42 },
                "aed": { "open": 12941.9, "high": 12995.9, "low": 12895.8, "close": 12944.8 }
            },
            {
                "date": 1745674200000,
                "usd": { "open": 3525.42, "high": 3532.18, "low": 3518.75, "close": 3524.78 },
                "aed": { "open": 12944.8, "high": 12971.3, "low": 12923.4, "close": 12941.9 }
            }
        ],
        sol: [
            {
                "date": 1745672400000,
                "usd": { "open": 187.65, "high": 188.92, "low": 186.54, "close": 187.28 },
                "aed": { "open": 688.97, "high": 693.45, "low": 684.84, "close": 687.42 }
            },
            {
                "date": 1745674200000,
                "usd": { "open": 187.28, "high": 189.05, "low": 186.42, "close": 187.65 },
                "aed": { "open": 687.42, "high": 693.94, "low": 684.40, "close": 688.97 }
            }
        ],
        ada: [
            {
                "date": 1745672400000,
                "usd": { "open": 0.45, "high": 0.46, "low": 0.44, "close": 0.45 },
                "aed": { "open": 1.65, "high": 1.69, "low": 1.61, "close": 1.65 }
            },
            {
                "date": 1745674200000,
                "usd": { "open": 0.45, "high": 0.45, "low": 0.44, "close": 0.45 },
                "aed": { "open": 1.65, "high": 1.65, "low": 1.61, "close": 1.65 }
            }
        ]
    };
    
    return SAMPLE_DATA[cryptoId] || SAMPLE_DATA.btc;
};