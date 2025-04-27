// src/screens/HomeScreen/components/TabButton.tsx
import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import ResponsiveText from '../../../components/common/ResponsiveText';
import { wp } from '../../../utils/Responsiveness';
import { Tab } from '../constants';

interface TabButtonProps {
    tab: Tab;
    isActive: boolean;
    onPress: () => void;
}


export const TabButton = React.memo(({ 
    tab, 
    isActive, 
    onPress 
}: TabButtonProps) => {
    const buttonStyle = isActive 
        ? [styles.tabButton, styles.activeTabButton]
        : styles.tabButton;
        
    const textColor = isActive ? '#FFFFFF' : '#898989';
    
    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            activeOpacity={0.7}
            // Add hit slop for better touch area
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            {tab.icon && (
                <Image 
                    source={tab.icon} 
                    style={styles.tabIcon}
                    fadeDuration={0} 
                />
            )}
            <ResponsiveText 
                margin={[0, 0, 0, 5]} 
                size={'h5'}
                // Pass pre-computed color
                color={textColor}
            >
                {tab.name}
            </ResponsiveText>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.isActive === nextProps.isActive &&
        prevProps.tab.name === nextProps.tab.name &&
        prevProps.tab.category === nextProps.tab.category
    );
});

// Extracted styles for better performance
const styles = StyleSheet.create({
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 8,
    },
    activeTabButton: {
        borderBottomWidth: 2,
        borderColor: '#CDFF00',
    },
    tabIcon: {
        width: wp(6),
        height: wp(6),
    }
});