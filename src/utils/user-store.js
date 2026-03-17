// In-memory user store with phone_number as unique identifier.
// Stores users and password reset codes for serverless API endpoints.
// Note: Data resets on server restart since this is in-memory only.

const users = new Map();
const resetCodes = new Map();

const RESET_CODE_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Find a user by phone number.
 * @param {string} phoneNumber - The user's phone number.
 * @returns {object|null} The user object or null if not found.
 */
export const findUserByPhone = (phoneNumber) => {
  return users.get(phoneNumber) || null;
};

/**
 * Create a new user.
 * @param {object} userData - User registration data.
 * @param {string} userData.phone_number - Phone number (unique key).
 * @param {string} userData.password_hash - The bcrypt-hashed password.
 * @param {string} userData.name - The user's display name.
 * @returns {object} The created user (without password_hash).
 */
export const createUser = ({ phone_number, password_hash, name }) => {
  const user = {
    user_id: Date.now().toString(),
    phone_number,
    password_hash,
    name,
    created_at: new Date().toISOString(),
  };
  users.set(phone_number, user);
  return { user_id: user.user_id, phone_number: user.phone_number, name: user.name };
};

/**
 * Update a user's password hash.
 * @param {string} phoneNumber - The user's phone number.
 * @param {string} newPasswordHash - The new bcrypt-hashed password.
 * @returns {boolean} True if updated, false if user not found.
 */
export const updateUserPassword = (phoneNumber, newPasswordHash) => {
  const user = users.get(phoneNumber);
  if (!user) return false;
  user.password_hash = newPasswordHash;
  users.set(phoneNumber, user);
  return true;
};

/**
 * Store a password reset code for a phone number with 15-minute expiration.
 * @param {string} phoneNumber - The user's phone number.
 * @param {string} code - The 6-digit reset code.
 */
export const storeResetCode = (phoneNumber, code) => {
  resetCodes.set(phoneNumber, {
    code,
    expires_at: Date.now() + RESET_CODE_EXPIRATION_MS,
  });
};

/**
 * Validate a reset code for a phone number.
 * Returns true if the code matches and hasn't expired.
 * Deletes the code after successful validation (single-use).
 * @param {string} phoneNumber - The user's phone number.
 * @param {string} code - The reset code to validate.
 * @returns {boolean} True if valid, false if invalid or expired.
 */
export const validateResetCode = (phoneNumber, code) => {
  const stored = resetCodes.get(phoneNumber);
  if (!stored) return false;
  if (Date.now() > stored.expires_at) {
    resetCodes.delete(phoneNumber);
    return false;
  }
  if (stored.code !== code) return false;
  resetCodes.delete(phoneNumber);
  return true;
};
