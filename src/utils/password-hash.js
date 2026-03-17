// Password hashing utility using bcryptjs
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plaintext password using bcryptjs with 10 salt rounds.
 * @param {string} password - The plaintext password to hash.
 * @returns {Promise<string>} The hashed password.
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a plaintext password against a hashed password.
 * @param {string} password - The plaintext password to verify.
 * @param {string} hashedPassword - The stored hashed password.
 * @returns {Promise<boolean>} True if the password matches, false otherwise.
 */
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};
