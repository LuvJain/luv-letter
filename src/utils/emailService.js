// Email service for sending newsletters

export async function sendEmail({ to, subject, html, settings }) {
  const { apiKey, apiProvider, fromEmail, fromName } = settings;

  if (!apiKey || !fromEmail) {
    throw new Error('API key and from email are required');
  }

  if (apiProvider === 'resend') {
    return sendViaResend({ to, subject, html, fromEmail, fromName, apiKey });
  } else if (apiProvider === 'sendgrid') {
    return sendViaSendGrid({ to, subject, html, fromEmail, fromName, apiKey });
  } else {
    throw new Error('Unsupported email provider');
  }
}

async function sendViaResend({ to, subject, html, fromEmail, fromName, apiKey }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
      to: to,
      subject: subject,
      html: html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send email via Resend');
  }

  return await response.json();
}

async function sendViaSendGrid({ to, subject, html, fromEmail, fromName, apiKey }) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: to.map(email => ({ email })),
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
          value: html,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to send email via SendGrid');
  }

  return { success: true };
}
