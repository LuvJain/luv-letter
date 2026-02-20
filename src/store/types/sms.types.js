/**
 * SMS Message Type Definitions
 *
 * TypeScript-style JSDoc type definitions for the SMS messaging system.
 */

/**
 * Message delivery status enum.
 * @readonly
 * @enum {string}
 */
export const MessageStatus = {
  SCHEDULED: 'scheduled',
  SENT: 'sent',
  FAILED: 'failed',
};

/**
 * @typedef {Object} Message
 * @property {string} id - Unique message identifier
 * @property {string} recipientPhone - Recipient phone number
 * @property {string} messageContent - SMS message body text
 * @property {string} scheduledTime - ISO 8601 datetime string for when the message should be sent
 * @property {('scheduled'|'sent'|'failed')} status - Current delivery status of the message
 * @property {string} createdAt - ISO 8601 datetime string when the message was created
 * @property {string} updatedAt - ISO 8601 datetime string when the message was last updated
 * @property {number} retryCount - Number of delivery retry attempts
 */

/**
 * @typedef {Object} SmsState
 * @property {Message[]} messages - Array of SMS messages
 * @property {boolean} loading - Whether an async operation is in progress
 * @property {string|null} error - Error message from the last failed operation, or null
 */
