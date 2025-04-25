// src/services/api.ts
import { Coin, OHLC, ApiResponse } from '../types';
import axios from 'axios';
const BASE_URL = 'https://coingeko.burjx.com';

export const fetchCoins = async (
  page: number, 
  pageSize: number = 10, 
  currency: string
): Promise<ApiResponse<Coin[]>> => {
  try {
    const response = await fetch(
      `${BASE_URL}/coin-prices-all?currency=${currency}&page=${page}&pageSize=${pageSize}`
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    console.log("responseresponseresponse",response);
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching coins:', error);
    throw error;
  }
};

export const fetchCoinOHLC = async (
  coinId: string, 
  days: '1' | '7' | '30' | '365' | 'max' = '30'
): Promise<ApiResponse<OHLC[]>> => {
  try {
    const response = await fetch(
      `${BASE_URL}/coin-ohlc?productId=${coinId}&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching coin OHLC data:', error);
    throw error;
  }
};

export const fetchFeaturedCoins = async (
  currency: string = 'usd',
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<Coin[]>> => {
  return fetchCoins(page, pageSize, currency);
};

export const fetchTopGainers = async (
  currency: string = 'usd',
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<Coin[]>> => {
  const response = await fetchCoins(page, pageSize * 3, currency);
  
  if (response.success && response.data) {
    // Sort by highest price change percentage
    const sortedCoins = [...response.data].sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
    );
    
    return {
      ...response,
      data: sortedCoins.slice(0, pageSize),
    };
  }
  
  return response;
};

export const fetchTopLosers = async (
  currency: string = 'usd',
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<Coin[]>> => {
  const response = await fetchCoins(page, pageSize * 3, currency);
  
  if (response.success && response.data) {
    // Sort by lowest price change percentage
    const sortedCoins = [...response.data].sort(
      (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
    );
    
    return {
      ...response,
      data: sortedCoins.slice(0, pageSize),
    };
  }
  
  return response;
};




interface FetchCoinsParams {
  pageParam?: number;
  currency: string;
}

export const fetchCoinsApi = async ({ pageParam = 1, currency = 'usd' }) => {
  const response = await axios.get('https://coingeko.burjx.com/coin-prices-all', {
    params: {
      currency,
      page: pageParam,
      pageSize: 15,
    },
  });

  return response.data;
};