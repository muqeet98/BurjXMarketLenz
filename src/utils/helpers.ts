// src/utils/helpers.ts
import { ChartData, OHLC } from '../types';

/**
 * Format number to currency string
 */
export const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Format percentage number with sign
 */
export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * Convert OHLC data to chart-compatible format
 */
export const convertOHLCToChartData = (ohlcData: OHLC[]): ChartData[] => {
  return ohlcData.map((item) => ({
    timestamp: item.time * 1000, // Convert to milliseconds
    value: item.close,
  }));
};

/**
 * Shorten large numbers for display (e.g., 1.5M, 2.3B)
 */
export const shortenNumber = (num: number): string => {
  if (num >= 1.0e12) {
    return (num / 1.0e12).toFixed(1) + 'T';
  }
  if (num >= 1.0e9) {
    return (num / 1.0e9).toFixed(1) + 'B';
  }
  if (num >= 1.0e6) {
    return (num / 1.0e6).toFixed(1) + 'M';
  }
  if (num >= 1.0e3) {
    return (num / 1.0e3).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Get color based on price change direction
 */
export const getPriceChangeColor = (change: number, positiveColor: string, negativeColor: string): string => {
  return change >= 0 ? positiveColor : negativeColor;
};