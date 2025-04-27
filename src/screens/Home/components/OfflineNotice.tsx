// src/screens/HomeScreen/components/OfflineNotice.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { styles } from '../styles';

/**
 * Component that displays a notice when the device is offline
 * Includes animation for better user experience
 */
export const OfflineNotice = React.memo(() => {
    // Animation value for sliding in from bottom
    const slideAnim = useRef(new Animated.Value(30)).current;
    
    // Run entrance animation when component mounts
    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
        
        // Optional: Can add exit animation when component unmounts
        return () => {
            Animated.timing(slideAnim, {
                toValue: 30,
                duration: 200,
                useNativeDriver: true,
            }).start();
        };
    }, []);
    
    return (
        <Animated.View 
            style={[
                styles.offlineContainer,
                { transform: [{ translateY: slideAnim }] }
            ]}
        >
            <Text style={styles.offlineText}>
                You are offline
            </Text>
        </Animated.View>
    );
});