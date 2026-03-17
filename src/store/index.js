import { configureStore } from '@reduxjs/toolkit';
import templateReducer from './template-slice';

export const store = configureStore({
  reducer: {
    templates: templateReducer,
  },
});
