// Email preferences utility for managing user reminder settings

import { getEmailPreferencesStore, saveEmailPreferencesStore } from './storage.js';

/**
 * Validate email format.
 * Returns an error message string if invalid, or null if valid.
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return 'Email is required';
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return 'Email is required';
  }

  // Basic email format validation: must have @, domain with dot
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Invalid email format: must contain @ and a valid domain';
  }

  return null;
};

/**
 * Get email preferences for a user.
 * Returns { email, unsubscribe_status, snooze_until } with defaults.
 */
export const getEmailPreferences = (userId) => {
  if (!userId) {
    return null;
  }

  const prefs = getEmailPreferencesStore(userId);

  // Check if snooze has expired and auto-clear it
  if (prefs.snooze_until) {
    const snoozeDate = new Date(prefs.snooze_until);
    if (snoozeDate <= new Date()) {
      prefs.snooze_until = null;
      saveEmailPreferencesStore(userId, prefs);
    }
  }

  return prefs;
};

/**
 * Update a user's email address.
 * Returns { success, error } object.
 */
export const updateEmail = (userId, email) => {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  const validationError = validateEmail(email);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const prefs = getEmailPreferencesStore(userId);
  prefs.email = email.trim();
  saveEmailPreferencesStore(userId, prefs);

  return { success: true };
};

/**
 * Set unsubscribe status for a user.
 * When true, user will not receive any email reminders.
 */
export const setUnsubscribed = (userId, status) => {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  if (typeof status !== 'boolean') {
    return { success: false, error: 'Unsubscribe status must be a boolean' };
  }

  const prefs = getEmailPreferencesStore(userId);
  prefs.unsubscribe_status = status;
  saveEmailPreferencesStore(userId, prefs);

  return { success: true };
};

/**
 * Set a snooze period for a user.
 * Reminders will be paused until the snooze period expires.
 * @param {string} userId - The user ID
 * @param {number} daysToSnooze - Number of days to snooze (must be positive integer)
 */
export const setSnoozePeriod = (userId, daysToSnooze) => {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  if (typeof daysToSnooze !== 'number' || !Number.isInteger(daysToSnooze) || daysToSnooze <= 0) {
    return { success: false, error: 'Snooze period must be a positive integer (number of days)' };
  }

  const snoozeUntil = new Date();
  snoozeUntil.setDate(snoozeUntil.getDate() + daysToSnooze);

  const prefs = getEmailPreferencesStore(userId);
  prefs.snooze_until = snoozeUntil.toISOString();
  saveEmailPreferencesStore(userId, prefs);

  return { success: true, snooze_until: snoozeUntil.toISOString() };
};

/**
 * Check whether reminders should be sent for a user.
 * Returns false if user is unsubscribed or snooze is active.
 */
export const shouldSendReminder = (userId) => {
  const prefs = getEmailPreferences(userId);
  if (!prefs) {
    return false;
  }

  if (prefs.unsubscribe_status) {
    return false;
  }

  if (prefs.snooze_until) {
    const snoozeDate = new Date(prefs.snooze_until);
    if (snoozeDate > new Date()) {
      return false;
    }
  }

  return true;
};
