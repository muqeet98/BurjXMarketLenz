
import React, { use, useEffect, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { wp, hp } from '../utils/Responsiveness'
import { useTheme } from '../hooks/useTheme'

import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'
import { BurjXLogoSVG } from '../constants/svgs'
import { useNavigation } from '@react-navigation/native'
const SplashScreen = () => {
    const { theme } = useTheme()
    const navigation = useNavigation()
    const offset = useSharedValue(wp(100) / 2 - 240)
    const animatedStyles = useAnimatedStyle(() => ({
        transform: [{ translateY: offset.value }],
    }))

    React.useEffect(() => {
        offset.value = withSpring(-offset.value, {
            stiffness: 59,
        })
    }, [])

    useEffect(() => {
        setTimeout(async () => {
            navigation.replace('Auth')
        }, 2000)
    }, [])


    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <Animated.View style={[styles.logoContainer, animatedStyles]}>
                {/* <BurjXLogoSVG /> */}
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    logoContainer: {
        alignSelf: 'center',
        marginTop: hp(40),
        height: wp(40),
        borderWidth: 0,
        borderColor: 'red',
        padding: wp(5),
    },
    logo: {
        width: wp(61),
        height: wp(17),

    },
})
export default SplashScreen