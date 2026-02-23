import jwt from 'jsonwebtoken';

const TOKEN_EXPIRATION = '24h';

/**
 * Generate a JWT token containing user_id and phone_number.
 * Signed with the SECRET_KEY environment variable.
 * @param {{ user_id: string, phone_number: string }} payload
 * @returns {string} The signed JWT token.
 */
export function generateToken({ user_id, phone_number }) {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error('Server configuration error - missing SECRET_KEY');
  }

  return jwt.sign(
    { user_id, phone_number },
    secretKey,
    { expiresIn: TOKEN_EXPIRATION }
  );
}

/**
 * Verify and decode a JWT token.
 * @param {string} token - The JWT token to verify.
 * @returns {{ user_id: string, phone_number: string }} The decoded payload.
 */
export function verifyToken(token) {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error('Server configuration error - missing SECRET_KEY');
  }

  return jwt.verify(token, secretKey);
}
