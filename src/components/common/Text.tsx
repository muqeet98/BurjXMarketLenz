import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { theme } from '../../theme';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'button';
  color?: string;
  bold?: boolean;
  semibold?: boolean;
  centered?: boolean;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = theme.colors.textPrimary,
  style,
  bold = false,
  semibold = false,
  centered = false,
  children,
  ...props
}) => {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 360;

  const getFontSize = () => {
    switch (variant) {
      case 'h1':
        return isSmallDevice ? theme.fonts.sizes.xxl : theme.fonts.sizes.title;
      case 'h2':
        return isSmallDevice ? theme.fonts.sizes.xl : theme.fonts.sizes.xxl;
      case 'h3':
        return isSmallDevice ? theme.fonts.sizes.lg : theme.fonts.sizes.xl;
      case 'h4':
        return isSmallDevice ? theme.fonts.sizes.md : theme.fonts.sizes.lg;
      case 'body':
        return isSmallDevice ? theme.fonts.sizes.sm : theme.fonts.sizes.md;
      case 'caption':
        return isSmallDevice ? theme.fonts.sizes.xs : theme.fonts.sizes.sm;
      case 'button':
        return isSmallDevice ? theme.fonts.sizes.sm : theme.fonts.sizes.md;
      default:
        return isSmallDevice ? theme.fonts.sizes.sm : theme.fonts.sizes.md;
    }
  };

  const getFontWeight = () => {
    if (bold) return theme.fonts.weights.bold;
    if (semibold) return theme.fonts.weights.semibold;
    switch (variant) {
      case 'h1':
      case 'h2':
        return theme.fonts.weights.bold;
      case 'h3':
      case 'h4':
        return theme.fonts.weights.semibold;
      case 'button':
        return theme.fonts.weights.medium;
      default:
        return theme.fonts.weights.regular;
    }
  };

  const styles = StyleSheet.create({
    text: {
      color,
      fontSize: getFontSize(),
    //   fontWeight: getFontWeight(),
      fontWeight: '500',
      textAlign: centered ? 'center' : 'left',
      fontFamily: theme.fonts.families.base,
    },
  });

  return (
    <RNText style={[styles.text, style]} {...props}>
      {children}
    </RNText>
  );
};
