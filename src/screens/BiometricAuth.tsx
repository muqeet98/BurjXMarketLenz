// src/components/BiometricAuth.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, SafeAreaView } from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthenticated, setBiometricsEnabled } from '../store/slices/authSlice';
import { useTheme } from '../hooks/useTheme';
import { iconPath } from '../constants/Icons';

import ResponsiveText from '../components/common/ResponsiveText';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const rnBiometrics = new ReactNativeBiometrics();

interface BiometricAuthProps {
  onSuccess?: () => void;
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({ onSuccess }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [biometryType, setBiometryType] = useState<string | undefined>(undefined);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);
  
  const biometricsEnabled = useSelector((state) => state.auth.biometricsEnabled);

  useEffect(() => {
    loadBiometricsState();
    checkBiometricsAvailability();
  }, []);

  // Load biometrics state from AsyncStorage
  const loadBiometricsState = async () => {
    try {
      const storedState = await AsyncStorage.getItem('biometricsEnabled');
      if (storedState !== null) {
        const isEnabled = storedState === 'true';
        setIsBiometricsEnabled(isEnabled);
        dispatch(setBiometricsEnabled(isEnabled));
      }
    } catch (error) {
      console.error('Error loading biometrics state:', error);
    }
  };

  // Save biometrics state to AsyncStorage
  const saveBiometricsState = async (isEnabled) => {
    try {
      await AsyncStorage.setItem('biometricsEnabled', isEnabled.toString());
    } catch (error) {
      console.error('Error saving biometrics state:', error);
    }
  };

  const handleAuthSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      navigation.replace('Home');
    }
  };

  const checkBiometricsAvailability = async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      if (available) {
        setBiometryType(biometryType);
        setIsBiometricsEnabled(biometricsEnabled);
        
        // If biometrics are already enabled, prompt for verification immediately
        if (biometricsEnabled) {
          handleAuthentication();
        }
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
      const promptMessage = isBiometricsEnabled ? 
        'Verify to access Crypto Tracker' : 
        'Authenticate to set up biometric access';
        
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
      });

      if (success) {
        // If not already enabled, this is the setup process
        if (!isBiometricsEnabled) {
          dispatch(setBiometricsEnabled(true));
          saveBiometricsState(true);
        }
        
        dispatch(setAuthenticated(true));
        // Save authentication state
        AsyncStorage.setItem('isAuthenticated', 'true');
        handleAuthSuccess();
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const skipAuthentication = async () => {
    dispatch(setAuthenticated(true));
    await AsyncStorage.setItem('isAuthenticated', 'true');
    // We still save that the user chose not to use biometrics
    await AsyncStorage.setItem('biometricsEnabled', 'false');
    handleAuthSuccess();
  };

  // Determine screen text based on whether biometrics are already enabled
  const titleText = isBiometricsEnabled ? 
    'Verify Identity' : 
    'Use Biometric\nto log in?';
    
  // Determine button text based on whether biometrics are already enabled
  const buttonText = isBiometricsEnabled ? 'Verify' : 'Set Up';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ResponsiveText size={'h10'}>
        {titleText}
      </ResponsiveText>

      <View>
        <Image style={{ width: 286, height: 286, alignSelf: 'center' }} source={iconPath?.FaceLock} />
      </View>

      <View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.BurjXGreen }]}
          onPress={handleAuthentication}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>

        {!isBiometricsEnabled && (
          <TouchableOpacity
            style={[styles.skipButton]}
            onPress={skipAuthentication}
          >
            <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
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
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
  },
});

export default BiometricAuth;