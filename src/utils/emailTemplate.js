export function generateNewsletterHTML(events, introMessage, settings) {
  const formatDate = (dateString) => {
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

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const fromName = settings.fromName || 'Your Friend';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentMonth} Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
        ${currentMonth}
      </h1>
      <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">
        Update from ${fromName}
      </p>
    </div>

    <!-- Intro Message -->
    <div style="padding: 30px 20px;">
      <p style="color: #333333; line-height: 1.6; margin: 0; font-size: 16px;">
        ${introMessage.replace(/\n/g, '<br>')}
      </p>
    </div>

    <!-- Events Section -->
    ${events.length > 0 ? `
    <div style="padding: 0 20px 30px 20px;">
      <h2 style="color: #333333; font-size: 22px; margin: 0 0 20px 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
        Where I'll Be
      </h2>

      ${events.map(event => `
        <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 20px; border-radius: 4px;">
          <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 18px;">
            ${event.title}
          </h3>
          <p style="color: #666666; margin: 0 0 8px 0; font-size: 14px;">
            📅 ${formatDate(event.date)}
          </p>
          ${event.location ? `
            <p style="color: #666666; margin: 0 0 8px 0; font-size: 14px;">
              📍 ${event.location}
            </p>
          ` : ''}
          ${event.description ? `
            <p style="color: #666666; margin: 8px 0 0 0; font-size: 14px; line-height: 1.5;">
              ${event.description}
            </p>
          ` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #666666; margin: 0; font-size: 14px;">
        Hope to see you soon! 💜
      </p>
      <p style="color: #999999; margin: 10px 0 0 0; font-size: 12px;">
        Sent with Luv Letter
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
