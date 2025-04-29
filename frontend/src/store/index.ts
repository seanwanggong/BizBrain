import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Define the root state type
export type RootState = ReturnType<typeof store.getState>;

// Create the store
export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// Type definitions for hooks
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 