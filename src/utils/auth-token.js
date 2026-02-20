import jwt from 'jsonwebtoken';

const TOKEN_EXPIRATION = '24h';

/**
 * Generate a JWT token containing user_id and phone_number.
 * Signed with the SECRET_KEY environment variable.
 * @param {{ user_id: string, phone_number: string }} payload
 * @returns {string} Signed JWT token.
 */
export function generateToken({ user_id, phone_number }) {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error('SECRET_KEY environment variable is not set');
  }
  return jwt.sign({ user_id, phone_number }, secretKey, {
    expiresIn: TOKEN_EXPIRATION,
  });
}

/**
 * Verify and decode a JWT token.
 * @param {string} token - The JWT token to verify.
 * @returns {{ user_id: string, phone_number: string }} Decoded payload.
 */
export function verifyToken(token) {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error('SECRET_KEY environment variable is not set');
  }
  return jwt.verify(token, secretKey);
}
