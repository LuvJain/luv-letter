/**
 * SMS Message Status Enum
 * @readonly
 * @enum {string}
 */
export const MessageStatus = Object.freeze({
  /** Message is scheduled for future delivery */
  SCHEDULED: 'scheduled',
  /** Message has been successfully sent */
  SENT: 'sent',
  /** Message delivery failed */
  FAILED: 'failed',
});

/**
 * @typedef {Object} Message
 * @property {string} id - Unique message identifier
 * @property {string} recipientPhone - Recipient phone number in E.164 format
 * @property {string} messageContent - SMS message body text
 * @property {string} scheduledTime - ISO 8601 timestamp for scheduled delivery
 * @property {('scheduled'|'sent'|'failed')} status - Current delivery status
 * @property {string} createdAt - ISO 8601 timestamp of message creation
 * @property {string} updatedAt - ISO 8601 timestamp of last status update
 * @property {number} retryCount - Number of delivery retry attempts
 */

/**
 * @typedef {Object} SmsState
 * @property {Message[]} messages - Array of SMS messages
 * @property {boolean} loading - Whether an async operation is in progress
 * @property {string|null} error - Error message from the last failed operation
 */
