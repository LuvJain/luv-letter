import { configureStore } from '@reduxjs/toolkit';
import smsReducer from './smsSlice.js';

export const store = configureStore({
  reducer: {
    sms: smsReducer,
  },
});

export default store;
