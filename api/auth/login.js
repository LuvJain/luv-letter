import { comparePassword } from '../../src/utils/password-hash.js';
import { findUserByPhone } from '../../src/utils/user-store.js';
import { generateToken } from '../../src/utils/auth-token.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone_number, password } = req.body;

    // Validate required fields
    if (!phone_number || !password) {
      return res.status(400).json({ error: 'Missing required fields: phone_number, password' });
    }

    // Find user by phone number
    const user = findUserByPhone(phone_number);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken({ user_id: user.user_id, phone_number: user.phone_number });

    return res.status(200).json({
      success: true,
      user: {
        user_id: user.user_id,
        phone_number: user.phone_number,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      error: 'Login failed',
      details: error.message,
    });
  }
}
