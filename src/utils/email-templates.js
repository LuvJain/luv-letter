// Email templates for reminder notifications

// Format a date for display in email templates
const formatScheduledTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Generate HTML email content for a scheduled message reminder
// Includes message preview, recipient name, scheduled send time, and action links
export const generateReminderEmail = (messagePreview, messageId, recipientName, scheduledSendTime) => {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const reviewUrl = `${appUrl}/messages/${messageId}?utm_source=email_reminder`;
  const editUrl = `${appUrl}/messages/${messageId}/edit?utm_source=email_reminder`;
  const formattedTime = formatScheduledTime(scheduledSendTime);

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
      <p style="color: #333333; line-height: 1.6; margin: 0 0 10px 0; font-size: 16px;">
        Your message to <strong>${recipientName}</strong> is scheduled to be sent on:
      </p>

      <p style="color: #667eea; font-size: 18px; font-weight: bold; margin: 0 0 20px 0;">
        ${formattedTime}
      </p>

      <p style="color: #333333; line-height: 1.6; margin: 0 0 10px 0; font-size: 16px;">
        Here's a preview of your message:
      </p>

      <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 20px; border-radius: 4px;">
        <p style="color: #333333; margin: 0; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${messagePreview || 'No preview available'}</p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${reviewUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: bold; margin-right: 10px;">
          Review Message
        </a>
        <a href="${editUrl}" style="display: inline-block; background-color: #ffffff; color: #667eea; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: bold; border: 2px solid #667eea;">
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
</html>
  `.trim();
};
