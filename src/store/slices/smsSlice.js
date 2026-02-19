import { createSlice } from '@reduxjs/toolkit';
import { MessageStatus } from './sms.types';

/** @type {import('./sms.types').SmsState} */
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
     * Add a new SMS message to the store.
     * Automatically assigns id, createdAt, updatedAt, and defaults for status/retryCount.
     * @param {import('./sms.types').SmsState} state
     * @param {{ payload: { recipientPhone: string, messageContent: string, scheduledTime: string } }} action
     */
    addMessage: (state, action) => {
      const now = new Date().toISOString();
      /** @type {import('./sms.types').Message} */
      const message = {
        id: Date.now().toString(),
        recipientPhone: action.payload.recipientPhone,
        messageContent: action.payload.messageContent,
        scheduledTime: action.payload.scheduledTime,
        status: MessageStatus.SCHEDULED,
        createdAt: now,
        updatedAt: now,
        retryCount: 0,
      };
      state.messages.push(message);
    },

    /**
     * Update the status of an existing message by id.
     * @param {import('./sms.types').SmsState} state
     * @param {{ payload: { id: string, status: import('./sms.types').MessageStatus } }} action
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
     * Remove a message from the store by id.
     * @param {import('./sms.types').SmsState} state
     * @param {{ payload: string }} action
     */
    removeMessage: (state, action) => {
      state.messages = state.messages.filter((msg) => msg.id !== action.payload);
    },

    /**
     * Set the loading state for async operations.
     * @param {import('./sms.types').SmsState} state
     * @param {{ payload: boolean }} action
     */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    /**
     * Set or clear the error state.
     * @param {import('./sms.types').SmsState} state
     * @param {{ payload: string|null }} action
     */
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

// Actions
export const { addMessage, updateMessageStatus, removeMessage, setLoading, setError } =
  smsSlice.actions;

// Selectors

/** @param {{ sms: import('./sms.types').SmsState }} state */
export const selectAllMessages = (state) => state.sms.messages;

/** @param {{ sms: import('./sms.types').SmsState }} state */
export const selectSmsLoading = (state) => state.sms.loading;

/** @param {{ sms: import('./sms.types').SmsState }} state */
export const selectSmsError = (state) => state.sms.error;

/**
 * Select a single message by its id.
 * @param {{ sms: import('./sms.types').SmsState }} state
 * @param {string} id
 * @returns {import('./sms.types').Message|undefined}
 */
export const selectMessageById = (state, id) =>
  state.sms.messages.find((msg) => msg.id === id);

/**
 * Select all messages with SCHEDULED status (pending delivery).
 * @param {{ sms: import('./sms.types').SmsState }} state
 * @returns {import('./sms.types').Message[]}
 */
export const selectPendingMessages = (state) =>
  state.sms.messages.filter((msg) => msg.status === MessageStatus.SCHEDULED);

/**
 * Select messages filtered by a given status.
 * @param {{ sms: import('./sms.types').SmsState }} state
 * @param {import('./sms.types').MessageStatus} status
 * @returns {import('./sms.types').Message[]}
 */
export const selectMessagesByStatus = (state, status) =>
  state.sms.messages.filter((msg) => msg.status === status);

export default smsSlice.reducer;
