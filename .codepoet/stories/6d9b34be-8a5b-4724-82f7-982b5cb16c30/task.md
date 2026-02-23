# Task: Backend can validate user credentials and generate secure reset tokens for SMS delivery

## Description
Set up the backend API structure to handle user registration, login credential validation, and password reset token generation. This includes creating serverless API endpoints that validate credentials, manage authentication tokens, and coordinate with the SMS service for password reset delivery.

## Acceptance Criteria
- Users can register with phone number, password, and name without errors lol

- Login endpoint validates credentials and returns a JWT token on success
- Login endpoint returns 401 status when password is incorrect
- Password reset request generates a 6-digit code and sends it via SMS within 3 seconds
- Reset password endpoint validates the code hasn't expired and updates the password

## Implementation Notes
- Create api/auth/login.js endpoint that accepts phone_number and password, validates both are present, and returns 400 if missing.
- Implement password hashing utility in src/utils/password-hash.js using bcryptjs library with salt rounds of 10 for secure storage.
- Create api/auth/register.js endpoint that accepts phone_number, password, and name, validates phone format matches North America or Europe patterns from existing SMS validation, and stores user with hashed password.
- Build api/auth/request-password-reset.js that accepts phone_number, generates a 6-digit reset code, stores it with 15-minute expiration, and triggers SMS delivery using existing Twilio integration pattern.
- Create api/auth/reset-password.js endpoint that accepts phone_number, reset_code, and new_password, validates code hasn't expired, and updates user password if valid.
- Implement src/utils/auth-token.js to generate JWT tokens containing user_id and phone_number, signed with environment variable SECRET_KEY, with 24-hour expiration.
- Store user credentials in a simple in-memory store or file-based JSON structure (no database required per project constraints) with phone_number as unique identifier.

## When You're Done
When you have completed all acceptance criteria, create the file `.codepoet/stories/6d9b34be-8a5b-4724-82f7-982b5cb16c30/done.json` with this exact structure:
```json
{
  "status": "completed",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The file MUST be at exactly `.codepoet/stories/6d9b34be-8a5b-4724-82f7-982b5cb16c30/done.json`.
Do NOT create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).