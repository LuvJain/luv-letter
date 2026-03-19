# Project
Send personalized messages to people through multiple channels—combining handwritten letters with SMS notifications—to help users maintain meaningful connections at scale. Deliver heartfelt communications that blend the intimacy of physical mail with the immediacy of text messaging.
Stack: JavaScript | React | Tailwind CSS | Vite
Patterns:
- Error Handling: Basic try-catch blocks in async API handlers with early return pattern for validation errors. HTTP status codes used to indicate error types (405 for method not allowed, 400 for missing fields, 500 for server errors).
- Async Patterns: Async/await used in API handlers and useEffect hooks for asynchronous operations. Synchronous localStorage operations used for data persistence without explicit async handling.
- File Organization: Modular structure with separation of concerns: src/components/ for React components, src/utils/ for utility functions (storage, email templates), api/ for serverless API handlers, src/main.jsx as entry point.
- Code Style: ES6+ syntax with arrow functions, destructuring, and template literals. Descriptive variable and function names. Tailwind CSS classes for styling. Lowercase kebab-case for component names and file names.
- Authentication: Environment variable-based API key authentication for third-party services
- Logging: Basic console.error for error logging in API handlers
- State Management: React hooks (useState, useEffect) for local component state; utility functions for data persistence via storage module

# Goal: SMS Scheduling Service Integration
Implement SMS message scheduling and delivery capability using a third-party messaging service (Twilio or equivalent) to enable immediate text notifications within 3 days. The system must integrate with the existing JavaScript/React/Vite stack, store message details and schedules in the application state using Redux Toolkit, and coordinate with the third-party service for actual SMS delivery. Implementation must comply with workspace standards including JWT authentication for API access, Winston logging for message tracking and delivery status, and secure credential storage for the messaging service API keys. The solution should leverage the third-party service's built-in delivery tracking to monitor successful message transmission and provide real-time status updates through Redux state management.

## Done
- **Phase 1: Set up SMS message data model and Redux state management** — Created Redux store with smsSlice containing messages array, loading, and error state. Defined MessageStatus enum and Message interface in sms.types.js. Implemented addMessage, updateMessageStatus, removeMessage, setLoading, and setError reducers. Added selector functions (selectAllMessages, selectMessageById, selectPendingMessages, selectMessagesByStatus). Wired up Redux Provider in main.jsx. All 8 tests pass and build succeeds.
  Files: package.json, package-lock.json, src/store/index.js, src/store/smsSlice.js, src/store/sms.types.js, src/store/smsSlice.test.js, src/main.jsx

# Your Task: Phone numbers validated and formatted for North America and Europe regions

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

## Completion
Verify your changes work — run relevant tests or checks appropriate for this project.

Then create `.codepoet/stories/c574cf02-1deb-40fe-b0eb-f560b477675a/done.json` with this exact structure:
```json
{
  "status": "completed",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The file MUST be at exactly `.codepoet/stories/c574cf02-1deb-40fe-b0eb-f560b477675a/done.json`.
Do not create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).