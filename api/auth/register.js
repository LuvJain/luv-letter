import { hashPassword } from '../../src/utils/password-hash.js';
import { findUserByPhone, createUser } from '../../src/utils/user-store.js';

// Validates North America (+1) and Europe (+3x, +4x) phone formats
const isValidPhone = (phone) => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  // E.164 format: + followed by country code and subscriber number (7-15 digits total)
  // North America: +1 followed by 10 digits
  // Europe: +3x or +4x followed by 7-12 digits
  return /^\+1\d{10}$/.test(cleaned) || /^\+[34]\d{8,13}$/.test(cleaned);
};

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
    if (!isValidPhone(phone_number)) {
      return res.status(400).json({
        error: 'Invalid phone number format. Use E.164 format: +1XXXXXXXXXX (North America) or +3X/+4X... (Europe)',
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    const existingUser = findUserByPhone(phone_number);
    if (existingUser) {
      return res.status(409).json({ error: 'A user with this phone number already exists' });
    }

    // Hash password and create user
    const password_hash = await hashPassword(password);
    const user = createUser({ phone_number, password_hash, name });

    console.log('User registered:', { phone_number, name });

    return res.status(201).json({
      success: true,
      user: {
        user_id: user.user_id,
        phone_number: user.phone_number,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
