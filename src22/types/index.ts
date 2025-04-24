export interface Coin {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    image: string;
    price_change_percentage_24h: number;
    price_change_percentage_7d?: number;
    total_volume: number;
    circulating_supply: number;
  }
  
  export interface OHLCData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }
  
  export type ChartViewType = 'line' | 'candlestick';
  export type TimeRangeType = '1' | '7' | '30' | '365' | 'max';
  export type CategoryType = 'featured' | 'gainers' | 'losers';