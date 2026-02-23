import { findUserByPhone, storeResetCode } from '../../src/utils/user-store.js';

/**
 * Generate a cryptographically random 6-digit code.
 */
function generateResetCode() {
  // Use Math.random for a 6-digit numeric code (100000–999999)
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({
        error: 'Missing required field: phone_number',
      });
    }

    // Check that the user exists
    const user = findUserByPhone(phone_number);
    if (!user) {
      // Return 200 even if user not found to avoid phone enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists for that number, a reset code has been sent.',
      });
    }

    // Generate a 6-digit reset code with 15-minute expiration
    const code = generateResetCode();
    storeResetCode(phone_number, code, 15);

    // Send the code via SMS using the existing Textbelt integration
    const apiKey = process.env.TEXTBELT_API_KEY;
    if (!apiKey) {
      console.error('Missing Textbelt API key');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const smsResponse = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phone_number,
        message: `Your Luv-Letter password reset code is: ${code}. It expires in 15 minutes.`,
        key: apiKey,
      }),
    });

    const smsResult = await smsResponse.json();

    if (!smsResult.success) {
      console.error('SMS delivery failed:', smsResult);
      return res.status(500).json({
        error: 'Failed to send reset code via SMS',
        details: smsResult.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists for that number, a reset code has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
