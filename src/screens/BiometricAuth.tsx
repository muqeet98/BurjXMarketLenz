// src/components/BiometricAuth.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, SafeAreaView, Platform } from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthenticated, setBiometricsEnabled } from '../store/slices/authSlice';
import { useTheme } from '../hooks/useTheme';
import { iconPath } from '../constants/Icons';

import ResponsiveText from '../components/common/ResponsiveText';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the biometrics instance outside of the component to prevent recreation
const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

interface BiometricAuthProps {
  onSuccess?: () => void;
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({ onSuccess }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [biometryType, setBiometryType] = useState<string | undefined>(undefined);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const biometricsEnabled = useSelector((state) => state.auth.biometricsEnabled);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        await loadBiometricsState();
        await checkBiometricsAvailability();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
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
      // Using navigate instead of replace to prevent potential navigation issues
      navigation.navigate('Home');
    }
  };

  const checkBiometricsAvailability = async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      if (available) {
        setBiometryType(biometryType);
        setIsBiometricsEnabled(biometricsEnabled);
        
        // Don't automatically prompt for verification on component mount
        // This can cause iOS Face ID to trigger too early before UI is ready
        // Let the user initiate authentication with the button instead
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
      // Adjust prompt message for iOS Face ID vs Touch ID
      let promptMessage = 'Authenticate to access Crypto Tracker';
      
      if (Platform.OS === 'ios') {
        if (biometryType === BiometryTypes.FaceID) {
          promptMessage = isBiometricsEnabled ? 
            'Use Face ID to access Crypto Tracker' : 
            'Set up Face ID for quick access';
        } else if (biometryType === BiometryTypes.TouchID) {
          promptMessage = isBiometricsEnabled ? 
            'Use Touch ID to access Crypto Tracker' : 
            'Set up Touch ID for quick access';
        }
      }
        
      const result = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
        // Add a timeout to prevent Face ID infinite wait bug on iOS
        fallbackPromptMessage: 'Please use your device passcode',
      });
      
      if (result && result.success) {
        // If not already enabled, this is the setup process
        if (!isBiometricsEnabled) {
          dispatch(setBiometricsEnabled(true));
          await saveBiometricsState(true);
        }
        
        dispatch(setAuthenticated(true));
        // Save authentication state
        await AsyncStorage.setItem('isAuthenticated', 'true');
        handleAuthSuccess();
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Handle specific iOS error cases
      if (Platform.OS === 'ios') {
        if (error.message && error.message.includes('cancelled')) {
          // User cancelled - no need for an alert
          return;
        }
        
        Alert.alert(
          'Authentication Failed',
          'Please try again or use an alternative login method.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const skipAuthentication = async () => {
    dispatch(setAuthenticated(true));
    await AsyncStorage.setItem('isAuthenticated', 'true');
    await AsyncStorage.setItem('biometricsEnabled', 'false');
    handleAuthSuccess();
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ResponsiveText size={'h10'}>Loading...</ResponsiveText>
      </SafeAreaView>
    );
  }

  // Determine screen text based on biometrics type and status
  let titleText = 'Use Biometric\nto log in?';
  if (biometryType === BiometryTypes.FaceID) {
    titleText = isBiometricsEnabled ? 'Verify with Face ID' : 'Use Face ID\nto log in?';
  } else if (biometryType === BiometryTypes.TouchID) {
    titleText = isBiometricsEnabled ? 'Verify with Touch ID' : 'Use Touch ID\nto log in?';
  }
    
  // Determine button text
  const buttonText = isBiometricsEnabled ? 'Verify' : 'Set Up';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ResponsiveText size={'h10'}>
        {titleText}
      </ResponsiveText>

      <View>
        <Image 
          style={{ width: 286, height: 286, alignSelf: 'center' }} 
          source={iconPath?.FaceLock} 
          // Add resize mode to prevent image loading issues
          resizeMode="contain"
        />
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
