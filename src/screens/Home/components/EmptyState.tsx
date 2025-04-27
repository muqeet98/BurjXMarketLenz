// src/screens/HomeScreen/components/EmptyState.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';
import { FEATURED_ITEM_WIDTH } from '../constants';

interface EmptyStateProps {
    searchQuery: string;
    isOffline: boolean;
}

interface EmptyFeaturedStateProps {
    isOffline: boolean;
}

export const EmptyState = React.memo(({ 
    searchQuery, 
    isOffline 
}: EmptyStateProps) => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
            {isOffline 
                ? "You're offline. Connect to see the latest data."
                : searchQuery 
                    ? `No coins found matching "${searchQuery}"` 
                    : "No coins available"
            }
        </Text>
    </View>
));

/**
 * Empty state component specifically for the featured horizontal list
 * Sized appropriately for the horizontal container
 */
export const EmptyFeaturedState = React.memo(({ 
    isOffline 
}: EmptyFeaturedStateProps) => (
    <View style={styles.emptyFeaturedContainer}>
        <Text style={styles.emptyText}>
            {isOffline 
                ? "You're offline. Data may not be current." 
                : "No coins available for this category"
            }
        </Text>
    </View>
));