/**
 * @enum {string} MessageStatus
 * Possible status values for an SMS message.
 */
export const MessageStatus = {
  SCHEDULED: 'scheduled',
  SENT: 'sent',
  FAILED: 'failed',
};

/**
 * @typedef {Object} Message
 * @property {string} id - Unique identifier for the message
 * @property {string} recipientPhone - Recipient's phone number
 * @property {string} messageContent - The SMS message body
 * @property {string} scheduledTime - ISO 8601 timestamp for scheduled delivery
 * @property {('scheduled'|'sent'|'failed')} status - Current delivery status
 * @property {string} createdAt - ISO 8601 timestamp of message creation
 * @property {string} updatedAt - ISO 8601 timestamp of last update
 * @property {number} retryCount - Number of delivery retry attempts
 */
