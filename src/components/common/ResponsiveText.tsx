import React from 'react';
import { Text } from 'react-native';
import { fonts } from '../../constants/Fonts';
import { handleMargin } from '../../constants/MarginPadding';

import { wp } from '../../utils/Responsiveness';
import { useTheme } from '../../hooks/useTheme';

const ResponsiveText = ({
    children,
    color,
    size,
    fontFamily,
    margin,
    position,
    padding,
    numberOfLines,
    style,
    textAlign,
    
    alignSelf,
    fontWeight,
    lineHeight,
    textDecorationLine,

    //sizes
    ...props
}) => {
    const {theme}= useTheme();
    return (
        <Text
            {...props}
            numberOfLines={numberOfLines}
            // lineHeight={props.lineHeight? props.lineHeight: 2}
            style={[
                { ...styles.text },
                props.style,
                margin ? handleMargin(margin) : undefined,
                padding ? handlePadding(padding) : undefined,
                lineHeight && {lineHeight: wp(lineHeight!=1?lineHeight:4)},
                size && styles[size] ? styles[size] : wp(size),
                alignSelf ? alignSelf : undefined,
                position && { alignSelf: position },
                textAlign && {  textAlign: textAlign },
                textDecorationLine && { textDecorationLine: textDecorationLine },
                fontWeight && {fontWeight: fontWeight},
                { color: color ? color: theme.text },
                { fontFamily: fontFamily ? fontFamily : fonts.LufgaRegular }
               
            ]}>
            {children}
        </Text>
    );
};


const styles = {
    text: {
        fontSize: wp(3.5),
    },
    h0: { fontSize: wp(13) },
    h1: { fontSize: wp(9) },
    h2: { fontSize: wp(2) },
    h3: { fontSize: wp(3) },
    h4: { fontSize: wp(6) },
    h5: { fontSize: wp(5) },
    h6: { fontSize: wp(4) },
    h7: { fontSize: wp(3.5) },
    h8: { fontSize: wp(8) },
    h9: { fontSize: wp(2) },
    h10: { fontSize: wp(10)},
    h11: { fontSize: wp(11) }, // 42/3.6
    h12: { fontSize: wp(3) },
    header: { fontSize: wp(4.5) },
    h45: { fontSize: wp(4.5) },
};
export default ResponsiveText;