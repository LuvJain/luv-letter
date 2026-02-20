# Task: Phone numbers validated and formatted for North America and Europe regions

## Description
Create a phone number validation utility that formats and validates phone numbers for North America and European markets, ensuring data quality before sending to Twilio.

## Acceptance Criteria
- Phone numbers from all countries validate correctly with their respective country codes
- Phone numbers are validated against country-specific format rules and digit length requirements
- Invalid numbers are rejected with clear error messages indicating the specific validation failure
- All phone numbers are formatted to E.164 standard before storage
- System automatically detects country code from phone number input when possible
- Users can explicitly specify country code to override automatic detection

## Implementation Notes
- Integrate libphonenumber-js library to handle validation and formatting for all international phone numbers.
- Create phone-validation.js with validatePhoneNumber function accepting phone string and optional country code parameter (ISO 3166-1 alpha-2 format).
- Use parsePhoneNumber from libphonenumber-js to automatically detect country from input or use explicit country parameter.
- Validate parsed phone number using isValid() method and format to E.164 using format('E.164') method.
- Return object with isValid boolean, formattedNumber string, countryCode, and error message if validation fails.
- Handle edge cases including missing country code, invalid country parameter, and malformed input with try-catch block.
- Create comprehensive test file covering valid/invalid numbers from all regions including Asia, Africa, Oceania, Americas, and Europe.
- Add fallback validation for edge cases where libphonenumber-js cannot parse by checking minimum digit length and plus sign prefix.

## When You're Done
When you have completed all acceptance criteria, create the file `.codepoet/done.json` with this exact structure:
```json
{
  "status": "completed",
  "story_id": "c574cf02-1deb-40fe-b0eb-f560b477675a",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The "story_id" field MUST be exactly "c574cf02-1deb-40fe-b0eb-f560b477675a".
Do NOT create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).