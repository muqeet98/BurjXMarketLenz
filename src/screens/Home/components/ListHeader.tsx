// src/screens/HomeScreen/components/ListHeader.tsx
import React from 'react';
import { View, TextInput, ActivityIndicator } from 'react-native';
import ResponsiveText from '../../../components/common/ResponsiveText';
import { SearchCVG } from '../../../constants/svgs';
import { wp } from '../../../utils/Responsiveness';
import { styles } from '../styles';

interface ListHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    theme: any;
    isRefetching: boolean;
}

/**
 * Header component for the main coin list with search functionality
 * Memoized to prevent unnecessary renders when parent components update
 */
export const ListHeader = React.memo(({
    searchQuery,
    setSearchQuery,
    theme,
    isRefetching
}: ListHeaderProps) => {
    return (
        <View>
            <View style={styles.searchHeader}>
                {/* "All Coins" label with green underline */}
                <View style={styles.tabContainer}>
                    <ResponsiveText 
                        textAlign={'center'} 
                        margin={[wp(2), 0, wp(2), 0]} 
                        size={'h5'}
                    >
                        All Coins
                    </ResponsiveText>
                </View>
                
                {/* Search input field */}
                <View style={styles.searchContainer}>
                    <TextInput
                        placeholder="Search..."
                        placeholderTextColor={theme.secondaryText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={[
                            styles.searchInput,
                            {
                                backgroundColor: theme.cardBackground,
                                color: theme.text,
                            }
                        ]}
                        // Keyboard optimizations
                        returnKeyType="search"
                        autoCapitalize="none"
                        autoCorrect={false}
                        clearButtonMode="while-editing"
                    />
                    <View style={styles.searchIcon}>
                        <SearchCVG />
                    </View>
                </View>
            </View>
            
            {/* Loading indicator when refreshing */}
            {isRefetching && (
                <View style={styles.headerIndicatorContainer}>
                    <ActivityIndicator 
                        size="small" 
                        color={theme.BurjXGreen} 
                    />
                </View>
            )}
        </View>
    );
}, (prevProps, nextProps) => {
    // Only re-render when these props change
    return (
        prevProps.searchQuery === nextProps.searchQuery &&
        prevProps.isRefetching === nextProps.isRefetching
    );
});