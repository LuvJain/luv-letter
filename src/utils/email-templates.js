// Email templates for scheduled message reminder notifications

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

/**
 * Generate an HTML email for a scheduled message reminder.
 *
 * @param {object} options
 * @param {string} options.messagePreview - Preview text of the scheduled message
 * @param {string} options.messageId - The scheduled message identifier
 * @param {string} options.recipientName - Name of the message recipient
 * @param {string} options.scheduledSendTime - ISO string of scheduled send time
 * @returns {string} HTML email string
 */
export const generateReminderEmail = ({ messagePreview, messageId, recipientName, scheduledSendTime }) => {
  const reviewUrl = `${APP_URL}/messages/${messageId}?utm_source=email_reminder`;
  const editUrl = `${APP_URL}/messages/${messageId}/edit?utm_source=email_reminder`;

  const formattedDate = new Date(scheduledSendTime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return `<!DOCTYPE html>
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
        Your message to <strong>${recipientName}</strong> is scheduled to be sent on:
      </p>
      <p style="color: #667eea; font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0;">
        ${formattedDate}
      </p>
      <p style="color: #333333; line-height: 1.6; font-size: 16px;">
        Here's a preview of your message:
      </p>
      <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <p style="color: #333333; margin: 0; font-size: 14px; line-height: 1.6;">
          ${messagePreview}
        </p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${reviewUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 16px; font-weight: bold; margin: 0 8px;">
          Review Message
        </a>
        <a href="${editUrl}" style="display: inline-block; background-color: #764ba2; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 16px; font-weight: bold; margin: 0 8px;">
          Edit Message
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
</html>`;
};
