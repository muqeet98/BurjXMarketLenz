// src/screens/HomeScreen/hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export type NetworkStatus = 'connected' | 'disconnected' | 'unknown';

export const useNetworkStatus = (): NetworkStatus => {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('unknown');
    
    useEffect(() => {
        // Initial check
        NetInfo.fetch().then(state => {
            setNetworkStatus(state.isConnected ? 'connected' : 'disconnected');
        });
        
        // Set up listener for network changes
        const unsubscribe = NetInfo.addEventListener(state => {
            setNetworkStatus(state.isConnected ? 'connected' : 'disconnected');
        });
        
        // Clean up listener on unmount
        return () => {
            unsubscribe();
        };
    }, []);
    
    return networkStatus;
};