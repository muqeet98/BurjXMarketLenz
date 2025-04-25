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
import { useTheme } from '../hooks/useTheme';
import TabBar from '../components/TabBar';
import CoinList from '../components/CoinList';
import { TabType, Coin } from '../types';
import CoinListFile from '../components/CoinListFile';
// import Icon from 'react-native-vector-icons/Ionicons';

const tabs: TabType[] = ['Featured', 'Top Gainers', 'Top Losers'];

const HomeScreen: React.FC = () => {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<TabType>('Featured');
    const [searchQuery, setSearchQuery] = useState('');

    const handleCoinPress = (coin: Coin) => {
        console.log('Coin pressed:', coin.name);
    };

    return (
        <>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.background}
            />
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                {/* <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Crypto Tracker</Text>
                    <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
                        <Icon 
              name={isDarkMode ? 'sunny-outline' : 'moon-outline'} 
              size={24} 
              color={theme.text} 
            />
                    </TouchableOpacity>
                </View> */}

                {/* <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search coins..."
                        placeholderTextColor={theme.secondaryText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle-outline" size={20} color={theme.secondaryText} />
                        </TouchableOpacity>
                    )}
                </View> */}

                <TabBar
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <View style={styles.content}>
                    {/* <CoinList
                        tabType={activeTab}
                        onCoinPress={handleCoinPress}
                    /> */}
                   <CoinListFile/> 
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