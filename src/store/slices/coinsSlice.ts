import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching data
export const fetchCryptoData = createAsyncThunk(
  'coins/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('https://coingeko.burjx.com/coin-prices-all?currency=usd&page=1&pageSize=100');
      
      if (!response.ok) {
        return rejectWithValue('Server error!');
      }
      
      const data = await response.json();
      console.log("datadataewfdsfsdfsfe",data);
      
      return data;
    } catch (error) {
      return rejectWithValue((error instanceof Error ? error.message : 'Unknown error occurred'));
    }
  }
);

interface Coin {
  marketCap: number;
  priceChangePercentage24h?: number;
}

interface CoinsState {
  allCoins: Coin[];
  featured: Coin[];
  topGainers: Coin[];
  topLosers: Coin[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: number | null;
}

const initialState: CoinsState = {
  allCoins: [],
  featured: [],
  topGainers: [],
  topLosers: [],
  status: 'idle',
  error: null,
  lastFetched: null
};

const coinsSlice = createSlice({
  name: 'coins',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCryptoData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCryptoData.fulfilled, (state, action: { payload: Array<{ marketCap: number; priceChangePercentage24h?: number }> }) => {
        state.status = 'succeeded';
        state.allCoins = action.payload;
        state.lastFetched = Date.now();
        
        // Pre-process data for each tab
        state.featured = [...action.payload]
          .sort((a, b) => a.marketCap - b.marketCap)
          .slice(0, 20);
          
        state.topGainers = [...action.payload]
          .filter(coin => (coin.priceChangePercentage24h || 0) > 0)
          .sort((a, b) => (b.priceChangePercentage24h || 0) - (a.priceChangePercentage24h || 0))
          .slice(0, 20);
          
        state.topLosers = [...action.payload]
          .filter(coin => (coin.priceChangePercentage24h || 0) < 0)
          .sort((a, b) => (a.priceChangePercentage24h|| 0) - (b.priceChangePercentage24h|| 0))
          .slice(0, 20);
      })
      .addCase(fetchCryptoData.rejected, (state, action: { payload: string | undefined }) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch data';
      });
  }
});

export const { resetError } = coinsSlice.actions;
export default coinsSlice.reducer;
