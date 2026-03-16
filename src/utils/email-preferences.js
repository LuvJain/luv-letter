// Email preferences utility for managing reminder notification settings

import { getEmailPreferencesStore, saveEmailPreferences } from './storage.js';

// Basic email format validation
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  // Check for @ symbol, non-empty local part, non-empty domain with a dot
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get all email preferences for a user
export const getEmailPreferences = (userId) => {
  const prefs = getEmailPreferencesStore(userId);
  return {
    email: prefs.email || '',
    unsubscribe_status: prefs.unsubscribe_status || false,
    snooze_until: prefs.snooze_until || null,
    is_snoozed: prefs.snooze_until ? new Date(prefs.snooze_until) > new Date() : false,
  };
};

// Update user email address with validation
export const updateEmail = (userId, email) => {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  if (!email || typeof email !== 'string' || email.trim() === '') {
    return { success: false, error: 'Email is required and must be a non-empty string' };
  }

  if (!isValidEmail(email.trim())) {
    return { success: false, error: 'Invalid email format: must contain @ symbol and a valid domain' };
  }

  saveEmailPreferences(userId, { email: email.trim() });
  return { success: true, email: email.trim() };
};

// Set unsubscribe status for a user
export const setUnsubscribed = (userId, status) => {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  const unsubscribeStatus = Boolean(status);
  saveEmailPreferences(userId, { unsubscribe_status: unsubscribeStatus });
  return { success: true, unsubscribe_status: unsubscribeStatus };
};

// Set snooze period for a user (snooze for N days from now)
export const setSnoozePeriod = (userId, daysToSnooze) => {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  if (daysToSnooze === null || daysToSnooze === 0) {
    // Clear snooze
    saveEmailPreferences(userId, { snooze_until: null });
    return { success: true, snooze_until: null };
  }

  const days = Number(daysToSnooze);
  if (isNaN(days) || days < 0) {
    return { success: false, error: 'Snooze period must be a non-negative number of days' };
  }

  const snoozeUntil = new Date();
  snoozeUntil.setDate(snoozeUntil.getDate() + days);
  const snoozeUntilISO = snoozeUntil.toISOString();

  saveEmailPreferences(userId, { snooze_until: snoozeUntilISO });
  return { success: true, snooze_until: snoozeUntilISO };
};

// Check if reminders should be sent (not unsubscribed and not snoozed)
export const shouldSendReminders = (userId) => {
  const prefs = getEmailPreferences(userId);

  if (prefs.unsubscribe_status) {
    return false;
  }

  if (prefs.is_snoozed) {
    return false;
  }

  return true;
};

export { isValidEmail };
