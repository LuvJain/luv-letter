import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Validates and formats a phone number to E.164 standard.
 * @param {string} phone - The phone number string to validate.
 * @param {string} [countryCode] - Optional ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB').
 * @returns {{ isValid: boolean, formattedNumber: string | null, countryCode: string | null, error: string | null }}
 */
export function validatePhoneNumber(phone, countryCode) {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      formattedNumber: null,
      countryCode: null,
      error: 'Phone number is required and must be a string',
    };
  }

  const trimmed = phone.trim();
  if (trimmed.length === 0) {
    return {
      isValid: false,
      formattedNumber: null,
      countryCode: null,
      error: 'Phone number is required and must be a string',
    };
  }

  try {
    const parsed = parsePhoneNumber(trimmed, countryCode);

    if (!parsed) {
      return fallbackValidation(trimmed);
    }

    if (!parsed.isValid()) {
      return {
        isValid: false,
        formattedNumber: null,
        countryCode: parsed.country || countryCode || null,
        error: `Invalid phone number for country ${parsed.country || countryCode || 'unknown'}`,
      };
    }

    return {
      isValid: true,
      formattedNumber: parsed.format('E.164'),
      countryCode: parsed.country || countryCode || null,
      error: null,
    };
  } catch (e) {
    // If parsing fails entirely, try fallback validation
    return fallbackValidation(trimmed, countryCode, e.message);
  }
}

function fallbackValidation(phone, countryCode, originalError) {
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length < 7) {
    return {
      isValid: false,
      formattedNumber: null,
      countryCode: countryCode || null,
      error: originalError || 'Phone number has too few digits (minimum 7)',
    };
  }

  if (!phone.startsWith('+')) {
    return {
      isValid: false,
      formattedNumber: null,
      countryCode: countryCode || null,
      error: originalError || 'Phone number must include a country code or start with +',
    };
  }

  return {
    isValid: false,
    formattedNumber: null,
    countryCode: countryCode || null,
    error: originalError || 'Unable to parse phone number',
  };
}
