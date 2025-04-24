import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type AuthState = {
  isAuthenticated: boolean;
  biometricsEnabled: boolean;
};

const initialState: AuthState = {
  isAuthenticated: false,
  biometricsEnabled: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setBiometricsEnabled: (state, action: PayloadAction<boolean>) => {
      state.biometricsEnabled = action.payload;
    },
  },
});

export const { setAuthenticated, setBiometricsEnabled } = authSlice.actions;
export default authSlice.reducer;