// src/screens/HomeScreen.tsx
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Text,
    StatusBar,
    TextInput
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import TabBar from '../../components/TabBar';
import { TabType, Coin } from '../../types';
import CoinList from './CoinsList';
import { CryptoTabs } from './CategoryTabs';

const tabs: TabType[] = ['Featured', 'Top Gainers', 'Top Losers'];

const HomeScreen: React.FC = () => {
    const { theme, isDarkMode, toggleTheme } = useTheme();

    return (
        <>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.background}
            />
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

                <CryptoTabs />
                <View style={styles.content}>
                    <CoinList />
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    themeButton: {
        padding: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 4,
    },
    content: {
        flex: 1,
    },
});

export default HomeScreen;