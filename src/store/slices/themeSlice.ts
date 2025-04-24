// src/store/slices/themeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeState = {
  isDarkMode: boolean;
};

const initialState: ThemeState = {
  isDarkMode: true, // Default dark theme
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
