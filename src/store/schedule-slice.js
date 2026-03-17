import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  schedules: [],
  currentSchedule: {
    templateId: null,
    channel: 'sms',
    scheduledAt: '',
  },
  loading: false,
  error: null,
  recipients: [],
};

const scheduleSlice = createSlice({
  name: 'schedules',
  initialState,
  reducers: {
    setSchedules(state, action) {
      state.schedules = action.payload;
    },
    setCurrentSchedule(state, action) {
      state.currentSchedule = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    addSchedule(state, action) {
      state.schedules.unshift(action.payload);
    },
    updateSchedule(state, action) {
      const index = state.schedules.findIndex(
        (s) => s.id === action.payload.id
      );
      if (index !== -1) {
        state.schedules[index] = action.payload;
      }
    },
    deleteSchedule(state, action) {
      state.schedules = state.schedules.filter(
        (s) => s.id !== action.payload
      );
    },
    setRecipients(state, action) {
      state.recipients = action.payload;
    },
    resetCurrentSchedule(state) {
      state.currentSchedule = initialState.currentSchedule;
      state.recipients = [];
      state.error = null;
    },
  },
});

export const {
  setSchedules,
  setCurrentSchedule,
  setLoading,
  setError,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  setRecipients,
  resetCurrentSchedule,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;
