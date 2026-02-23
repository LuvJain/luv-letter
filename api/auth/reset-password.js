import { hashPassword } from '../../src/utils/password-hash.js';
import { findUserByPhone, updateUserPassword } from '../../src/utils/user-store.js';
import { validateResetCode } from '../../src/utils/reset-code-store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone_number, reset_code, new_password } = req.body;

    // Validate required fields
    if (!phone_number || !reset_code || !new_password) {
      return res.status(400).json({
        error: 'Missing required fields: phone_number, reset_code, new_password',
      });
    }

    // Validate new password length
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Check user exists
    const user = findUserByPhone(phone_number);
    if (!user) {
      return res.status(400).json({ error: 'Invalid reset request' });
    }

    // Validate the reset code
    const validation = validateResetCode(phone_number, reset_code);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.reason });
    }

    // Hash new password and update
    const newHash = await hashPassword(new_password);
    const updated = updateUserPassword(phone_number, newHash);

    if (!updated) {
      return res.status(500).json({ error: 'Failed to update password' });
    }

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
