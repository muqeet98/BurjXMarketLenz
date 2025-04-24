// src/hooks/useTheme.ts
import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setTheme } from '../store/slices/themeSlice';

export const lightTheme = {
  BurjXGreen: '#CDFF00',
  background: '#FFFFFF',
  cardBackground: '#F5F5F5',
  text: '#000000',
  secondaryText: '#555555',
  accent: '#3861FB',
  border: '#E0E0E0',
  positive: '#16C784',
  negative: '#EA3943',
  blackblack: '#000000',
  chart: {
    positive: '#16C784',
    negative: '#EA3943',
    grid: '#E0E0E0',
  },
};

export const darkTheme = {
  BurjXGreen: '#CDFF00',
  background: '#121212',
  cardBackground: '#1E1E1E',
  text: '#FFFFFF',
  secondaryText: '#BBBBBB',
  accent: '#3861FB',
  border: '#333333',
  positive: '#16C784',
  negative: '#EA3943',
  blackblack: '#000000',
  chart: {
    positive: '#16C784',
    negative: '#EA3943',
    grid: '#333333',
  },
};

export type Theme = typeof lightTheme;

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  isDarkMode: true,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const systemColorScheme = useColorScheme();
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const toggleTheme = () => {
    dispatch(setTheme(!isDarkMode));
  };
  
  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);