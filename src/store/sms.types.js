/**
 * SMS message status values.
 * @readonly
 * @enum {string}
 */
export const MessageStatus = Object.freeze({
  SCHEDULED: 'scheduled',
  SENT: 'sent',
  FAILED: 'failed',
});

/**
 * @typedef {Object} Message
 * @property {string} id - Unique identifier for the message
 * @property {string} recipientPhone - Recipient phone number (E.164 format preferred)
 * @property {string} messageContent - The SMS message body
 * @property {string} scheduledTime - ISO 8601 timestamp for when the message should be sent
 * @property {'scheduled'|'sent'|'failed'} status - Current delivery status
 * @property {string} createdAt - ISO 8601 timestamp of when the message was created
 * @property {string} updatedAt - ISO 8601 timestamp of the last status update
 * @property {number} retryCount - Number of delivery retry attempts
 */

/**
 * @typedef {Object} SmsState
 * @property {Message[]} messages - Array of all SMS messages
 * @property {boolean} loading - Whether an async SMS operation is in progress
 * @property {string|null} error - Error message from the last failed operation, or null
 */
