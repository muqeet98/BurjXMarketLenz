// src/screens/HomeScreen/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const DATA_PERSISTENCE_KEY = 'CACHED_CRYPTO_DATA';
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes

// Types
export interface Coin {
    id: string;
    image: string;
    currentPrice: number;
    priceChangePercentage24h: number;
    symbol: string;
    name: string;
}

export interface CachedData {
    allCoins: Coin[];
    timestamp: number;
    nextPageParam?: number;
}


export const persistDataToStorage = async (data: Coin[], nextPageParam?: number): Promise<void> => {
    try {
        const cacheData: CachedData = {
            allCoins: data,
            timestamp: Date.now(),
            nextPageParam
        };
        
        await AsyncStorage.setItem(DATA_PERSISTENCE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error persisting data to storage:', error);
    }
};

/**
 * Loads cached coin data from AsyncStorage if available and not expired
 * @returns Cached data or null if not available/expired
 */
export const loadCachedData = async (): Promise<CachedData | null> => {
    try {
        const cachedDataString = await AsyncStorage.getItem(DATA_PERSISTENCE_KEY);
        
        if (cachedDataString) {
            const cachedData: CachedData = JSON.parse(cachedDataString);
            
            // Check if cache is still valid
            if (Date.now() - cachedData.timestamp < CACHE_EXPIRATION) {
                return cachedData;
            } else {
                console.log('Cache expired, will fetch fresh data');
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error loading cached data:', error);
        return null;
    }
};

/**
 * Clears all cached data
 */
export const clearCachedData = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(DATA_PERSISTENCE_KEY);
    } catch (error) {
        console.error('Error clearing cached data:', error);
    }
};


export const getLastFetchTimestamp = async (): Promise<number | null> => {
    try {
        const cachedDataString = await AsyncStorage.getItem(DATA_PERSISTENCE_KEY);
        
        if (cachedDataString) {
            const { timestamp } = JSON.parse(cachedDataString);
            return timestamp;
        }
        
        return null;
    } catch (error) {
        console.error('Error getting last fetch timestamp:', error);
        return null;
    }
};