/**
 * In-memory user store keyed by phone_number.
 *
 * Each user record:
 * {
 *   user_id: string,
 *   phone_number: string,
 *   name: string,
 *   password_hash: string,
 *   created_at: string (ISO 8601)
 * }
 *
 * Note: This store is ephemeral — data is lost when the serverless function
 * cold-starts. Suitable for prototyping per project constraints (no database).
 */

const users = new Map(); // phone_number -> user record

/**
 * Find a user by phone number.
 * @param {string} phoneNumber
 * @returns {object|null} The user record, or null if not found.
 */
export function findUserByPhone(phoneNumber) {
  return users.get(phoneNumber) || null;
}

/**
 * Create a new user. Throws if phone_number already exists.
 *
 * @param {{ phone_number: string, name: string, password_hash: string }} data
 * @returns {object} The created user record.
 */
export function createUser({ phone_number, name, password_hash }) {
  if (users.has(phone_number)) {
    throw new Error('DUPLICATE_PHONE: A user with this phone number already exists');
  }

  const user = {
    user_id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    phone_number,
    name,
    password_hash,
    created_at: new Date().toISOString(),
  };

  users.set(phone_number, user);
  return user;
}

/**
 * Update a user's password hash.
 *
 * @param {string} phoneNumber
 * @param {string} newPasswordHash
 * @returns {boolean} True if updated, false if user not found.
 */
export function updateUserPassword(phoneNumber, newPasswordHash) {
  const user = users.get(phoneNumber);
  if (!user) {
    return false;
  }
  user.password_hash = newPasswordHash;
  return true;
}
