// JWT token generation and verification utility
import jwt from 'jsonwebtoken';

const TOKEN_EXPIRATION = '24h';

/**
 * Generate a JWT token containing user_id and phone_number.
 * Signed with SECRET_KEY environment variable, expires in 24 hours.
 * @param {object} payload - Token payload.
 * @param {string} payload.user_id - The user's unique identifier.
 * @param {string} payload.phone_number - The user's phone number.
 * @returns {string} The signed JWT token.
 */
export const generateToken = ({ user_id, phone_number }) => {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing SECRET_KEY environment variable');
  }
  return jwt.sign({ user_id, phone_number }, secretKey, { expiresIn: TOKEN_EXPIRATION });
};

/**
 * Verify and decode a JWT token.
 * @param {string} token - The JWT token to verify.
 * @returns {object} The decoded token payload.
 * @throws {Error} If the token is invalid or expired.
 */
export const verifyToken = (token) => {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing SECRET_KEY environment variable');
  }
  return jwt.verify(token, secretKey);
};
