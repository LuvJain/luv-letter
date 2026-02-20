import jwt from 'jsonwebtoken';

const TOKEN_EXPIRATION = '24h';

/**
 * Get the secret key from environment, read at call time to support late binding.
 */
function getSecretKey() {
  const key = process.env.SECRET_KEY;
  if (!key) {
    throw new Error('Server configuration error - missing SECRET_KEY');
  }
  return key;
}

/**
 * Generate a JWT token containing user_id and phone_number.
 * @param {{ user_id: string, phone_number: string }} payload
 * @returns {string} Signed JWT token.
 */
export function generateToken({ user_id, phone_number }) {
  return jwt.sign({ user_id, phone_number }, getSecretKey(), {
    expiresIn: TOKEN_EXPIRATION,
  });
}

/**
 * Verify and decode a JWT token.
 * @param {string} token - The JWT token to verify.
 * @returns {{ user_id: string, phone_number: string }} The decoded payload.
 */
export function verifyToken(token) {
  return jwt.verify(token, getSecretKey());
}
