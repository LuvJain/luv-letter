import { hashPassword } from '../../src/utils/password-hash.js';
import { createUser, findUser } from '../../src/utils/user-store.js';
import { generateToken } from '../../src/utils/auth-token.js';

/**
 * Validate phone number format for North America and Europe.
 * Accepts E.164 format: +1XXXXXXXXXX (NA) or +44XXXXXXXXXX, +33XXXXXXXXX, etc. (EU)
 */
function isValidPhoneNumber(phone) {
  // North America: +1 followed by 10 digits
  // Europe: +3X, +4X, +3XX followed by 7-12 digits (covers UK, FR, DE, IT, ES, etc.)
  const naPattern = /^\+1\d{10}$/;
  const euPattern = /^\+(3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\d{7,12}$/;
  return naPattern.test(phone) || euPattern.test(phone);
}

/**
 * Normalize a phone number to E.164 format.
 * Follows the same pattern as Subscribers.jsx.
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
    const { phone_number, password, name } = req.body;

    // Validate required fields
    if (!phone_number || !password || !name) {
      return res.status(400).json({
        error: 'Missing required fields: phone_number, password, and name are required',
      });
    }

    // Normalize and validate phone number
    const normalizedPhone = normalizePhoneNumber(phone_number);

    if (!isValidPhoneNumber(normalizedPhone)) {
      return res.status(400).json({
        error: 'Invalid phone number format. Must be a valid North American or European phone number.',
      });
    }

    // Check if user already exists
    if (findUser(normalizedPhone)) {
      return res.status(409).json({
        error: 'A user with this phone number already exists',
      });
    }

    // Hash the password
    const password_hash = await hashPassword(password);

    // Create the user
    const user = createUser({
      phone_number: normalizedPhone,
      name,
      password_hash,
    });

    // Generate auth token
    const token = generateToken({
      user_id: user.user_id,
      phone_number: user.phone_number,
    });

    console.log('User registered:', { phone_number: normalizedPhone, name });

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
