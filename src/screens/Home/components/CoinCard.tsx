// src/screens/HomeScreen/components/CoinCard.tsx
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import ResponsiveText from '../../../components/common/ResponsiveText';
import { SparklineGreen, SparklineRed } from '../../../constants/svgs';
import { fonts } from '../../../constants/Fonts';
import { wp } from '../../../utils/Responsiveness';
import { Coin } from '../utils/storage';

interface CoinCardProps {
    item: Coin;
    onPress: (coin: Coin) => void;
}


export const CoinCard = React.memo(({ 
    item, 
    onPress 
}: CoinCardProps) => {
    const isPositive = (item?.priceChangePercentage24h || 0) >= 0;
    
    const formattedPrice = useMemo(() => {
        return item?.currentPrice?.toLocaleString() || '0';
    }, [item?.currentPrice]);
    
    const formattedPercentage = useMemo(() => {
        const change = item?.priceChangePercentage24h || 0;
        return `${isPositive ? '+' : ''}${change.toFixed(2)}%`;
    }, [item?.priceChangePercentage24h, isPositive]);
    
    const percentageStyle = useMemo(() => {
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
            onPress={handlePress} 
            style={styles.card}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Image
                            source={{ uri: item?.image }}
                            style={styles.coinImage}
                            resizeMode="contain"
                            // Important optimization for image loading
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
                <View>
                    <View style={styles.percentageContainer}>
                        <Text style={percentageStyle}>
                            {formattedPercentage}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.body}>
                <View style={styles.priceWrapper}>
                    <ResponsiveText size={'h45'}>
                        $ {formattedPrice}
                    </ResponsiveText>
                </View>
                <View style={styles.chartWrapper}>
                    {isPositive ? <SparklineGreen /> : <SparklineRed />}
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
    
    if (Math.abs(prevChange - nextChange) > 0.01) {
        return false;
    }
    
    return true;
});

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#141414',
        borderRadius: 12,
        padding: 16,
        paddingVertical: 15,
        marginVertical: 2,
        width: '90%',
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    body: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    percentageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2C2C2C',
        padding: 5,
        borderRadius: 5
    },
    percentageText: {
        fontWeight: 'bold',
        color: '#4CAF50',
        fontFamily: fonts.LufgaRegular,
        fontSize: wp(3)
    },
    negativeText: {
        color: '#ef4444'
    },
    priceWrapper: {
        width: '50%', 
        justifyContent: 'flex-end', 
        alignItems: 'baseline'
    },
    chartWrapper: {
        width: '50%', 
        height: wp(15), 
        alignItems: 'flex-end'
    }
});