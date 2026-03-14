// Email service for sending scheduled message reminder notifications

import nodemailer from 'nodemailer';
import { getEmailPreferencesStore } from '../utils/storage.js';
import { generateReminderEmail } from '../utils/email-templates.js';

/**
 * Create SMTP transporter using environment variables.
 * @returns {import('nodemailer').Transporter}
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: parseInt(process.env.SMTP_PORT, 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send a reminder email for a scheduled message.
 * Checks unsubscribe status and snooze period before sending.
 *
 * @param {string} userId - The user to notify
 * @param {string} messageId - The scheduled message identifier
 * @param {string} messagePreview - Preview text of the scheduled message
 * @param {string} [recipientName] - Name of the message recipient
 * @param {string} [scheduledSendTime] - ISO string of scheduled send time
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
export const sendReminderEmail = async (userId, messageId, messagePreview, recipientName, scheduledSendTime) => {
  // Retrieve user email preferences from storage
  const prefs = getEmailPreferencesStore(userId);

  if (!prefs.email) {
    return { sent: false, reason: 'No email address configured for user' };
  }

  // Check unsubscribe status
  if (prefs.unsubscribe_status) {
    return { sent: false, reason: 'User has unsubscribed from reminders' };
  }

  // Check snooze period
  if (prefs.snooze_until) {
    const snoozeExpiry = new Date(prefs.snooze_until);
    if (snoozeExpiry > new Date()) {
      return { sent: false, reason: `Reminders snoozed until ${prefs.snooze_until}` };
    }
  }

  const transporter = createTransporter();

  const html = generateReminderEmail({
    messagePreview,
    messageId,
    recipientName: recipientName || 'Recipient',
    scheduledSendTime: scheduledSendTime || new Date().toISOString(),
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: prefs.email,
    subject: `Reminder: Your scheduled message to ${recipientName || 'Recipient'} is about to be sent`,
    html,
  };

  await transporter.sendMail(mailOptions);

  return { sent: true };
};
