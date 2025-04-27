// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import authReducer from './slices/authSlice';
import coinsReducer from './slices/coinsSlice';
import cryptoReducer from './slices/cryptoSlice';
export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    coins: coinsReducer,
    crypto: cryptoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;