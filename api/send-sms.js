export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, message } = req.body;

    // Validate inputs
    if (!to || !message) {
      return res.status(400).json({ error: 'Missing required fields: to, message' });
    }

    // Get Textbelt API key from environment variables
    const apiKey = process.env.TEXTBELT_API_KEY;

    if (!apiKey) {
      console.error('Missing Textbelt API key');
      return res.status(500).json({ error: 'Server configuration error - missing Textbelt API key' });
    }

    console.log('Sending SMS via Textbelt:', { to, messageLength: message.length });

    // Send SMS via Textbelt
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: to,
        message: message,
        key: apiKey,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      console.error('Textbelt error:', result);
      return res.status(500).json({
        error: 'Failed to send SMS',
        details: result.error,
        quotaRemaining: result.quotaRemaining
      });
    }

    console.log('SMS sent successfully:', { textId: result.textId, quotaRemaining: result.quotaRemaining });

    return res.status(200).json({
      success: true,
      textId: result.textId,
      quotaRemaining: result.quotaRemaining,
    });
  } catch (error) {
    console.error('Error sending SMS:', {
      message: error.message,
    });
    return res.status(500).json({
      error: 'Failed to send SMS',
      details: error.message,
    });
  }
}
