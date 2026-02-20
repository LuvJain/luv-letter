/**
 * In-memory user credential store.
 *
 * Users are keyed by phone_number (unique identifier).
 * In a serverless environment each invocation gets a fresh store,
 * so this is suitable for development/demo purposes.
 * For persistence across invocations, swap this for a database or
 * external store.
 */

const users = new Map();
const resetCodes = new Map();

/**
 * Find a user by phone number.
 * @param {string} phoneNumber
 * @returns {{ user_id: string, phone_number: string, name: string, password_hash: string } | null}
 */
export function findUser(phoneNumber) {
  return users.get(phoneNumber) || null;
}

/**
 * Create a new user.
 * @param {{ phone_number: string, name: string, password_hash: string }} userData
 * @returns {{ user_id: string, phone_number: string, name: string }}
 */
export function createUser({ phone_number, name, password_hash }) {
  if (users.has(phone_number)) {
    throw new Error('User with this phone number already exists');
  }

  const user = {
    user_id: Date.now().toString(),
    phone_number,
    name,
    password_hash,
    created_at: new Date().toISOString(),
  };

  users.set(phone_number, user);

  return {
    user_id: user.user_id,
    phone_number: user.phone_number,
    name: user.name,
  };
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
  users.set(phoneNumber, user);
  return true;
}

/**
 * Store a password reset code with expiration.
 * @param {string} phoneNumber
 * @param {string} code - 6-digit reset code.
 * @param {number} expiresInMinutes - Minutes until expiration (default 15).
 */
export function storeResetCode(phoneNumber, code, expiresInMinutes = 15) {
  resetCodes.set(phoneNumber, {
    code,
    expires_at: Date.now() + expiresInMinutes * 60 * 1000,
  });
}

/**
 * Validate and consume a reset code.
 * @param {string} phoneNumber
 * @param {string} code
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateResetCode(phoneNumber, code) {
  const entry = resetCodes.get(phoneNumber);

  if (!entry) {
    return { valid: false, reason: 'No reset code found for this phone number' };
  }

  if (Date.now() > entry.expires_at) {
    resetCodes.delete(phoneNumber);
    return { valid: false, reason: 'Reset code has expired' };
  }

  if (entry.code !== code) {
    return { valid: false, reason: 'Invalid reset code' };
  }

  // Code is valid — consume it so it can't be reused
  resetCodes.delete(phoneNumber);
  return { valid: true };
}
