/**
 * In-memory user store with phone_number as unique identifier.
 *
 * Each user record has the shape:
 * {
 *   user_id: string,
 *   phone_number: string,
 *   name: string,
 *   password_hash: string,
 *   created_at: string (ISO 8601),
 * }
 *
 * Reset codes are stored separately:
 * {
 *   phone_number: { code: string, expires_at: number (epoch ms) }
 * }
 */

// In-memory stores (reset on each cold start of the serverless function).
const users = new Map();
const resetCodes = new Map();

let nextId = 1;

/**
 * Create a new user. Returns the user record (without password_hash).
 * Throws if phone_number is already registered.
 */
export function createUser({ phone_number, name, password_hash }) {
  if (users.has(phone_number)) {
    throw new Error('Phone number already registered');
  }

  const user = {
    user_id: String(nextId++),
    phone_number,
    name,
    password_hash,
    created_at: new Date().toISOString(),
  };

  users.set(phone_number, user);

  // Return a safe copy without the hash
  const { password_hash: _, ...safeUser } = user;
  return safeUser;
}

/**
 * Find a user by phone number. Returns full record including password_hash,
 * or null if not found.
 */
export function findUserByPhone(phone_number) {
  return users.get(phone_number) || null;
}

/**
 * Update a user's password hash. Returns true if the user exists.
 */
export function updateUserPassword(phone_number, newPasswordHash) {
  const user = users.get(phone_number);
  if (!user) return false;
  user.password_hash = newPasswordHash;
  return true;
}

/**
 * Store a reset code for a phone number with a TTL (in minutes).
 */
export function storeResetCode(phone_number, code, ttlMinutes = 15) {
  resetCodes.set(phone_number, {
    code,
    expires_at: Date.now() + ttlMinutes * 60 * 1000,
  });
}

/**
 * Validate a reset code. Returns true if the code matches and hasn't expired.
 * Deletes the code after successful validation (single use).
 */
export function validateResetCode(phone_number, code) {
  const entry = resetCodes.get(phone_number);
  if (!entry) return false;

  if (Date.now() > entry.expires_at) {
    resetCodes.delete(phone_number);
    return false;
  }

  if (entry.code !== code) return false;

  // Single-use: remove after successful validation
  resetCodes.delete(phone_number);
  return true;
}
