import { hashPassword } from '../../src/utils/password-hash.js';
import { createUser, findUserByPhone } from '../../src/utils/user-store.js';

/**
 * Phone number validation: North America (+1) and common European country codes.
 * Accepts E.164 format (e.g. +11234567890, +441234567890, +33612345678).
 */
const PHONE_REGEX = /^\+(?:1\d{10}|3[0-9]\d{8,11}|4[0-9]\d{8,11}|5[0-9]\d{8,11}|6[0-9]\d{8,11}|7[0-9]\d{8,11}|8[0-9]\d{8,11}|9[0-9]\d{8,11})$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone_number, password, name } = req.body;

    // Validate required fields
    if (!phone_number || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields: phone_number, password, name' });
    }

    // Validate phone format
    if (!PHONE_REGEX.test(phone_number)) {
      return res.status(400).json({
        error: 'Invalid phone number format. Please use E.164 format (e.g. +11234567890)',
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    if (findUserByPhone(phone_number)) {
      return res.status(409).json({ error: 'A user with this phone number already exists' });
    }

    // Hash password and create user
    const password_hash = await hashPassword(password);
    const user = createUser({ phone_number, name, password_hash });

    return res.status(201).json({
      success: true,
      user: {
        user_id: user.user_id,
        phone_number: user.phone_number,
        name: user.name,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Registration error:', error.message);

    if (error.message.startsWith('DUPLICATE_PHONE')) {
      return res.status(409).json({ error: 'A user with this phone number already exists' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}
