import { configureStore } from '@reduxjs/toolkit';
import smsReducer from './smsSlice.js';

export const store = configureStore({
  reducer: {
    sms: smsReducer,
  },
});

// Re-export sms actions and selectors for convenient imports
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
} from './smsSlice.js';

// Re-export types
export { MessageStatus } from './sms.types.js';
