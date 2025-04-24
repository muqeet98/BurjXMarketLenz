import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { theme } from '../../theme';
import { Text } from './Text';

interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  message?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'large',
  message,
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {message && (
        <Text variant="body" style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: theme.metrics.baseSpacing,
    color: theme.colors.textSecondary,
  },
});