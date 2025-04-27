// src/screens/HomeScreen/components/ListFooter.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { styles } from '../styles';

interface ListFooterProps {
    isFetchingNextPage: boolean;
    theme: any;
    hasNextPage?: boolean;
}

export const ListFooter = React.memo(({ 
    isFetchingNextPage, 
    theme,
    hasNextPage
}: ListFooterProps) => (
    <>
        {isFetchingNextPage ? (
            <ActivityIndicator
                size="small"
                color={theme.BurjXGreen}
                style={styles.footerLoader}
            />
        ) : hasNextPage ? (
            <View style={styles.endOfListContainer}>
                <Text style={styles.endOfListText}>Scroll to load more</Text>
            </View>
        ) : (
            <View style={styles.endOfListContainer}>
                <Text style={styles.endOfListText}>End of list</Text>
            </View>
        )}
    </>
));