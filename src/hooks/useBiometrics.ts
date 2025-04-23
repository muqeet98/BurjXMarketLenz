import { useState, useEffect } from 'react';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

export const useBiometrics = () => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create an instance of ReactNativeBiometrics
  const rnBiometrics = new ReactNativeBiometrics();

  useEffect(() => {
    (async () => {
      try {
        const { available, biometryType } = await rnBiometrics.isSensorAvailable();
        setIsBiometricSupported(available);

        if (available) {
          // If biometrics are available, we assume they're enrolled
          // This is a simplification, as react-native-biometrics doesn't have a direct equivalent
          // to Expo's isEnrolledAsync()
          setIsBiometricEnrolled(true);
        }
      } catch (e) {
        setError('Failed to check biometric availability');
        console.error(e);
      }
    })();
  }, []);

  const authenticate = async () => {
    setAuthenticating(true);
    setError(null);
    
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate to access your crypto portfolio',
        cancelButtonText: 'Cancel',
      });
      
      setIsAuthenticated(success);
      return success;
    } catch (e) {
      setError('Authentication failed');
      console.error(e);
      return false;
    } finally {
      setAuthenticating(false);
    }
  };

  const promptEnrollBiometrics = () => {
    // This would normally redirect to system settings
    // Since we can't do that directly with react-native-biometrics, we'll just show a message
    setError('Please set up biometrics in your device settings');
  };

  return {
    isBiometricSupported,
    isBiometricEnrolled,
    isAuthenticated,
    authenticating,
    error,
    authenticate,
    promptEnrollBiometrics,
  };
};