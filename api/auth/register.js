import { hashPassword } from '../../src/utils/password-hash.js';
import { createUser } from '../../src/utils/user-store.js';

// Phone number patterns: North America (+1) and common European country codes
// North America: +1 followed by 10 digits
// Europe: +33 (FR), +44 (UK), +49 (DE), +34 (ES), +39 (IT), +31 (NL),
//         +46 (SE), +47 (NO), +45 (DK), +41 (CH), +48 (PL), +32 (BE),
//         +43 (AT), +351 (PT), +353 (IE), +358 (FI), +30 (GR), +36 (HU),
//         +420 (CZ), +421 (SK), +40 (RO), +385 (HR), +386 (SI)
const PHONE_REGEX = /^\+(?:1\d{10}|3[0-69]\d{7,11}|4[0-9]\d{7,11})$/;

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

    // Validate phone number format
    if (!PHONE_REGEX.test(phone_number)) {
      return res.status(400).json({
        error: 'Invalid phone number format. Must include country code (e.g. +1 for North America or European country codes like +44, +33, etc.)',
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long',
      });
    }

    // Hash the password
    const password_hash = await hashPassword(password);

    // Create the user
    const user = createUser({ phone_number, name, password_hash });

    return res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    if (error.message === 'Phone number already registered') {
      return res.status(409).json({ error: error.message });
    }

    console.error('Registration error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
