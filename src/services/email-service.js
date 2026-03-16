// Email service for sending reminder notifications via SMTP

import { getEmailPreferencesStore } from '../utils/storage.js';

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

// Build reminder email HTML content
const buildReminderHTML = (messagePreview, messageId) => {
  const reviewUrl = `${process.env.APP_URL || 'http://localhost:5173'}/messages/${messageId}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scheduled Message Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
        Scheduled Message Reminder
      </h1>
    </div>

    <div style="padding: 30px 20px;">
      <p style="color: #333333; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
        Your scheduled message is about to be sent. Here's a preview:
      </p>

      <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 20px; border-radius: 4px;">
        <p style="color: #333333; margin: 0; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">
          ${messagePreview}
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${reviewUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: bold;">
          Review &amp; Edit Message
        </a>
      </div>
    </div>

    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #999999; margin: 0; font-size: 12px;">
        Sent with Luv Letter
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

// Send a reminder email for a scheduled message
export const sendReminderEmail = async (userId, messageId, messagePreview) => {
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

  const htmlContent = buildReminderHTML(
    messagePreview || 'No preview available',
    messageId,
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
