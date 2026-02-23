import { findUserByPhone, storeResetCode } from '../../src/utils/user-store.js';

/**
 * Generate a cryptographically random 6-digit code.
 * @returns {string} A zero-padded 6-digit code.
 */
function generateResetCode() {
  // Generate a random number between 0 and 999999, zero-padded to 6 digits
  const code = Math.floor(Math.random() * 1000000);
  return String(code).padStart(6, '0');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone_number } = req.body;

    // Validate required field
    if (!phone_number) {
      return res.status(400).json({ error: 'Missing required field: phone_number' });
    }

    // Check if user exists
    const user = findUserByPhone(phone_number);
    if (!user) {
      // Return success even if user not found to prevent phone number enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account with this phone number exists, a reset code has been sent',
      });
    }

    // Generate and store the 6-digit reset code with 15-minute expiration
    const resetCode = generateResetCode();
    storeResetCode(phone_number, resetCode);

    // Send reset code via SMS using existing Textbelt integration
    const apiKey = process.env.TEXTBELT_API_KEY;
    if (!apiKey) {
      console.error('Missing Textbelt API key');
      return res.status(500).json({ error: 'Server configuration error - unable to send SMS' });
    }

    const smsResponse = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phone_number,
        message: `Your Luv-Letter password reset code is: ${resetCode}. This code expires in 15 minutes.`,
        key: apiKey,
      }),
    });

    const smsResult = await smsResponse.json();

    if (!smsResult.success) {
      console.error('SMS delivery failed:', smsResult.error);
      return res.status(500).json({
        error: 'Failed to send reset code via SMS',
        details: smsResult.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'If an account with this phone number exists, a reset code has been sent',
    });
  } catch (error) {
    console.error('Password reset request error:', error.message);
    return res.status(500).json({
      error: 'Password reset request failed',
      details: error.message,
    });
  }
}
