export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recipients, subject, html, settings } = req.body;

    // Validate inputs
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Missing required field: recipients (array of email addresses)' });
    }
    if (!subject) {
      return res.status(400).json({ error: 'Missing required field: subject' });
    }
    if (!html) {
      return res.status(400).json({ error: 'Missing required field: html' });
    }
    if (!settings || !settings.apiKey || !settings.fromEmail) {
      return res.status(400).json({ error: 'Missing required settings: apiKey, fromEmail' });
    }

    const { apiKey, apiProvider, fromEmail, fromName } = settings;

    console.log('Sending Kiro newsletter:', {
      recipientCount: recipients.length,
      provider: apiProvider,
      subject,
    });

    const results = {
      sent: 0,
      failed: 0,
      errors: [],
    };

    // Send to each recipient individually (each gets their own unsubscribe link)
    for (const recipient of recipients) {
      try {
        const recipientEmail = recipient.email;
        const recipientHtml = recipient.html || html;

        if (apiProvider === 'resend') {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
              to: recipientEmail,
              subject: subject,
              html: recipientHtml,
            }),
          });

          if (response.ok) {
            results.sent++;
          } else {
            const error = await response.json();
            results.failed++;
            results.errors.push({ email: recipientEmail, error: error.message || 'Resend API error' });
          }
        } else if (apiProvider === 'sendgrid') {
          const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              personalizations: [
                {
                  to: [{ email: recipientEmail }],
                },
              ],
              from: {
                email: fromEmail,
                name: fromName || undefined,
              },
              subject: subject,
              content: [
                {
                  type: 'text/html',
                  value: recipientHtml,
                },
              ],
            }),
          });

          if (response.ok || response.status === 202) {
            results.sent++;
          } else {
            const error = await response.text();
            results.failed++;
            results.errors.push({ email: recipientEmail, error: error || 'SendGrid API error' });
          }
        } else {
          results.failed++;
          results.errors.push({ email: recipientEmail, error: `Unsupported provider: ${apiProvider}` });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({ email: recipient.email, error: error.message });
      }
    }

    console.log('Newsletter delivery results:', {
      sent: results.sent,
      failed: results.failed,
    });

    return res.status(200).json({
      success: results.sent > 0,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
  } catch (error) {
    console.error('Error sending Kiro newsletter:', {
      message: error.message,
    });
    return res.status(500).json({
      error: 'Failed to send newsletter',
      details: error.message,
    });
  }
}
