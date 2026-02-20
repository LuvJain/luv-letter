/**
 * Validate and normalize a phone number.
 * Supports North American (+1) and European (+33, +44, +49, etc.) formats.
 *
 * @param {string} phoneNumber - The phone number to validate.
 * @returns {{ valid: boolean, normalized?: string, error?: string }}
 */
export function validatePhoneNumber(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }

  // Strip everything except digits and leading +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // Must start with + for international format
  let normalized = cleaned;
  if (!normalized.startsWith('+')) {
    // Assume North American if no country code
    normalized = '+1' + normalized;
  }

  // North American: +1 followed by 10 digits
  const northAmericanPattern = /^\+1\d{10}$/;

  // European patterns: common country codes followed by appropriate digit counts
  // +33 (France: 9 digits), +44 (UK: 10 digits), +49 (Germany: 10-11 digits),
  // +34 (Spain: 9 digits), +39 (Italy: 9-10 digits), +31 (Netherlands: 9 digits),
  // +46 (Sweden: 9 digits), +47 (Norway: 8 digits), +48 (Poland: 9 digits),
  // +41 (Switzerland: 9 digits), +32 (Belgium: 8-9 digits), +353 (Ireland: 9 digits),
  // +351 (Portugal: 9 digits), +43 (Austria: 10-11 digits), +45 (Denmark: 8 digits)
  const europeanPattern = /^\+(3[0-9]{1,2}|4[0-9]{1,2})\d{7,11}$/;

  if (northAmericanPattern.test(normalized) || europeanPattern.test(normalized)) {
    return { valid: true, normalized };
  }

  return {
    valid: false,
    error: 'Invalid phone number format. Use North American (e.g., +11234567890) or European format (e.g., +447123456789)',
  };
}
