// cryptoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// API configuration
const API_BASE_URL = 'https://coingeko.burjx.com/coin-ohlc';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Async thunk for fetching data
export const fetchCryptoData = createAsyncThunk(
    'crypto/fetchData',
    async ({ productId, days }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}?productId=${productId}&days=${days}`);
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Initial state
const initialState = {
    selectedCrypto: {
        id: 'btc', productId: 2, name: 'Bitcoin', symbol: 'BTC', 
        color: '#F7931A', currentPrice: 94258
    },
    selectedTimeFrame: '1D',
    chartType: 'line',
    showCryptoList: false,
    isLoading: false,
    error: null,
    chartData: { candleData: [], lineData: [] },
    currentPrice: 94258,
    priceChange: 0,
    marketData: {
        marketCap: '--',
        volume24h: '--',
        circulatingSupply: '--',
        allTimeHigh: '--',
    },
    dataCache: {}
};

// Create slice
const cryptoSlice = createSlice({
    name: 'crypto',
    initialState,
    reducers: {
        fetchStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        fetchSuccess: (state, action) => {
            const { chartData, currentPrice, priceChange, marketData } = action.payload;
            state.chartData = chartData;
            state.currentPrice = currentPrice;
            state.priceChange = priceChange;
            state.marketData = marketData;
            state.isLoading = false;
        },
        fetchError: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        setSelectedCrypto: (state, action) => {
            state.selectedCrypto = action.payload;
        },
        setSelectedTimeFrame: (state, action) => {
            state.selectedTimeFrame = action.payload;
        },
        setChartType: (state, action) => {
            state.chartType = action.payload;
        },
        toggleCryptoList: (state) => {
            state.showCryptoList = !state.showCryptoList;
        }
    }
});

export const { 
    fetchStart, 
    fetchSuccess, 
    fetchError, 
    setSelectedCrypto, 
    setSelectedTimeFrame, 
    setChartType, 
    toggleCryptoList 
} = cryptoSlice.actions;

export default cryptoSlice.reducer;