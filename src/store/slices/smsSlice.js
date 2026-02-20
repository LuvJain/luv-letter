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
     * Add a new SMS message to the store.
     * Automatically generates id, createdAt, updatedAt, and sets defaults for status and retryCount.
     * @param {import('../types/sms.types.js').SmsState} state
     * @param {{ payload: { recipientPhone: string, messageContent: string, scheduledTime: string } }} action
     */
    addMessage: (state, action) => {
      const now = new Date().toISOString();
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
     * Update the delivery status of a message by ID.
     * Also increments retryCount when status transitions to FAILED.
     * @param {import('../types/sms.types.js').SmsState} state
     * @param {{ payload: { id: string, status: ('scheduled'|'sent'|'failed') } }} action
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
     * Remove a message from the store by ID.
     * @param {import('../types/sms.types.js').SmsState} state
     * @param {{ payload: string }} action - The message ID to remove
     */
    removeMessage: (state, action) => {
      state.messages = state.messages.filter((msg) => msg.id !== action.payload);
    },

    /**
     * Set the loading state for async operations.
     * @param {import('../types/sms.types.js').SmsState} state
     * @param {{ payload: boolean }} action
     */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    /**
     * Set or clear the error state.
     * @param {import('../types/sms.types.js').SmsState} state
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

/**
 * Select all SMS messages.
 * @param {{ sms: import('../types/sms.types.js').SmsState }} state
 * @returns {import('../types/sms.types.js').Message[]}
 */
export const selectAllMessages = (state) => state.sms.messages;

/**
 * Select a single message by its ID.
 * @param {{ sms: import('../types/sms.types.js').SmsState }} state
 * @param {string} id
 * @returns {import('../types/sms.types.js').Message|undefined}
 */
export const selectMessageById = (state, id) =>
  state.sms.messages.find((msg) => msg.id === id);

/**
 * Select all messages with SCHEDULED status (pending delivery).
 * @param {{ sms: import('../types/sms.types.js').SmsState }} state
 * @returns {import('../types/sms.types.js').Message[]}
 */
export const selectPendingMessages = (state) =>
  state.sms.messages.filter((msg) => msg.status === MessageStatus.SCHEDULED);

/**
 * Select messages filtered by a specific status.
 * @param {{ sms: import('../types/sms.types.js').SmsState }} state
 * @param {('scheduled'|'sent'|'failed')} status
 * @returns {import('../types/sms.types.js').Message[]}
 */
export const selectMessagesByStatus = (state, status) =>
  state.sms.messages.filter((msg) => msg.status === status);

/**
 * Select the loading state.
 * @param {{ sms: import('../types/sms.types.js').SmsState }} state
 * @returns {boolean}
 */
export const selectSmsLoading = (state) => state.sms.loading;

/**
 * Select the error state.
 * @param {{ sms: import('../types/sms.types.js').SmsState }} state
 * @returns {string|null}
 */
export const selectSmsError = (state) => state.sms.error;

export default smsSlice.reducer;
