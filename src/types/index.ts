export interface Coin {
  productId: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    total_volume: number;
  }
  
  export interface OHLC {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }
  
  export interface ChartData {
    timestamp: number;
    value: number;
  }
  
  export type TabType = 'All Coins'| 'Featured' | 'Top Gainers' | 'Top Losers';
  
  export interface ApiResponse<T> {
    data: T;
    status: number;
    success: boolean;
    message?: string;
  }
  

  export interface Cryptocurrency {
    productId: number;
    id: string;
    name: string;
    image: string;
    currentPrice: number;
    priceChangePercentage24h: number;
    sparkline: number[]; // Array of price points for creating the chart
    marketCap: number;
    tradingVolume: number;
    symbol: string;
  }
  
  export type CryptoCategory = 'featured' | 'topGainers' | 'topLosers';
  
  export interface CryptoState {
    allCoins: Cryptocurrency[];
    featured: Cryptocurrency[];
    topGainers: Cryptocurrency[];
    topLosers: Cryptocurrency[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    lastFetched: number | null;
  }