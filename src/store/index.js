import { configureStore } from '@reduxjs/toolkit';
import smsReducer from './slices/smsSlice.js';

export const store = configureStore({
  reducer: {
    sms: smsReducer,
  },
});

// Re-export actions and selectors for convenient imports
export {
  addMessage,
  updateMessageStatus,
  removeMessage,
  setLoading,
  setError,
  selectAllMessages,
  selectMessageById,
  selectPendingMessages,
  selectMessagesByStatus,
  selectSmsLoading,
  selectSmsError,
} from './slices/smsSlice.js';
