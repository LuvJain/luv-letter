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

# Goal: User Authentication System
Implement a user authentication system that enables users to securely login to the application. This feature should be integrated into a React-based PWA built with Vite and styled with Tailwind CSS. The authentication system should provide a login interface, credential validation, session management, and secure token handling. Consider PWA-specific requirements such as offline capability and persistent authentication state. The implementation should follow modern security best practices and be compatible with the existing JavaScript/React tech stack.

# Your Task: Backend can validate user credentials and generate secure reset tokens for SMS delivery

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

## Completion
Verify your changes work — run relevant tests or checks appropriate for this project.

Then create `.codepoet/stories/6d9b34be-8a5b-4724-82f7-982b5cb16c30/done.json` with this exact structure:
```json
{
  "status": "completed",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The file MUST be at exactly `.codepoet/stories/6d9b34be-8a5b-4724-82f7-982b5cb16c30/done.json`.
Do not create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).