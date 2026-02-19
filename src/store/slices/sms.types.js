/**
 * @readonly
 * @enum {string}
 */
export const MessageStatus = {
  SCHEDULED: 'SCHEDULED',
  SENT: 'SENT',
  FAILED: 'FAILED',
};

/**
 * @typedef {Object} Message
 * @property {string} id - Unique message identifier
 * @property {string} recipientPhone - Recipient phone number
 * @property {string} messageContent - SMS message body
 * @property {string} scheduledTime - ISO 8601 timestamp for scheduled delivery
 * @property {MessageStatus} status - Current delivery status
 * @property {string} createdAt - ISO 8601 timestamp of creation
 * @property {string} updatedAt - ISO 8601 timestamp of last update
 * @property {number} retryCount - Number of delivery retry attempts
 */

/**
 * @typedef {Object} SmsState
 * @property {Message[]} messages - Array of SMS messages
 * @property {boolean} loading - Whether an async operation is in progress
 * @property {string|null} error - Error message if last operation failed
 */
