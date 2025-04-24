import { Coin, OHLCData } from '../types';
import { endpoints } from './endpoints';
import { Alert } from 'react-native';
export const fetchCoins = async (page: number, pageSize: number): Promise<Coin[]> => {
  try {
    const response = await fetch(endpoints.getAllCoins(page, pageSize));
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("data.datadata.datadata.data",data.data);
    
    return data.data;
  } catch (error) {
    console.error('Error fetching coins:', error);
    throw error;
  }
};

export const fetchCoinOHLC = async (productId: string, days: string): Promise<OHLCData[]> => {
  try {
    const response = await fetch(endpoints.getCoinOHLC(productId, days));
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching OHLC data:', error);
    throw error;
  }
};