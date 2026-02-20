import { describe, it, expect } from 'vitest';
import { validatePhoneNumber } from './phone-validation.js';

// ---------------------------------------------------------------------------
// Valid numbers — North America
// ---------------------------------------------------------------------------
describe('Valid North American phone numbers', () => {
  it('validates a US number with country code in E.164', () => {
    const result = validatePhoneNumber('+12025551234');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+12025551234');
    expect(result.countryCode).toBe('US');
    expect(result.error).toBeNull();
  });

  it('validates a US number when country code is passed explicitly', () => {
    const result = validatePhoneNumber('(202) 555-1234', 'US');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+12025551234');
    expect(result.countryCode).toBe('US');
  });

  it('validates a Canadian number', () => {
    const result = validatePhoneNumber('+14165551234');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+14165551234');
    expect(result.countryCode).toBe('CA');
  });

  it('validates a Canadian number with explicit country code', () => {
    const result = validatePhoneNumber('4165551234', 'CA');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+14165551234');
    expect(result.countryCode).toBe('CA');
  });

  it('validates a Mexican number', () => {
    const result = validatePhoneNumber('+525512345678');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+525512345678');
    expect(result.countryCode).toBe('MX');
  });
});

// ---------------------------------------------------------------------------
// Valid numbers — Europe
// ---------------------------------------------------------------------------
describe('Valid European phone numbers', () => {
  it('validates a UK mobile number', () => {
    const result = validatePhoneNumber('+447457123456');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+447457123456');
    expect(result.countryCode).toBe('GB');
  });

  it('validates a UK landline number with explicit country code', () => {
    const result = validatePhoneNumber('020 7123 4567', 'GB');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+442071234567');
    expect(result.countryCode).toBe('GB');
  });

  it('validates a German number', () => {
    const result = validatePhoneNumber('+4915112345678');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+4915112345678');
    expect(result.countryCode).toBe('DE');
  });

  it('validates a German number with explicit country code', () => {
    const result = validatePhoneNumber('015112345678', 'DE');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+4915112345678');
    expect(result.countryCode).toBe('DE');
  });

  it('validates a French number', () => {
    const result = validatePhoneNumber('+33612345678');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+33612345678');
    expect(result.countryCode).toBe('FR');
  });

  it('validates a Spanish number', () => {
    const result = validatePhoneNumber('+34612345678');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+34612345678');
    expect(result.countryCode).toBe('ES');
  });

  it('validates an Italian number', () => {
    const result = validatePhoneNumber('+393123456789');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+393123456789');
    expect(result.countryCode).toBe('IT');
  });

  it('validates a Dutch number', () => {
    const result = validatePhoneNumber('+31612345678');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+31612345678');
    expect(result.countryCode).toBe('NL');
  });

  it('validates a Swedish number', () => {
    const result = validatePhoneNumber('+46701234567');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+46701234567');
    expect(result.countryCode).toBe('SE');
  });

  it('validates a Polish number', () => {
    const result = validatePhoneNumber('+48512345678');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+48512345678');
    expect(result.countryCode).toBe('PL');
  });
});

// ---------------------------------------------------------------------------
// Valid numbers — Asia
// ---------------------------------------------------------------------------
describe('Valid Asian phone numbers', () => {
  it('validates a Japanese number', () => {
    const result = validatePhoneNumber('+819012345678');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+819012345678');
    expect(result.countryCode).toBe('JP');
  });

  it('validates an Indian number', () => {
    const result = validatePhoneNumber('+919876543210');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+919876543210');
    expect(result.countryCode).toBe('IN');
  });

  it('validates a Chinese number', () => {
    const result = validatePhoneNumber('+8613812345678');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+8613812345678');
    expect(result.countryCode).toBe('CN');
  });

  it('validates a South Korean number', () => {
    const result = validatePhoneNumber('+821012345678');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+821012345678');
    expect(result.countryCode).toBe('KR');
  });
});

// ---------------------------------------------------------------------------
// Valid numbers — Africa
// ---------------------------------------------------------------------------
describe('Valid African phone numbers', () => {
  it('validates a South African number', () => {
    const result = validatePhoneNumber('+27821234567');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+27821234567');
    expect(result.countryCode).toBe('ZA');
  });

  it('validates a Nigerian number', () => {
    const result = validatePhoneNumber('+2348012345678');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+2348012345678');
    expect(result.countryCode).toBe('NG');
  });

  it('validates a Kenyan number', () => {
    const result = validatePhoneNumber('+254712345678');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+254712345678');
    expect(result.countryCode).toBe('KE');
  });
});

// ---------------------------------------------------------------------------
// Valid numbers — Oceania
// ---------------------------------------------------------------------------
describe('Valid Oceanian phone numbers', () => {
  it('validates an Australian number', () => {
    const result = validatePhoneNumber('+61412345678');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+61412345678');
    expect(result.countryCode).toBe('AU');
  });

  it('validates a New Zealand number', () => {
    const result = validatePhoneNumber('+64211234567');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+64211234567');
    expect(result.countryCode).toBe('NZ');
  });
});

// ---------------------------------------------------------------------------
// Valid numbers — Americas (non-NANP)
// ---------------------------------------------------------------------------
describe('Valid South American phone numbers', () => {
  it('validates a Brazilian number', () => {
    const result = validatePhoneNumber('+5511987654321');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+5511987654321');
    expect(result.countryCode).toBe('BR');
  });

  it('validates an Argentinian number', () => {
    const result = validatePhoneNumber('+5491112345678');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+5491112345678');
    expect(result.countryCode).toBe('AR');
  });
});

