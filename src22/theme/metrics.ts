import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const metrics = {
  screenWidth: width,
  screenHeight: height,
  baseSpacing: 8,
  get smallSpacing() { return this.baseSpacing / 2; },
  get mediumSpacing() { return this.baseSpacing * 2; },
  get largeSpacing() { return this.baseSpacing * 3; },
  get xLargeSpacing() { return this.baseSpacing * 4; },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xl: 24,
    round: 9999,
  },
  tabHeight: 48,
  headerHeight: 56,
  bottomTabHeight: 60,
};