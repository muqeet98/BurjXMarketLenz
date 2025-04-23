export const API_BASE_URL = 'https://coingeko.burjx.com';

export const endpoints = {
  getAllCoins: (page: number, pageSize: number) => 
    `${API_BASE_URL}/coin-prices-all?currency=usd&page=${page}&pageSize=${pageSize}`,
  getCoinOHLC: (productId: string, days: string) => 
    `${API_BASE_URL}/coin-ohlc?productId=${productId}&days=${days}`,
};