// ---------------------------------------------------------------------------
// Invalid numbers
// ---------------------------------------------------------------------------
describe('Invalid phone numbers', () => {
  it('rejects null input', () => {
    const result = validatePhoneNumber(null);
    expect(result.isValid).toBe(false);
    expect(result.formattedNumber).toBeNull();
    expect(result.error).toContain('required');
  });

  it('rejects undefined input', () => {
    const result = validatePhoneNumber(undefined);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('rejects empty string', () => {
    const result = validatePhoneNumber('');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('rejects whitespace-only string', () => {
    const result = validatePhoneNumber('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('rejects non-string input', () => {
    const result = validatePhoneNumber(12345);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('string');
  });

  it('rejects a number with too few digits', () => {
    const result = validatePhoneNumber('+1234');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rejects a number that is invalid for the given country', () => {
    // Too short for a US number
    const result = validatePhoneNumber('12345', 'US');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rejects random text', () => {
    const result = validatePhoneNumber('not-a-phone-number');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rejects a number with too many digits', () => {
    const result = validatePhoneNumber('+12345678901234567890');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Invalid country code parameter
// ---------------------------------------------------------------------------
describe('Invalid country code parameter', () => {
  it('rejects a numeric country code', () => {
    const result = validatePhoneNumber('+12025551234', '12');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('ISO 3166-1');
  });

  it('rejects a three-letter country code', () => {
    const result = validatePhoneNumber('+12025551234', 'USA');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('ISO 3166-1');
  });

  it('rejects an empty string country code', () => {
    const result = validatePhoneNumber('+12025551234', '');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('ISO 3166-1');
  });

  it('rejects a single-letter country code', () => {
    const result = validatePhoneNumber('+12025551234', 'U');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('ISO 3166-1');
  });
});

// ---------------------------------------------------------------------------
// Country code auto-detection
// ---------------------------------------------------------------------------
describe('Country code auto-detection', () => {
  it('auto-detects US from +1 prefix', () => {
    const result = validatePhoneNumber('+12025551234');
    expect(result.isValid).toBe(true);
    expect(result.countryCode).toBe('US');
  });

  it('auto-detects UK from +44 prefix', () => {
    const result = validatePhoneNumber('+442071234567');
    expect(result.isValid).toBe(true);
    expect(result.countryCode).toBe('GB');
  });

  it('auto-detects Japan from +81 prefix', () => {
    const result = validatePhoneNumber('+819012345678');
    expect(result.isValid).toBe(true);
    expect(result.countryCode).toBe('JP');
  });

  it('auto-detects Australia from +61 prefix', () => {
    const result = validatePhoneNumber('+61412345678');
    expect(result.isValid).toBe(true);
    expect(result.countryCode).toBe('AU');
  });
});

// ---------------------------------------------------------------------------
// Explicit country code overrides detection
// ---------------------------------------------------------------------------
describe('Explicit country code override', () => {
  it('uses explicit country code to parse national-format numbers', () => {
    const result = validatePhoneNumber('07457 123456', 'GB');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+447457123456');
    expect(result.countryCode).toBe('GB');
  });

  it('accepts lowercase country code', () => {
    const result = validatePhoneNumber('(202) 555-1234', 'us');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+12025551234');
    expect(result.countryCode).toBe('US');
  });
});

// ---------------------------------------------------------------------------
// E.164 formatting
// ---------------------------------------------------------------------------
describe('E.164 formatting', () => {
  it('formats a US number with spaces to E.164', () => {
    const result = validatePhoneNumber('+1 202 555 1234');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+12025551234');
  });

  it('formats a UK number with dashes to E.164', () => {
    const result = validatePhoneNumber('+44-7457-123456');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+447457123456');
  });

  it('formats a number with parentheses and dashes to E.164', () => {
    const result = validatePhoneNumber('(202) 555-1234', 'US');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+12025551234');
  });

  it('formats a number with dots to E.164', () => {
    const result = validatePhoneNumber('202.555.1234', 'US');
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe('+12025551234');
  });
});

// ---------------------------------------------------------------------------
// Return shape
// ---------------------------------------------------------------------------
describe('Return object shape', () => {
  it('returns all expected properties for a valid number', () => {
    const result = validatePhoneNumber('+12025551234');
    expect(result).toHaveProperty('isValid');
    expect(result).toHaveProperty('formattedNumber');
    expect(result).toHaveProperty('countryCode');
    expect(result).toHaveProperty('error');
    expect(typeof result.isValid).toBe('boolean');
    expect(typeof result.formattedNumber).toBe('string');
    expect(typeof result.countryCode).toBe('string');
    expect(result.error).toBeNull();
  });

  it('returns all expected properties for an invalid number', () => {
    const result = validatePhoneNumber('invalid');
    expect(result).toHaveProperty('isValid');
    expect(result).toHaveProperty('formattedNumber');
    expect(result).toHaveProperty('countryCode');
    expect(result).toHaveProperty('error');
    expect(result.isValid).toBe(false);
    expect(result.formattedNumber).toBeNull();
    expect(typeof result.error).toBe('string');
  });
});
