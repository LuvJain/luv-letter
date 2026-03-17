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

## Done
- **Phase 1: Create authentication data models and API endpoints** — Implemented backend auth system with user registration, login with JWT tokens, and password reset via SMS. Created password hashing utility (bcryptjs, 10 salt rounds), JWT token utility (24h expiry, SECRET_KEY signed), in-memory user store (phone_number as unique key with reset code storage), and four serverless API endpoints: register (phone validation for NA/EU formats), login (credential validation returning JWT), request-password-reset (6-digit code with 15-min expiry sent via Textbelt SMS), and reset-password (code validation and password update).
  Files: package.json, package-lock.json, src/utils/password-hash.js, src/utils/auth-token.js, src/utils/user-store.js, api/auth/register.js, api/auth/login.js, api/auth/request-password-reset.js, api/auth/reset-password.js

# Your Task: Users can log in via form, session persists in localStorage, logout clears session

## Description
Create React Context to manage authentication state across the app, build login and password reset forms with Tailwind styling, and implement session persistence in localStorage. The login flow requires credentials on every app open (no persistent sessions) for enhanced security.

## Acceptance Criteria
- Login form accepts phone number and password, submits to API, and stores token in localStorage
- User is redirected to main app after successful login
- Logout clears token from localStorage and returns user to login form
- Password reset form requests code via SMS and accepts code + new password
- App requires login on every open (no automatic session restoration)

## Implementation Notes
- Create src/context/auth-context.jsx with AuthProvider component that manages user, token, loading, and error state using useState, provides login/logout/requestPasswordReset/resetPassword functions via useCallback.
- Implement src/hooks/use-auth.js custom hook that returns useContext(AuthContext) for easy access to auth state and functions throughout the app.
- Build src/components/login-form.jsx with phone_number and password inputs, submit handler that calls auth.login() and stores token in localStorage on success, displays error message if login fails.
- Create src/components/password-reset-form.jsx with phone_number input, submit handler that calls auth.requestPasswordReset(), then shows second form for reset_code and new_password inputs.
- Implement src/components/auth-layout.jsx as wrapper component that checks if user is authenticated, redirects to login-form if not, renders children if authenticated.
- Add localStorage.setItem('auth_token', token) in login function and localStorage.removeItem('auth_token') in logout function, with no automatic token restoration on app load (require login every time per user decision).
- Style all forms with Tailwind CSS using existing color scheme from codebase, include loading spinner during API calls, display validation errors inline below form fields.

## Completion
Verify your changes work — run relevant tests or checks appropriate for this project.

Then create `.codepoet/stories/22cd2ea9-0650-4b18-a5c6-de0fd789e435/done.json` with this exact structure:
```json
{
  "status": "completed",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The file MUST be at exactly `.codepoet/stories/22cd2ea9-0650-4b18-a5c6-de0fd789e435/done.json`.
Do not create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).