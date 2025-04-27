// src/screens/HomeScreen/components/FeaturedCoinCard.tsx
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import ResponsiveText from '../../../components/common/ResponsiveText';
import { SparklineGreen, SparklineRed } from '../../../constants/svgs';
import { fonts } from '../../../constants/Fonts';
import { wp } from '../../../utils/Responsiveness';
import { FEATURED_ITEM_WIDTH } from '../constants';
import { Coin } from '../utils/storage';

interface FeaturedCoinCardProps {
    item: Coin;
    onPress: (coin: Coin) => void;
}


export const FeaturedCoinCard = React.memo(({ 
    item, 
    onPress 
}: FeaturedCoinCardProps) => {
    const isPositive = (item?.priceChangePercentage24h || 0) >= 0;
    
    const formattedPrice = useMemo(() => {
        return item?.currentPrice?.toLocaleString() || '0';
    }, [item?.currentPrice]);
    
    const formattedPercentage = useMemo(() => {
        const change = item?.priceChangePercentage24h || 0;
        return `${isPositive ? '+' : ''}${change.toFixed(2)}%`;
    }, [item?.priceChangePercentage24h, isPositive]);
    
    const percentageContainerStyle = useMemo(() => {
        return [
            styles.percentageContainer,
            !isPositive && styles.negativeContainer
        ];
    }, [isPositive]);
    
    const percentageTextStyle = useMemo(() => {
        return [
            styles.percentageText,
            !isPositive && styles.negativeText
        ];
    }, [isPositive]);
    
    const handlePress = () => {
        onPress(item);
    };
    
    return (
        <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={handlePress}
            style={styles.featuredCard}
        >
            <View style={styles.featuredHeader}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Image
                            source={{ uri: item?.image }}
                            style={styles.coinImage}
                            resizeMode="contain"
                            // Optimization for image loading
                            fadeDuration={0}
                        />
                    </View>
                    <View style={styles.titleContainer}>
                        <ResponsiveText size={'h5'}>
                            {item?.symbol?.toUpperCase()}
                        </ResponsiveText>
                        <ResponsiveText fontFamily={fonts.LufgaLight} color={'#898989'} size={'h3'}>
                            {item?.name}
                        </ResponsiveText>
                    </View>
                </View>
            </View>

            <View style={styles.chartContainer}>
                {isPositive ? <SparklineGreen /> : <SparklineRed />}
            </View>

            <View style={styles.priceContainer}>
                <ResponsiveText size={'h45'}>
                    $ {formattedPrice}
                </ResponsiveText>
                <View style={percentageContainerStyle}>
                    <Text style={percentageTextStyle}>
                        {formattedPercentage}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    if (prevProps.item.id !== nextProps.item.id) {
        return false;
    }
    
    const prevPrice = prevProps.item.currentPrice;
    const nextPrice = nextProps.item.currentPrice;
    if (prevPrice !== nextPrice) {
        return false;
    }
    
    const prevChange = prevProps.item.priceChangePercentage24h;
    const nextChange = nextProps.item.priceChangePercentage24h;
    
    // Use approximate equality for floating point to avoid unnecessary visual updates
    if (Math.abs(prevChange - nextChange) > 0.01) {
        return false;
    }
    
    return true;
});

// Extracted styles to avoid inline style creation during render
const styles = StyleSheet.create({
    featuredCard: {
        backgroundColor: '#171717',
        borderRadius: 12,
        padding: 16,
        width: FEATURED_ITEM_WIDTH,
        marginRight: 8,
        borderWidth: 0.3,
        borderColor: '#3F3F3F',
        height: 170,
    },
    featuredHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(4),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2C2C2C',
    },
    coinImage: {
        width: wp(7),
        height: wp(7),
        borderRadius: wp(3.5),
    },
    titleContainer: {
        marginLeft: 10,
    },
    chartContainer: {
        height: 50,
        marginVertical: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    percentageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        padding: 5,
        borderRadius: 5
    },
    negativeContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
    percentageText: {
        fontWeight: 'bold',
        color: '#4CAF50',
        fontFamily: fonts.LufgaRegular,
        fontSize: wp(3)
    },
    negativeText: {
        color: '#ef4444'
    }
});