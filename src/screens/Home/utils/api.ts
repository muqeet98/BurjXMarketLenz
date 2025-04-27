// src/screens/HomeScreen/utils/api.ts
import axios, { AxiosInstance } from 'axios';

// Constants
const API_BASE_URL = 'https://coingeko.burjx.com';
const API_TIMEOUT = 15000;

// API client with enhanced configuration
export const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: API_BASE_URL,
        timeout: API_TIMEOUT,
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
        }
    });

    // Request interceptor for handling tokens, etc.
    client.interceptors.request.use(
        (config) => {
            // You could add auth tokens here if needed
            // if (token) {
            //   config.headers.Authorization = `Bearer ${token}`;
            // }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            // Handle authentication errors
            if (error.response && error.response.status === 401) {
                // Refresh token logic could go here
                // await refreshTokens();
                // return client(error.config);
            }
            
            // Handle rate limiting
            if (error.response && error.response.status === 429) {
                // Could implement exponential backoff retry
                console.log('Rate limited, consider implementing backoff');
            }
            
            return Promise.reject(error);
        }
    );

    return client;
};

// Singleton API client instance
export const coinApiClient = createApiClient();

// API request with error handling
export const fetchCoinsApi = async ({ 
    pageParam = 1, 
    currency = 'usd', 
    pageSize = 15 
}: { 
    pageParam?: number; 
    currency?: string; 
    pageSize?: number;
}) => {
    try {
        const response = await coinApiClient.get('/coin-prices-all', {
            params: {
                currency,
                page: pageParam,
                pageSize,
            },
        });
        return response.data.data;
    } catch (error: any) {
        // Transform errors into more user-friendly messages
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timed out. Please check your network connection.');
        }
        
        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        if (error.response?.status >= 500) {
            throw new Error('Server error. Please try again later.');
        }
        
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            throw new Error('Cannot reach the server. Please check your network connection.');
        }
        
        // General error with original message if available
        throw new Error(error.message || 'Failed to fetch coins. Please try again.');
    }
};