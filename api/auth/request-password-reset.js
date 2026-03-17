import { findUserByPhone, storeResetCode } from '../../src/utils/user-store.js';

// Generate a random 6-digit code
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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
      // Return success even if user not found to prevent phone enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this phone number, a reset code has been sent',
      });
    }

    // Generate 6-digit code and store with 15-minute expiration
    const resetCode = generateResetCode();
    storeResetCode(phone_number, resetCode);

    // Send SMS using existing Textbelt integration pattern
    const apiKey = process.env.TEXTBELT_API_KEY;
    if (!apiKey) {
      console.error('Missing Textbelt API key for password reset SMS');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const smsResponse = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phone_number,
        message: `Your Luv-Letter password reset code is: ${resetCode}. This code expires in 15 minutes.`,
        key: apiKey,
      }),
    });

    const smsResult = await smsResponse.json();

    if (!smsResult.success) {
      console.error('Failed to send reset SMS:', smsResult);
      return res.status(500).json({ error: 'Failed to send reset code via SMS' });
    }

    console.log('Password reset code sent:', { phone_number, textId: smsResult.textId });

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this phone number, a reset code has been sent',
    });
  } catch (error) {
    console.error('Password reset request error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
