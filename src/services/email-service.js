// Email service for sending scheduled message reminder notifications

import nodemailer from 'nodemailer';
import { getEmailPreferencesStore } from '../utils/storage.js';

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
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
export const sendReminderEmail = async (userId, messageId, messagePreview) => {
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

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: prefs.email,
    subject: `Reminder: Your scheduled message is about to be sent`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
        Scheduled Message Reminder
      </h1>
    </div>
    <div style="padding: 30px 20px;">
      <p style="color: #333333; line-height: 1.6; font-size: 16px;">
        Your scheduled message is about to be sent. Here's a preview:
      </p>
      <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <p style="color: #333333; margin: 0; font-size: 14px; line-height: 1.6;">
          ${messagePreview}
        </p>
      </div>
      <p style="color: #666666; font-size: 14px; margin-top: 20px;">
        Message ID: ${messageId}
      </p>
    </div>
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #999999; margin: 0; font-size: 12px;">
        Sent with Luv Letter
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };

  await transporter.sendMail(mailOptions);

  return { sent: true };
};
