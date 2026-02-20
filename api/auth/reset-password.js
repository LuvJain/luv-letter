import { hashPassword } from '../../src/utils/password-hash.js';
import { findUser, validateResetCode, updateUserPassword } from '../../src/utils/user-store.js';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone_number, reset_code, new_password } = req.body;

    // Validate required fields
    if (!phone_number || !reset_code || !new_password) {
      return res.status(400).json({
        error: 'Missing required fields: phone_number, reset_code, and new_password are required',
      });
    }

    const normalizedPhone = normalizePhoneNumber(phone_number);

    // Check if user exists — use generic error to prevent phone enumeration
    const user = findUser(normalizedPhone);
    if (!user) {
      return res.status(400).json({
        error: 'Invalid reset code',
      });
    }

    // Validate the reset code
    const validation = validateResetCode(normalizedPhone, reset_code);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid reset code',
      });
    }

    // Hash the new password and update
    const newPasswordHash = await hashPassword(new_password);
    const updated = updateUserPassword(normalizedPhone, newPasswordHash);

    if (!updated) {
      return res.status(500).json({
        error: 'Failed to update password',
      });
    }

    console.log('Password reset successful:', { phone_number: normalizedPhone });

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error.message);
    return res.status(500).json({
      error: 'Password reset failed',
      details: error.message,
    });
  }
}
