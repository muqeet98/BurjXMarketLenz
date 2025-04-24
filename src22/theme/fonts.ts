import { Platform } from 'react-native';

export const fonts = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    title: 28,
  },
  weights: {
    regular: Platform.OS === 'ios' ? '400' : 'normal',
    medium: Platform.OS === 'ios' ? '500' : 'normal',
    semibold: Platform.OS === 'ios' ? '600' : 'bold',
    bold: Platform.OS === 'ios' ? '700' : 'bold',
    heavy: Platform.OS === 'ios' ? '800' : 'bold',
  },
  families: {
    base: Platform.OS === 'ios' ? 'System' : 'Roboto',
    mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
};
