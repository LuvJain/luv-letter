import { findUserByPhone } from '../../src/utils/user-store.js';
import { createResetCode } from '../../src/utils/reset-code-store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone_number } = req.body;

    // Validate required fields
    if (!phone_number) {
      return res.status(400).json({ error: 'Missing required field: phone_number' });
    }

    // Check if user exists
    const user = findUserByPhone(phone_number);
    if (!user) {
      // Return success even if user doesn't exist to prevent enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this phone number, a reset code has been sent',
      });
    }

    // Generate 6-digit reset code
    const code = createResetCode(phone_number);

    // Send SMS via existing Textbelt integration
    const apiKey = process.env.TEXTBELT_API_KEY;
    if (!apiKey) {
      console.error('Missing Textbelt API key for password reset SMS');
      return res.status(500).json({ error: 'Server configuration error - unable to send SMS' });
    }

    const smsResponse = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phone_number,
        message: `Your Luv-Letter password reset code is: ${code}. This code expires in 15 minutes.`,
        key: apiKey,
      }),
    });

    const smsResult = await smsResponse.json();

    if (!smsResult.success) {
      console.error('Failed to send reset code SMS:', smsResult);
      return res.status(500).json({ error: 'Failed to send reset code via SMS' });
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this phone number, a reset code has been sent',
    });
  } catch (error) {
    console.error('Password reset request error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
