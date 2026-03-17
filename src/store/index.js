import { configureStore } from '@reduxjs/toolkit';
import templateReducer from './template-slice';
import scheduleReducer from './schedule-slice';

export const store = configureStore({
  reducer: {
    templates: templateReducer,
    schedules: scheduleReducer,
  },
});
