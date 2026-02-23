import jwt from 'jsonwebtoken';

const TOKEN_EXPIRATION = '24h';

/**
 * Generate a JWT token for an authenticated user.
 * @param {{ user_id: string, phone_number: string }} payload - User data to encode.
 * @returns {string} Signed JWT token.
 */
export function generateToken({ user_id, phone_number }) {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing SECRET_KEY environment variable');
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
 * @returns {{ user_id: string, phone_number: string }} Decoded token payload.
 */
export function verifyToken(token) {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing SECRET_KEY environment variable');
  }

  return jwt.verify(token, secretKey);
}
