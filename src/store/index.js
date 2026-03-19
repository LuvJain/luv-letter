import { configureStore } from '@reduxjs/toolkit';
import smsReducer from './smsSlice.js';

const store = configureStore({
  reducer: {
    sms: smsReducer,
  },
});

export default store;
