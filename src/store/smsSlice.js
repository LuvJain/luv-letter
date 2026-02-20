import { createSlice } from '@reduxjs/toolkit';
import { MessageStatus } from './sms.types.js';

/** @type {import('./sms.types.js').SmsState} */
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
     * Add a new message to the store.
     * Automatically assigns id, createdAt, updatedAt, and defaults for status/retryCount.
     * @param {import('./sms.types.js').SmsState} state
     * @param {{ payload: { recipientPhone: string, messageContent: string, scheduledTime: string } }} action
     */
    addMessage(state, action) {
      const now = new Date().toISOString();
      /** @type {import('./sms.types.js').Message} */
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
     * Update the status of an existing message by ID.
     * Increments retryCount when status transitions to FAILED.
     * @param {import('./sms.types.js').SmsState} state
     * @param {{ payload: { id: string, status: 'scheduled'|'sent'|'failed' } }} action
     */
    updateMessageStatus(state, action) {
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
     * @param {import('./sms.types.js').SmsState} state
     * @param {{ payload: string }} action - The message ID to remove
     */
    removeMessage(state, action) {
      state.messages = state.messages.filter((msg) => msg.id !== action.payload);
    },

    /**
     * Set the loading flag for async operations.
     * @param {import('./sms.types.js').SmsState} state
     * @param {{ payload: boolean }} action
     */
    setLoading(state, action) {
      state.loading = action.payload;
    },

    /**
     * Set or clear the error state.
     * @param {import('./sms.types.js').SmsState} state
     * @param {{ payload: string|null }} action
     */
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

// ── Actions ──────────────────────────────────────────────────────────────────
export const {
  addMessage,
  updateMessageStatus,
  removeMessage,
  setLoading,
  setError,
} = smsSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────

/** Select the full messages array. */
export const selectAllMessages = (state) => state.sms.messages;

/** Select a single message by its ID. Returns undefined if not found. */
export const selectMessageById = (state, id) =>
  state.sms.messages.find((msg) => msg.id === id);

/** Select all messages with SCHEDULED status (i.e. pending / not yet sent). */
export const selectPendingMessages = (state) =>
  state.sms.messages.filter((msg) => msg.status === MessageStatus.SCHEDULED);

/** Select messages filtered by a given status value. */
export const selectMessagesByStatus = (state, status) =>
  state.sms.messages.filter((msg) => msg.status === status);

/** Select the loading flag. */
export const selectSmsLoading = (state) => state.sms.loading;

/** Select the error value. */
export const selectSmsError = (state) => state.sms.error;

// ── Reducer ──────────────────────────────────────────────────────────────────
export default smsSlice.reducer;
