/**
 * In-memory store for password reset codes.
 *
 * Each entry:
 * {
 *   code: string (6-digit),
 *   phone_number: string,
 *   expires_at: number (Unix timestamp ms),
 *   used: boolean
 * }
 */

const EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes

const resetCodes = new Map(); // phone_number -> entry

/**
 * Generate a random 6-digit code.
 * @returns {string} A 6-digit string (zero-padded).
 */
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create a new reset code for the given phone number.
 * Overwrites any existing code for that number.
 *
 * @param {string} phoneNumber
 * @returns {string} The generated 6-digit code.
 */
export function createResetCode(phoneNumber) {
  const code = generateCode();
  resetCodes.set(phoneNumber, {
    code,
    phone_number: phoneNumber,
    expires_at: Date.now() + EXPIRATION_MS,
    used: false,
  });
  return code;
}

/**
 * Validate a reset code for a given phone number.
 * Returns true if the code is valid, not expired, and not already used.
 * Marks the code as used if valid.
 *
 * @param {string} phoneNumber
 * @param {string} code
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateResetCode(phoneNumber, code) {
  const entry = resetCodes.get(phoneNumber);

  if (!entry) {
    return { valid: false, reason: 'No reset code found for this phone number' };
  }

  if (entry.used) {
    return { valid: false, reason: 'Reset code has already been used' };
  }

  if (Date.now() > entry.expires_at) {
    resetCodes.delete(phoneNumber);
    return { valid: false, reason: 'Reset code has expired' };
  }

  if (entry.code !== code) {
    return { valid: false, reason: 'Invalid reset code' };
  }

  // Mark as used
  entry.used = true;
  return { valid: true };
}
