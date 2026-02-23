import jwt from 'jsonwebtoken';

const TOKEN_EXPIRATION = '24h';

/**
 * Generate a JWT token containing user_id and phone_number.
 *
 * @param {{ user_id: string, phone_number: string }} payload
 * @returns {string} Signed JWT token.
 * @throws {Error} If SECRET_KEY environment variable is not set.
 */
export function generateToken({ user_id, phone_number }) {
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    throw new Error('SERVER_CONFIG_ERROR: SECRET_KEY environment variable is not set');
  }
  return jwt.sign({ user_id, phone_number }, secret, { expiresIn: TOKEN_EXPIRATION });
}

/**
 * Verify and decode a JWT token.
 *
 * @param {string} token
 * @returns {{ user_id: string, phone_number: string, iat: number, exp: number }}
 * @throws {Error} If token is invalid or expired.
 */
export function verifyToken(token) {
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    throw new Error('SERVER_CONFIG_ERROR: SECRET_KEY environment variable is not set');
  }
  return jwt.verify(token, secret);
}
