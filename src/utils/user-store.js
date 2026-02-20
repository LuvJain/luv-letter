import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RESET_CODES_FILE = path.join(DATA_DIR, 'reset-codes.json');

/**
 * Ensure the data directory and files exist.
 */
function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({}, null, 2));
  }
  if (!fs.existsSync(RESET_CODES_FILE)) {
    fs.writeFileSync(RESET_CODES_FILE, JSON.stringify({}, null, 2));
  }
}

/**
 * Read all users from the store.
 * @returns {Object} Map of phone_number -> user object.
 */
function readUsers() {
  ensureDataFiles();
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Write all users to the store.
 * @param {Object} users - Map of phone_number -> user object.
 */
function writeUsers(users) {
  ensureDataFiles();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

/**
 * Read all reset codes from the store.
 * @returns {Object} Map of phone_number -> { code, expires_at }.
 */
function readResetCodes() {
  ensureDataFiles();
  const data = fs.readFileSync(RESET_CODES_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Write all reset codes to the store.
 * @param {Object} codes - Map of phone_number -> { code, expires_at }.
 */
function writeResetCodes(codes) {
  ensureDataFiles();
  fs.writeFileSync(RESET_CODES_FILE, JSON.stringify(codes, null, 2));
}

/**
 * Find a user by phone number.
 * @param {string} phoneNumber
 * @returns {Object|null} The user object or null.
 */
export function findUserByPhone(phoneNumber) {
  const users = readUsers();
  return users[phoneNumber] || null;
}

/**
 * Create a new user.
 * @param {{ phone_number: string, name: string, password_hash: string }} user
 * @returns {Object} The created user (without password_hash in return).
 */
export function createUser({ phone_number, name, password_hash }) {
  const users = readUsers();
  if (users[phone_number]) {
    return null; // User already exists
  }
  const user_id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  users[phone_number] = {
    user_id,
    phone_number,
    name,
    password_hash,
    created_at: new Date().toISOString(),
  };
  writeUsers(users);
  return { user_id, phone_number, name };
}

/**
 * Update a user's password hash.
 * @param {string} phoneNumber
 * @param {string} newPasswordHash
 * @returns {boolean} True if updated successfully.
 */
export function updateUserPassword(phoneNumber, newPasswordHash) {
  const users = readUsers();
  if (!users[phoneNumber]) {
    return false;
  }
  users[phoneNumber].password_hash = newPasswordHash;
  users[phoneNumber].updated_at = new Date().toISOString();
  writeUsers(users);
  return true;
}

/**
 * Store a password reset code for a phone number with 15-minute expiration.
 * @param {string} phoneNumber
 * @param {string} code - The 6-digit reset code.
 */
export function storeResetCode(phoneNumber, code) {
  const codes = readResetCodes();
  codes[phoneNumber] = {
    code,
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };
  writeResetCodes(codes);
}

/**
 * Validate a reset code for a phone number.
 * @param {string} phoneNumber
 * @param {string} code
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateResetCode(phoneNumber, code) {
  const codes = readResetCodes();
  const entry = codes[phoneNumber];

  if (!entry) {
    return { valid: false, reason: 'No reset code found for this phone number' };
  }

  if (new Date(entry.expires_at) < new Date()) {
    // Clean up expired code
    delete codes[phoneNumber];
    writeResetCodes(codes);
    return { valid: false, reason: 'Reset code has expired' };
  }

  if (entry.code !== code) {
    return { valid: false, reason: 'Invalid reset code' };
  }

  // Code is valid - clean it up so it can't be reused
  delete codes[phoneNumber];
  writeResetCodes(codes);
  return { valid: true };
}
