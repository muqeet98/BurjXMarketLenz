// src/components/BiometricAuth.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { useDispatch } from 'react-redux';
import { setAuthenticated, setBiometricsEnabled } from '../store/slices/authSlice';
import { useTheme } from '../hooks/useTheme';
import { iconPath } from '../constants/Icons';
import { BurjXLogoSVG, FaceLocks } from '../constants/svgs';

const rnBiometrics = new ReactNativeBiometrics();

interface BiometricAuthProps {
  onSuccess: () => void;
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({ onSuccess }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [biometryType, setBiometryType] = useState<string | undefined>(undefined);

  useEffect(() => {
    // checkBiometricsAvailability();
  }, []);

  const checkBiometricsAvailability = async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      if (available) {
        setBiometryType(biometryType);
        dispatch(setBiometricsEnabled(true));
      } else {
        dispatch(setBiometricsEnabled(false));
        Alert.alert(
          'Biometrics Not Available',
          'Your device does not support biometric authentication. You can still use the app with manual authentication.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error checking biometrics:', error);
      dispatch(setBiometricsEnabled(false));
    }
  };

  const handleAuthentication = async () => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate to access Crypto Tracker',
        cancelButtonText: 'Cancel',
      });

      if (success) {
        dispatch(setAuthenticated(true));
        onSuccess();
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const skipAuthentication = () => {
    dispatch(setAuthenticated(true));
    onSuccess();
  };

  let promptText = 'Authenticate to continue';
  if (biometryType === BiometryTypes.FaceID) {
    promptText = 'Use Face ID to unlock the app';
  } else if (biometryType === BiometryTypes.TouchID) {
    promptText = 'Use Touch ID to unlock the app';
  } else if (biometryType === BiometryTypes.Biometrics) {
    promptText = 'Use Biometrics to unlock the app';
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Use Biometric {'\n'}to log in?</Text>

      <View>
        <Image style={{ width: 286, height: 286, alignSelf: 'center' }} source={iconPath?.FaceLock} />
      </View>

      <View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.BurjXGreen }]}
          onPress={handleAuthentication}
        >
          <Text style={styles.buttonText}>SetUp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={skipAuthentication}
        >
          <Text style={[styles.skipButtonText, { color: theme.text , textAlign:'center'}]}>
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    // alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 20
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 15,
    // paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipButtonText: {
    fontSize: 14,
  },
});

export default BiometricAuth;