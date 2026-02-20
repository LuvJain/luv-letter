import { randomInt } from 'crypto';
import { findUser, storeResetCode } from '../../src/utils/user-store.js';

/**
 * Normalize a phone number to E.164 format.
 */
function normalizePhoneNumber(phone) {
  const cleaned = phone.replace(/[^\d+]/g, '');

  if (!cleaned.startsWith('+')) {
    return '+1' + cleaned;
  }
  return cleaned;
}

/**
 * Generate a cryptographically secure 6-digit code.
 */
function generateResetCode() {
  return randomInt(100000, 1000000).toString();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone_number } = req.body;

    // Validate required field
    if (!phone_number) {
      return res.status(400).json({
        error: 'Missing required field: phone_number',
      });
    }

    const normalizedPhone = normalizePhoneNumber(phone_number);

    // Check if user exists
    const user = findUser(normalizedPhone);
    if (!user) {
      // Return success even if user doesn't exist to prevent phone enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this phone number, a reset code has been sent.',
      });
    }

    // Generate a 6-digit reset code
    const resetCode = generateResetCode();

    // Store the code with 15-minute expiration
    storeResetCode(normalizedPhone, resetCode, 15);

    // Send the reset code via SMS using the existing Textbelt integration
    const apiKey = process.env.TEXTBELT_API_KEY;

    if (!apiKey) {
      console.error('Missing Textbelt API key for password reset SMS');
      return res.status(500).json({
        error: 'Server configuration error - unable to send SMS',
      });
    }

    const smsResponse = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        message: `Your Luv Letter password reset code is: ${resetCode}. This code expires in 15 minutes.`,
        key: apiKey,
      }),
    });

    const smsResult = await smsResponse.json();

    if (!smsResult.success) {
      console.error('Failed to send reset code SMS:', smsResult);
      return res.status(500).json({
        error: 'Failed to send reset code via SMS',
        details: smsResult.error,
      });
    }

    console.log('Password reset code sent:', {
      phone_number: normalizedPhone,
      textId: smsResult.textId,
    });

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this phone number, a reset code has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error.message);
    return res.status(500).json({
      error: 'Password reset request failed',
      details: error.message,
    });
  }
}
