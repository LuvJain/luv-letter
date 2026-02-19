/**
 * @file SMS message type definitions
 * @description TypeScript-style JSDoc type definitions for SMS messaging state
 */

/**
 * Enum for message delivery status
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
 * @property {string} id - Unique message identifier
 * @property {string} recipientPhone - Recipient phone number
 * @property {string} messageContent - SMS message body
 * @property {string} scheduledTime - ISO 8601 datetime for scheduled delivery
 * @property {('scheduled'|'sent'|'failed')} status - Current delivery status
 * @property {string} createdAt - ISO 8601 datetime when message was created
 * @property {string} updatedAt - ISO 8601 datetime when message was last updated
 * @property {number} retryCount - Number of delivery retry attempts
 */

/**
 * @typedef {Object} SmsState
 * @property {Message[]} messages - Array of SMS messages
 * @property {boolean} loading - Whether an async operation is in progress
 * @property {string|null} error - Error message if last operation failed
 */
