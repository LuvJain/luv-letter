// Email preferences management for reminder notifications

import { getEmailPreferencesStore, saveEmailPreferencesStore } from './storage.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate an email address format.
 * @param {string} email
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Email cannot be empty' };
  }

  if (!trimmed.includes('@')) {
    return { valid: false, error: 'Email must contain an @ symbol' };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Email format is invalid (expected: user@domain.com)' };
  }

  return { valid: true };
};

/**
 * Get email preferences for a user.
 * @param {string} userId
 * @returns {{ email: string, unsubscribe_status: boolean, snooze_until: string|null }}
 */
export const getEmailPreferences = (userId) => {
  return getEmailPreferencesStore(userId);
};

/**
 * Update the email address for a user.
 * @param {string} userId
 * @param {string} email
 * @returns {{ success: boolean, error?: string }}
 */
export const updateEmail = (userId, email) => {
  const validation = validateEmail(email);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const prefs = getEmailPreferencesStore(userId);
  prefs.email = email.trim();
  saveEmailPreferencesStore(userId, prefs);
  return { success: true };
};

/**
 * Set the unsubscribe status for a user.
 * @param {string} userId
 * @param {boolean} status - true to unsubscribe, false to re-enable
 * @returns {{ success: boolean }}
 */
export const setUnsubscribed = (userId, status) => {
  const prefs = getEmailPreferencesStore(userId);
  prefs.unsubscribe_status = Boolean(status);
  saveEmailPreferencesStore(userId, prefs);
  return { success: true };
};

/**
 * Set a snooze period for reminder notifications.
 * @param {string} userId
 * @param {number} daysToSnooze - number of days to snooze reminders
 * @returns {{ success: boolean, snooze_until: string, error?: string }}
 */
export const setSnoozePeriod = (userId, daysToSnooze) => {
  if (typeof daysToSnooze !== 'number' || daysToSnooze <= 0 || !Number.isFinite(daysToSnooze)) {
    return { success: false, error: 'Snooze period must be a positive number of days' };
  }

  const snoozeUntil = new Date();
  snoozeUntil.setDate(snoozeUntil.getDate() + daysToSnooze);
  const snoozeUntilISO = snoozeUntil.toISOString();

  const prefs = getEmailPreferencesStore(userId);
  prefs.snooze_until = snoozeUntilISO;
  saveEmailPreferencesStore(userId, prefs);
  return { success: true, snooze_until: snoozeUntilISO };
};

/**
 * Check if reminders are currently active for a user.
 * Returns true if reminders should be sent (not unsubscribed and not snoozed).
 * @param {string} userId
 * @returns {boolean}
 */
export const areRemindersActive = (userId) => {
  const prefs = getEmailPreferencesStore(userId);

  if (prefs.unsubscribe_status) {
    return false;
  }

  if (prefs.snooze_until) {
    const snoozeExpiry = new Date(prefs.snooze_until);
    if (snoozeExpiry > new Date()) {
      return false;
    }
  }

  return true;
};
