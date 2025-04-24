// src/screens/AuthScreen.tsx
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import BiometricAuth from '../components/BiometricAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

interface AuthScreenProps {
  navigation: AuthScreenNavigationProp;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();

  const handleAuthSuccess = () => {
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <BiometricAuth onSuccess={handleAuthSuccess} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AuthScreen;
