import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Validates and formats a phone number to E.164 standard.
 *
 * @param {string} phoneNumber - The phone number string to validate.
 * @param {string} [countryCode] - Optional ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'DE').
 *   When provided, overrides automatic country detection.
 * @returns {{ isValid: boolean, formattedNumber: string|null, countryCode: string|null, error: string|null }}
 */
export function validatePhoneNumber(phoneNumber, countryCode) {
  // Validate input presence
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return {
      isValid: false,
      formattedNumber: null,
      countryCode: null,
      error: 'Phone number is required and must be a string.',
    };
  }

  const trimmed = phoneNumber.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      formattedNumber: null,
      countryCode: null,
      error: 'Phone number is required and must be a string.',
    };
  }

  // Validate country code parameter if provided
  if (countryCode !== undefined && countryCode !== null) {
    if (typeof countryCode !== 'string' || !/^[A-Z]{2}$/i.test(countryCode)) {
      return {
        isValid: false,
        formattedNumber: null,
        countryCode: null,
        error: 'Country code must be a valid ISO 3166-1 alpha-2 code (e.g., "US", "GB").',
      };
    }
    countryCode = countryCode.toUpperCase();
  }

  try {
    const parsed = countryCode
      ? parsePhoneNumber(trimmed, countryCode)
      : parsePhoneNumber(trimmed);

    if (!parsed) {
      return fallbackValidation(trimmed, countryCode);
    }

    if (!parsed.isValid()) {
      const detectedCountry = parsed.country || countryCode || null;
      return {
        isValid: false,
        formattedNumber: null,
        countryCode: detectedCountry,
        error: `Phone number is not valid${detectedCountry ? ` for country ${detectedCountry}` : ''}. Check the digit length and format.`,
      };
    }

    return {
      isValid: true,
      formattedNumber: parsed.format('E.164'),
      countryCode: parsed.country || countryCode || null,
      error: null,
    };
  } catch (err) {
    // libphonenumber-js throws on unparseable input; fall back to basic checks
    return fallbackValidation(trimmed, countryCode);
  }
}

/**
 * Fallback validation when libphonenumber-js cannot parse the number.
 * Checks for a minimum digit count and an optional leading '+'.
 *
 * @param {string} phoneNumber - Trimmed phone number string.
 * @param {string|undefined} countryCode - Optional country code.
 * @returns {{ isValid: boolean, formattedNumber: string|null, countryCode: string|null, error: string|null }}
 */
function fallbackValidation(phoneNumber, countryCode) {
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  if (digitsOnly.length < 7) {
    return {
      isValid: false,
      formattedNumber: null,
      countryCode: countryCode || null,
      error: `Phone number has too few digits (${digitsOnly.length}). A valid number requires at least 7 digits.`,
    };
  }

  if (digitsOnly.length > 15) {
    return {
      isValid: false,
      formattedNumber: null,
      countryCode: countryCode || null,
      error: `Phone number has too many digits (${digitsOnly.length}). E.164 allows a maximum of 15 digits.`,
    };
  }

  // If input starts with '+' and has a reasonable digit count, it's plausible
  // but we still couldn't validate it, so reject with a helpful message.
  return {
    isValid: false,
    formattedNumber: null,
    countryCode: countryCode || null,
    error: 'Unable to determine a valid phone number from the input. Please include the country calling code (e.g., +1 for US) or specify a country code parameter.',
  };
}
