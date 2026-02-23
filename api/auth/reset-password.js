import { hashPassword } from '../../src/utils/password-hash.js';
import {
  findUserByPhone,
  validateResetCode,
  updateUserPassword,
} from '../../src/utils/user-store.js';

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

    // Validate new password length
    if (new_password.length < 8) {
      return res.status(400).json({
        error: 'New password must be at least 8 characters long',
      });
    }

    // Check that the user exists
    const user = findUserByPhone(phone_number);
    if (!user) {
      return res.status(400).json({ error: 'Invalid reset request' });
    }

    // Validate the reset code (checks expiration and single-use)
    const isValid = validateResetCode(phone_number, reset_code);
    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid or expired reset code',
      });
    }

    // Hash and update the new password
    const newHash = await hashPassword(new_password);
    updateUserPassword(phone_number, newHash);

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
