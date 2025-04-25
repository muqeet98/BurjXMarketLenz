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