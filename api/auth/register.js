import { hashPassword } from '../../src/utils/password-hash.js';
import { validatePhoneNumber } from '../../src/utils/phone-validation.js';
import { createUser } from '../../src/utils/user-store.js';
import { generateToken } from '../../src/utils/auth-token.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone_number, password, name } = req.body;

    // Validate required fields
    if (!phone_number || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields: phone_number, password, and name are required' });
    }

    // Validate phone format (North America or Europe)
    const phoneValidation = validatePhoneNumber(phone_number);
    if (!phoneValidation.valid) {
      return res.status(400).json({ error: phoneValidation.error });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Validate name
    if (name.trim().length === 0) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    // Hash the password
    const password_hash = await hashPassword(password);

    // Create the user
    const user = createUser({
      phone_number: phoneValidation.normalized,
      name: name.trim(),
      password_hash,
    });

    if (!user) {
      return res.status(409).json({ error: 'A user with this phone number already exists' });
    }

    // Generate JWT token for the new user
    const token = generateToken({
      user_id: user.user_id,
      phone_number: user.phone_number,
    });

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
    return res.status(500).json({ error: 'Internal server error' });
  }
}
