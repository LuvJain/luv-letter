import { createSlice } from '@reduxjs/toolkit';
import { MessageStatus } from '../types/sms.types.js';

/** @type {import('../types/sms.types.js').SmsState} */
const initialState = {
  messages: [],
  loading: false,
  error: null,
};

const smsSlice = createSlice({
  name: 'sms',
  initialState,
  reducers: {
    /**
     * Add a new SMS message to state
     * @param {import('../types/sms.types.js').SmsState} state
     * @param {{ payload: { recipientPhone: string, messageContent: string, scheduledTime: string } }} action
     */
    addMessage: (state, action) => {
      const now = new Date().toISOString();
      state.messages.push({
        id: Date.now().toString(),
        recipientPhone: action.payload.recipientPhone,
        messageContent: action.payload.messageContent,
        scheduledTime: action.payload.scheduledTime,
        status: MessageStatus.SCHEDULED,
        createdAt: now,
        updatedAt: now,
        retryCount: 0,
      });
    },

    /**
     * Update the delivery status of a message
     * @param {import('../types/sms.types.js').SmsState} state
     * @param {{ payload: { id: string, status: string } }} action
     */
    updateMessageStatus: (state, action) => {
      const { id, status } = action.payload;
      const message = state.messages.find((msg) => msg.id === id);
      if (message) {
        message.status = status;
        message.updatedAt = new Date().toISOString();
        if (status === MessageStatus.FAILED) {
          message.retryCount += 1;
        }
      }
    },

    /**
     * Remove a message from state by ID
     * @param {import('../types/sms.types.js').SmsState} state
     * @param {{ payload: string }} action
     */
    removeMessage: (state, action) => {
      state.messages = state.messages.filter(
        (msg) => msg.id !== action.payload,
      );
    },

    /**
     * Set loading state for async operations
     * @param {import('../types/sms.types.js').SmsState} state
     * @param {{ payload: boolean }} action
     */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    /**
     * Set error state
     * @param {import('../types/sms.types.js').SmsState} state
     * @param {{ payload: string|null }} action
     */
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

// Actions
export const {
  addMessage,
  updateMessageStatus,
  removeMessage,
  setLoading,
  setError,
} = smsSlice.actions;

// Selectors

/** Select all SMS messages */
export const selectAllMessages = (state) => state.sms.messages;

/** Select a single message by ID */
export const selectMessageById = (state, id) =>
  state.sms.messages.find((msg) => msg.id === id);

/** Select messages with SCHEDULED status (pending delivery) */
export const selectPendingMessages = (state) =>
  state.sms.messages.filter((msg) => msg.status === MessageStatus.SCHEDULED);

/** Select messages filtered by a given status */
export const selectMessagesByStatus = (state, status) =>
  state.sms.messages.filter((msg) => msg.status === status);

/** Select SMS loading state */
export const selectSmsLoading = (state) => state.sms.loading;

/** Select SMS error state */
export const selectSmsError = (state) => state.sms.error;

export default smsSlice.reducer;
