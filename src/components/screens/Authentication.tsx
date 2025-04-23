import React, { useEffect } from 'react';
import { View, StyleSheet, Image,TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Text } from '../common/Text';
import { LoadingIndicator } from '../common/LoadingIndicator';
import { useBiometrics } from '../../hooks/useBiometrics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
// import { TouchableOpacity } from 'react-native-gesture-handler';

interface AuthenticationProps {
  onAuthenticated: () => void;
}


export const Authentication: React.FC<AuthenticationProps> = ({ onAuthenticated }) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    isBiometricSupported,
    isBiometricEnrolled,
    isAuthenticated,
    authenticating,
    error,
    authenticate,
    promptEnrollBiometrics,
  } = useBiometrics();

  useEffect(() => {
    if (isAuthenticated) {
      onAuthenticated();
    }
  }, [isAuthenticated, onAuthenticated]);

  const handleAuthenticate = async () => {
    navigation.navigate("MarketOverview")
    // if (isBiometricSupported && isBiometricEnrolled) {
    //   await authenticate();
    // } else if (isBiometricSupported) {
    //   promptEnrollBiometrics();
    // }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/5968/5968260.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text variant="h1" bold centered>
          Crypto Tracker
        </Text>
        <Text
          variant="body"
          color={theme.colors.textSecondary}
          centered
          style={styles.subtitle}
        >
          Track your crypto portfolio in real-time
        </Text>
      </View>

      <View style={styles.authContainer}>
        {authenticating ? (
          <LoadingIndicator message="Authenticating..." />
        ) : (
          <>
            <TouchableOpacity
              style={styles.authButton}
              onPress={handleAuthenticate}
              // disabled={authenticating || !isBiometricSupported}
            >
              <Text variant="button" color={theme.colors.textPrimary} centered>
                {isBiometricSupported && isBiometricEnrolled
                  ? 'Authenticate with Biometrics'
                  : isBiometricSupported
                  ? 'Setup Biometrics'
                  : 'Biometrics Not Supported'}
              </Text>
            </TouchableOpacity>

            {error && (
              <Text
                variant="caption"
                color={theme.colors.error}
                centered
                style={styles.errorText}
              >
                {error}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
    padding: theme.metrics.mediumSpacing,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: theme.metrics.mediumSpacing,
  },
  subtitle: {
    marginTop: theme.metrics.baseSpacing,
    marginBottom: theme.metrics.largeSpacing,
  },
  authContainer: {
    paddingBottom: theme.metrics.largeSpacing,
  },
  authButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.metrics.mediumSpacing,
    paddingHorizontal: theme.metrics.largeSpacing,
    borderRadius: theme.metrics.borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: theme.metrics.baseSpacing,
  },
});