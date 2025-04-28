// src/components/BiometricAuth.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, SafeAreaView, Platform } from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { useDispatch } from 'react-redux';
import { setAuthenticated } from '../store/slices/authSlice';
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
  
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        await checkBiometricsState();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);

  // Check biometrics availability and stored state in one function
  const checkBiometricsState = async () => {
    try {
      // Check if biometrics are available on the device
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      
      if (available) {
        setBiometryType(biometryType);
        
        // Check if biometrics are enabled in AsyncStorage
        const storedState = await AsyncStorage.getItem('biometricsEnabled');
        const isEnabled = storedState === 'true';
        setIsBiometricsEnabled(isEnabled);
      } else {
        Alert.alert(
          'Biometrics Not Available',
          'Your device does not support biometric authentication. You can still use the app with manual authentication.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error checking biometrics:', error);
    }
  };

  const handleAuthSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      navigation.navigate('Home');
    }
  };

  const handleAuthentication = async () => {
    try {
      // Adjust prompt message based on biometry type and whether it's already set up
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
        fallbackPromptMessage: 'Please use your device passcode',
      });
      
      if (result && result.success) {
        // If not already enabled, save the setup state
        if (!isBiometricsEnabled) {
          await AsyncStorage.setItem('biometricsEnabled', 'true');
          setIsBiometricsEnabled(true);
        }
        
        // Mark as authenticated and proceed
        await AsyncStorage.setItem('isAuthenticated', 'true');
        handleAuthSuccess();
        dispatch(setAuthenticated(true));
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Only show alert if not a user cancellation
      if (Platform.OS === 'ios' && error.message && !error.message.includes('cancelled')) {
        Alert.alert(
          'Authentication Failed',
          'Please try again or use an alternative login method.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const skipAuthentication = async () => {
    // Skip biometric setup
    await AsyncStorage.setItem('biometricsEnabled', 'false');
    await AsyncStorage.setItem('isAuthenticated', 'true');
    dispatch(setAuthenticated(true));
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

  // Determine title text based on biometry type and setup state
  let titleText = 'Use Biometric\nto log in?';
  if (biometryType === BiometryTypes.FaceID) {
    titleText = isBiometricsEnabled ? 'Verify with Face ID' : 'Use Face ID\nto log in?';
  } else if (biometryType === BiometryTypes.TouchID) {
    titleText = isBiometricsEnabled ? 'Verify with Touch ID' : 'Use Touch ID\nto log in?';
  }
    
  // Determine button text based on setup state
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

        {/* {!isBiometricsEnabled && (
          <TouchableOpacity
            style={[styles.skipButton]}
            onPress={skipAuthentication}
          >
            <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>Skip for now</Text>
          </TouchableOpacity>
        )} */}
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