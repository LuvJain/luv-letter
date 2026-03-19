import { createSlice } from '@reduxjs/toolkit';
import { MessageStatus } from './sms.types.js';

const initialState = {
  messages: [],
  loading: false,
  error: null,
};

const smsSlice = createSlice({
  name: 'sms',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const now = new Date().toISOString();
      state.messages.push({
        id: action.payload.id || crypto.randomUUID(),
        recipientPhone: action.payload.recipientPhone,
        messageContent: action.payload.messageContent,
        scheduledTime: action.payload.scheduledTime,
        status: MessageStatus.SCHEDULED,
        createdAt: now,
        updatedAt: now,
        retryCount: 0,
      });
    },
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
    removeMessage: (state, action) => {
      state.messages = state.messages.filter((msg) => msg.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

// Selectors
export const selectAllMessages = (state) => state.sms.messages;

export const selectMessageById = (id) => (state) =>
  state.sms.messages.find((msg) => msg.id === id);

export const selectPendingMessages = (state) =>
  state.sms.messages.filter((msg) => msg.status === MessageStatus.SCHEDULED);

export const selectMessagesByStatus = (status) => (state) =>
  state.sms.messages.filter((msg) => msg.status === status);

export const { addMessage, updateMessageStatus, removeMessage, setLoading, setError } =
  smsSlice.actions;

export default smsSlice.reducer;
