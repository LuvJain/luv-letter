import { configureStore } from '@reduxjs/toolkit';
import smsReducer, {
  addMessage,
  updateMessageStatus,
  removeMessage,
  setLoading,
  setError,
  selectAllMessages,
  selectMessageById,
  selectPendingMessages,
  selectMessagesByStatus,
} from './smsSlice.js';
import { MessageStatus } from './sms.types.js';

function createStore() {
  return configureStore({ reducer: { sms: smsReducer } });
}

// Simple test runner
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`✓ ${name}`);
  } catch (e) {
    failed++;
    console.error(`✗ ${name}: ${e.message}`);
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

// Tests
test('initial state has empty messages, loading false, error null', () => {
  const store = createStore();
  const state = store.getState().sms;
  assert(Array.isArray(state.messages) && state.messages.length === 0);
  assert(state.loading === false);
  assert(state.error === null);
});

test('addMessage adds a message with correct fields', () => {
  const store = createStore();
  store.dispatch(addMessage({
    id: 'test-1',
    recipientPhone: '+15551234567',
    messageContent: 'Hello!',
    scheduledTime: '2026-03-20T10:00:00Z',
  }));
  const messages = selectAllMessages(store.getState());
  assert(messages.length === 1);
  const msg = messages[0];
  assert(msg.id === 'test-1');
  assert(msg.recipientPhone === '+15551234567');
  assert(msg.messageContent === 'Hello!');
  assert(msg.scheduledTime === '2026-03-20T10:00:00Z');
  assert(msg.status === MessageStatus.SCHEDULED);
  assert(msg.retryCount === 0);
  assert(msg.createdAt);
  assert(msg.updatedAt);
});

test('updateMessageStatus changes status and updatedAt', () => {
  const store = createStore();
  store.dispatch(addMessage({ id: 'test-2', recipientPhone: '+1', messageContent: 'Hi', scheduledTime: '2026-03-20T10:00:00Z' }));
  store.dispatch(updateMessageStatus({ id: 'test-2', status: MessageStatus.SENT }));
  const msg = selectMessageById('test-2')(store.getState());
  assert(msg.status === MessageStatus.SENT);
});

test('updateMessageStatus increments retryCount on FAILED', () => {
  const store = createStore();
  store.dispatch(addMessage({ id: 'test-3', recipientPhone: '+1', messageContent: 'Hi', scheduledTime: '2026-03-20T10:00:00Z' }));
  store.dispatch(updateMessageStatus({ id: 'test-3', status: MessageStatus.FAILED }));
  store.dispatch(updateMessageStatus({ id: 'test-3', status: MessageStatus.FAILED }));
  const msg = selectMessageById('test-3')(store.getState());
  assert(msg.retryCount === 2, `Expected 2, got ${msg.retryCount}`);
});

test('removeMessage removes the message', () => {
  const store = createStore();
  store.dispatch(addMessage({ id: 'test-4', recipientPhone: '+1', messageContent: 'Hi', scheduledTime: '2026-03-20T10:00:00Z' }));
  store.dispatch(removeMessage('test-4'));
  assert(selectAllMessages(store.getState()).length === 0);
});

test('setLoading and setError work', () => {
  const store = createStore();
  store.dispatch(setLoading(true));
  assert(store.getState().sms.loading === true);
  store.dispatch(setError('Something went wrong'));
  assert(store.getState().sms.error === 'Something went wrong');
});

test('selectPendingMessages returns only scheduled messages', () => {
  const store = createStore();
  store.dispatch(addMessage({ id: 'm1', recipientPhone: '+1', messageContent: 'A', scheduledTime: '2026-03-20T10:00:00Z' }));
  store.dispatch(addMessage({ id: 'm2', recipientPhone: '+2', messageContent: 'B', scheduledTime: '2026-03-20T11:00:00Z' }));
  store.dispatch(updateMessageStatus({ id: 'm2', status: MessageStatus.SENT }));
  const pending = selectPendingMessages(store.getState());
  assert(pending.length === 1);
  assert(pending[0].id === 'm1');
});

test('selectMessagesByStatus filters correctly', () => {
  const store = createStore();
  store.dispatch(addMessage({ id: 's1', recipientPhone: '+1', messageContent: 'A', scheduledTime: '2026-03-20T10:00:00Z' }));
  store.dispatch(addMessage({ id: 's2', recipientPhone: '+2', messageContent: 'B', scheduledTime: '2026-03-20T11:00:00Z' }));
  store.dispatch(updateMessageStatus({ id: 's1', status: MessageStatus.FAILED }));
  const failedMsgs = selectMessagesByStatus(MessageStatus.FAILED)(store.getState());
  assert(failedMsgs.length === 1);
  assert(failedMsgs[0].id === 's1');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
