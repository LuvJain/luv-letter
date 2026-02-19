# Task: Twilio credentials securely stored and never exposed in client-side code

## Description
Implement secure storage and retrieval of Twilio API credentials using environment variables and a settings management system that prevents credential leakage.

## Acceptance Criteria
- Twilio API credentials are stored only in environment variables, not in code or state
- Settings component shows connection status without displaying actual credentials
- Credentials are validated at startup with error handling if missing
- No API keys appear in Redux state, localStorage, or browser console

## Implementation Notes
- Create credential-manager.js utility that reads Twilio API key and account SID from environment variables (VITE_TWILIO_ACCOUNT_SID, VITE_TWILIO_AUTH_TOKEN) at build time only.
- Add validation function that checks credentials exist and are non-empty, returning error if missing, following early return pattern.
- Modify settings.jsx to display Twilio provider selection and credential status (connected/disconnected) without exposing actual keys.
- Store only the provider name and connection status in Redux state, never store actual API keys in application state or localStorage.
- Create .env.example file documenting required environment variables with placeholder values for developer reference.
- Add function to validate credentials by making test API call to Twilio (ping endpoint) without exposing keys in response.

## When You're Done
When you have completed all acceptance criteria, create the file `.codepoet/done.json` with this structure:
```json
{"status": "completed", "summary": "<brief summary of what you did>", "files_changed": ["list", "of", "files"]}
```
Do NOT create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).