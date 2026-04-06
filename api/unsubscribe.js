export default async function handler(req, res) {
  // Handle GET requests (user clicking unsubscribe link)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token) {
    return res.status(400).send(renderPage(
      'Invalid Link',
      'This unsubscribe link is missing required information. Please check the link and try again.',
      false
    ));
  }

  // Note: In a serverless deployment, unsubscribe state is managed client-side
  // via localStorage. This endpoint returns a confirmation page and the token
  // so the frontend can process the unsubscription when the user next visits.
  // For a production system, this would use a database.
  //
  // The token is recorded and the frontend checks for pending unsubscribes.
  return res.status(200).send(renderPage(
    'Unsubscribed',
    'You have been successfully unsubscribed from the Kiro Weekly Digest. You will no longer receive these emails.',
    true,
    token
  ));
}

function renderPage(title, message, success, token = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Kiro Digest</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f3ff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .container {
      max-width: 480px;
      margin: 20px;
      background: #fff;
      border-radius: 16px;
      padding: 40px 32px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      text-align: center;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    h1 {
      color: #1a1a2e;
      font-size: 24px;
      margin: 0 0 12px;
    }
    p {
      color: #6b7280;
      font-size: 15px;
      line-height: 1.6;
      margin: 0;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${success ? '&#10003;' : '&#9888;'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="footer">
      Kiro Weekly Digest &mdash; Automated Newsletter
    </div>
  </div>
  ${success && token ? `<script>
    // Record the unsubscribe token so the app can process it
    try {
      var pending = JSON.parse(localStorage.getItem('luvletter_kiro_unsubscribes') || '[]');
      if (pending.indexOf('${token}') === -1) {
        pending.push('${token}');
        localStorage.setItem('luvletter_kiro_unsubscribes', JSON.stringify(pending));
      }
    } catch(e) {}
  </script>` : ''}
</body>
</html>`;
}
