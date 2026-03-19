import { validatePhoneNumber } from './phone-validation.js';

// Simple test runner (matches project convention)
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`✓ ${name}`);
  } catch (e) {
    failed++;
    console.error(`✗ ${name}: ${e.message}`);
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

// --- North America ---

test('valid US number with country code', () => {
  const result = validatePhoneNumber('+12025551234');
  assert(result.isValid, 'should be valid');
  assert(result.formattedNumber === '+12025551234', `Expected +12025551234, got ${result.formattedNumber}`);
  assert(result.countryCode === 'US', `Expected US, got ${result.countryCode}`);
  assert(result.error === null);
});

test('valid US number with explicit country code param', () => {
  const result = validatePhoneNumber('2025551234', 'US');
  assert(result.isValid, 'should be valid');
  assert(result.formattedNumber === '+12025551234', `Expected +12025551234, got ${result.formattedNumber}`);
  assert(result.countryCode === 'US', `Expected US, got ${result.countryCode}`);
});

test('valid US number with formatting characters', () => {
  const result = validatePhoneNumber('(202) 555-1234', 'US');
  assert(result.isValid, 'should be valid');
  assert(result.formattedNumber === '+12025551234');
});

test('valid Canadian number', () => {
  const result = validatePhoneNumber('+14165551234');
  assert(result.isValid, 'should be valid');
  assert(result.formattedNumber === '+14165551234');
  assert(result.countryCode === 'CA', `Expected CA, got ${result.countryCode}`);
});

test('valid Mexican number', () => {
  const result = validatePhoneNumber('+525512345678');
  assert(result.isValid, 'should be valid');
  assert(result.formattedNumber === '+525512345678');
  assert(result.countryCode === 'MX', `Expected MX, got ${result.countryCode}`);
});

// --- Europe ---

test('valid UK number', () => {
  const result = validatePhoneNumber('+442071234567');
  assert(result.isValid, 'should be valid');
  assert(result.formattedNumber === '+442071234567');
  assert(result.countryCode === 'GB', `Expected GB, got ${result.countryCode}`);
});

test('valid UK number with explicit country', () => {
  const result = validatePhoneNumber('07911123456', 'GB');
  assert(result.isValid, 'should be valid');
  assert(result.formattedNumber === '+447911123456', `Expected +447911123456, got ${result.formattedNumber}`);
});

test('valid German number', () => {
  const result = validatePhoneNumber('+4930123456');
  assert(result.isValid, 'should be valid');
  assert(result.countryCode === 'DE', `Expected DE, got ${result.countryCode}`);
});

test('valid French number', () => {
  const result = validatePhoneNumber('+33123456789');
  assert(result.isValid, 'should be valid');
  assert(result.countryCode === 'FR', `Expected FR, got ${result.countryCode}`);
});

test('valid Spanish number', () => {
  const result = validatePhoneNumber('+34912345678');
  assert(result.isValid, 'should be valid');
  assert(result.countryCode === 'ES', `Expected ES, got ${result.countryCode}`);
});

test('valid Italian number', () => {
  const result = validatePhoneNumber('+393123456789');
  assert(result.isValid, 'should be valid');
  assert(result.countryCode === 'IT', `Expected IT, got ${result.countryCode}`);
});

// --- Asia ---

test('valid Japanese number', () => {
  const result = validatePhoneNumber('+81312345678');
  assert(result.isValid, 'should be valid');
  assert(result.countryCode === 'JP', `Expected JP, got ${result.countryCode}`);
});

test('valid Indian number', () => {
  const result = validatePhoneNumber('+919876543210');
  assert(result.isValid, 'should be valid');
  assert(result.countryCode === 'IN', `Expected IN, got ${result.countryCode}`);
});

test('valid Chinese number', () => {
  const result = validatePhoneNumber('+8613812345678');
  assert(result.isValid, 'should be valid');
  assert(result.countryCode === 'CN', `Expected CN, got ${result.countryCode}`);
});

test('valid South Korean number', () => {
  const result = validatePhoneNumber('+821012345678');
  assert(result.isValid, 'should be valid');
  assert(result.countryCode === 'KR', `Expected KR, got ${result.countryCode}`);
});

// --- Africa ---

test('valid Nigerian number', () => {
  const result = validatePhoneNumber('+2348031234567');
  assert(result.isValid, 'should be valid');
  assert(result.countryCode === 'NG', `Expected NG, got ${result.countryCode}`);
});

test('valid South African number', () => {
  const result = validatePhoneNumber('+27821234567');
  assert(result.isValid, 'should be valid');
  assert(result.countryCode === 'ZA', `Expected ZA, got ${result.countryCode}`);
});

// --- Oceania ---

test('valid Australian number', () => {
  const result = validatePhoneNumber('+61412345678');
  assert(result.isValid, 'should be valid');
  assert(result.countryCode === 'AU', `Expected AU, got ${result.countryCode}`);
});

test('valid New Zealand number', () => {
  const result = validatePhoneNumber('+64211234567');
  assert(result.isValid, 'should be valid');
  assert(result.countryCode === 'NZ', `Expected NZ, got ${result.countryCode}`);
});

// --- South America ---

test('valid Brazilian number', () => {
  const result = validatePhoneNumber('+5511912345678');
  assert(result.isValid, 'should be valid');
  assert(result.countryCode === 'BR', `Expected BR, got ${result.countryCode}`);
});

// --- Invalid numbers ---

test('rejects empty string', () => {
  const result = validatePhoneNumber('');
  assert(!result.isValid, 'should be invalid');
  assert(result.error !== null, 'should have error message');
});

test('rejects null input', () => {
  const result = validatePhoneNumber(null);
  assert(!result.isValid, 'should be invalid');
  assert(result.error !== null);
});

test('rejects undefined input', () => {
  const result = validatePhoneNumber(undefined);
  assert(!result.isValid, 'should be invalid');
  assert(result.error !== null);
});

test('rejects non-string input', () => {
  const result = validatePhoneNumber(12345);
  assert(!result.isValid, 'should be invalid');
  assert(result.error === 'Phone number is required and must be a string');
});

test('rejects too-short number', () => {
  const result = validatePhoneNumber('123', 'US');
  assert(!result.isValid, 'should be invalid');
  assert(result.error !== null);
});

test('rejects invalid US number (wrong digit count)', () => {
  const result = validatePhoneNumber('+1202555', 'US');
  assert(!result.isValid, 'should be invalid');
  assert(result.error !== null);
});

test('rejects letters in phone number', () => {
  const result = validatePhoneNumber('abcdefghij', 'US');
  assert(!result.isValid, 'should be invalid');
});

test('rejects whitespace-only input', () => {
  const result = validatePhoneNumber('   ');
  assert(!result.isValid, 'should be invalid');
});

// --- Country code override ---

test('explicit country code overrides auto-detection', () => {
  // Without country code, this would be ambiguous
  const result = validatePhoneNumber('2025551234', 'US');
  assert(result.isValid, 'should be valid with explicit US');
  assert(result.countryCode === 'US');
  assert(result.formattedNumber === '+12025551234');
});

// --- E.164 formatting ---

test('formats to E.164 with leading +', () => {
  const result = validatePhoneNumber('+442071234567');
  assert(result.isValid);
  assert(result.formattedNumber.startsWith('+'), 'E.164 should start with +');
  assert(!/[^+\d]/.test(result.formattedNumber), 'E.164 should only contain + and digits');
});

test('handles number with spaces and dashes', () => {
  const result = validatePhoneNumber('+44 20 7123 4567');
  assert(result.isValid);
  assert(result.formattedNumber === '+442071234567');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
