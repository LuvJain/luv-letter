import { configureStore } from '@reduxjs/toolkit';
import smsReducer from './slices/smsSlice';

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
} from './slices/smsSlice';

export {
  selectAllMessages,
  selectSmsLoading,
  selectSmsError,
  selectMessageById,
  selectPendingMessages,
  selectMessagesByStatus,
} from './slices/smsSlice';

export { MessageStatus } from './slices/sms.types';
