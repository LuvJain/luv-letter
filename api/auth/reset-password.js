import { findUserByPhone, validateResetCode, updateUserPassword } from '../../src/utils/user-store.js';
import { hashPassword } from '../../src/utils/password-hash.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone_number, reset_code, new_password } = req.body;

    // Validate required fields
    if (!phone_number || !reset_code || !new_password) {
      return res.status(400).json({ error: 'Missing required fields: phone_number, reset_code, new_password' });
    }

    // Check if user exists
    const user = findUserByPhone(phone_number);
    if (!user) {
      return res.status(400).json({ error: 'Invalid reset request' });
    }

    // Validate the reset code (checks expiration and consumes on success)
    const isValidCode = validateResetCode(phone_number, reset_code);
    if (!isValidCode) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    // Hash the new password and update
    const newPasswordHash = await hashPassword(new_password);
    const updated = updateUserPassword(phone_number, newPasswordHash);

    if (!updated) {
      return res.status(500).json({ error: 'Failed to update password' });
    }

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
