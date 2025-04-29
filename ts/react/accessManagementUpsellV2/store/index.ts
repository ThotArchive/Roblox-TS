import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import accessManagementReducer from '../accessManagement/accessManagementSlice';
import verificationReducer from '../recourses/IDVerification/verificationSlice';
import emailVerificationReducer from '../recourses/emailVerification/emailVerificationSlice';

export const store = configureStore({
  reducer: {
    accessManagement: accessManagementReducer,
    verification: verificationReducer,
    emailVerification: emailVerificationReducer
  }
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
