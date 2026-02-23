import { hashPassword } from '../../src/utils/password-hash.js';
import { createUser, findUserByPhone } from '../../src/utils/user-store.js';
import { generateToken } from '../../src/utils/auth-token.js';

/**
 * Validate phone number matches North American or European patterns.
 * Accepts E.164 format: +1XXXXXXXXXX (NA) or +XX to +XXX followed by digits (EU).
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return false;

  // North America: +1 followed by 10 digits
  const northAmericaPattern = /^\+1\d{10}$/;
  // Europe: +XX or +XXX followed by 6-12 digits (covers UK +44, Germany +49, France +33, etc.)
  const europePattern = /^\+(?:3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\d{6,12}$/;

  return northAmericaPattern.test(phone) || europePattern.test(phone);
}

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

    // Validate phone number format
    if (!isValidPhoneNumber(phone_number)) {
      return res.status(400).json({
        error: 'Invalid phone number format. Use E.164 format (e.g., +12025551234 for North America or +442071234567 for Europe)',
      });
    }

    // Check if user already exists
    if (findUserByPhone(phone_number)) {
      return res.status(409).json({ error: 'A user with this phone number already exists' });
    }

    // Hash password and create user
    const password_hash = await hashPassword(password);
    const user = createUser({ phone_number, name, password_hash });

    // Generate auth token
    const token = generateToken({ user_id: user.user_id, phone_number: user.phone_number });

    return res.status(201).json({
      success: true,
      user: {
        user_id: user.user_id,
        phone_number: user.phone_number,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({
      error: 'Registration failed',
      details: error.message,
    });
  }
}
