// Email service for sending reminder notifications via SMTP

import { getEmailPreferencesStore } from '../utils/storage.js';
import { generateReminderEmail } from '../utils/email-templates.js';

// Check if user has unsubscribed or is in a snooze period
const shouldSendToUser = (preferences) => {
  if (!preferences || !preferences.email) {
    return false;
  }

  if (preferences.unsubscribe_status) {
    return false;
  }

  if (preferences.snooze_until) {
    const snoozeEnd = new Date(preferences.snooze_until);
    if (snoozeEnd > new Date()) {
      return false;
    }
  }

  return true;
};

// Send a reminder email for a scheduled message
export const sendReminderEmail = async (userId, messageId, messagePreview, recipientName, scheduledSendTime) => {
  if (!userId) {
    throw new Error('userId is required');
  }

  if (!messageId) {
    throw new Error('messageId is required');
  }

  // Retrieve user email preferences from storage
  const preferences = getEmailPreferencesStore(userId);

  // Check unsubscribe_status and snooze_until before sending
  if (!shouldSendToUser(preferences)) {
    return {
      success: false,
      skipped: true,
      reason: !preferences.email
        ? 'No email address on file'
        : preferences.unsubscribe_status
          ? 'User has unsubscribed'
          : 'User is in snooze period',
    };
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error('SMTP configuration is incomplete: SMTP_HOST, SMTP_USER, and SMTP_PASS are required');
  }

  // Dynamic import of nodemailer to keep it server-side only
  const nodemailer = await import('nodemailer');

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: Number(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const htmlContent = generateReminderEmail(
    messagePreview || 'No preview available',
    messageId,
    recipientName || 'your recipient',
    scheduledSendTime || new Date().toISOString(),
  );

  const mailOptions = {
    from: smtpUser,
    to: preferences.email,
    subject: 'Reminder: Your scheduled message is about to be sent',
    html: htmlContent,
  };

  const result = await transporter.sendMail(mailOptions);

  return {
    success: true,
    messageId: result.messageId,
    to: preferences.email,
  };
};
