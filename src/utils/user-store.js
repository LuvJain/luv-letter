/**
 * In-memory user store with phone_number as unique identifier.
 *
 * Structure:
 *   users: Map<phone_number, { user_id, phone_number, name, password_hash, created_at }>
 *   resetCodes: Map<phone_number, { code, expires_at }>
 */

const users = new Map();
const resetCodes = new Map();

let nextId = 1;

/**
 * Find a user by phone number.
 * @param {string} phoneNumber
 * @returns {object|null}
 */
export function findUserByPhone(phoneNumber) {
  return users.get(phoneNumber) || null;
}

/**
 * Create a new user.
 * @param {{ phone_number: string, name: string, password_hash: string }} userData
 * @returns {object} The created user (without password_hash).
 */
export function createUser({ phone_number, name, password_hash }) {
  if (users.has(phone_number)) {
    throw new Error('User with this phone number already exists');
  }

  const user = {
    user_id: String(nextId++),
    phone_number,
    name,
    password_hash,
    created_at: new Date().toISOString(),
  };

  users.set(phone_number, user);

  // Return user without password_hash
  const { password_hash: _, ...safeUser } = user;
  return safeUser;
}

/**
 * Update a user's password hash.
 * @param {string} phoneNumber
 * @param {string} newPasswordHash
 * @returns {boolean} True if user was found and updated.
 */
export function updateUserPassword(phoneNumber, newPasswordHash) {
  const user = users.get(phoneNumber);
  if (!user) return false;

  user.password_hash = newPasswordHash;
  return true;
}

/**
 * Store a password reset code with a 15-minute expiration.
 * @param {string} phoneNumber
 * @param {string} code - The 6-digit reset code.
 */
export function storeResetCode(phoneNumber, code) {
  const EXPIRATION_MINUTES = 15;
  resetCodes.set(phoneNumber, {
    code,
    expires_at: new Date(Date.now() + EXPIRATION_MINUTES * 60 * 1000),
  });
}

/**
 * Validate a reset code. Returns true if valid and not expired.
 * Consumes the code on successful validation (one-time use).
 * @param {string} phoneNumber
 * @param {string} code
 * @returns {boolean}
 */
export function validateResetCode(phoneNumber, code) {
  const entry = resetCodes.get(phoneNumber);
  if (!entry) return false;

  if (new Date() > entry.expires_at) {
    resetCodes.delete(phoneNumber);
    return false;
  }

  if (entry.code !== code) return false;

  // Consume the code after successful validation
  resetCodes.delete(phoneNumber);
  return true;
}
