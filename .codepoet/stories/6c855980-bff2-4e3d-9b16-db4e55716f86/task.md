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
- **Phase 2: Build authentication context and login UI components** — Implemented user authentication UI: AuthContext provider with login/logout/password-reset state management, useAuth hook, login form with phone+password inputs and localStorage token storage, two-step password reset form (request code via SMS then enter code+new password), AuthLayout wrapper that gates the app behind login (with subscribe link bypass), and logout button in bottom nav. App requires login on every open with no automatic session restoration. All styled with existing Tailwind color scheme including loading spinners and inline validation errors.
  Files: src/context/auth-context.jsx, src/hooks/use-auth.js, src/components/login-form.jsx, src/components/password-reset-form.jsx, src/components/auth-layout.jsx, src/main.jsx, src/App.jsx

# Your Task: All routes protected; unauthenticated users see only login screen

## Description
Wire authentication into the main app entry point, create route protection to redirect unauthenticated users to login, and ensure the auth context is available throughout the component tree. This phase completes the authentication system by making it the gatekeeper for all app features.

## Acceptance Criteria
- Unauthenticated users cannot access any app routes except login
- Authenticated users can access all protected routes
- Logout button clears session and returns user to login form
- Page refresh requires re-login (no persistent sessions)
- User's phone number displays in app header when logged in

## Implementation Notes
- Wrap entire app in AuthProvider in src/main.jsx so auth context is available to all components.
- Create src/components/protected-route.jsx that checks useAuth() hook, renders children if authenticated, renders LoginForm if not.
- Update src/app.jsx to wrap all route components with ProtectedRoute component, ensuring unauthenticated users cannot access any feature.
- Add logout button to main app header that calls auth.logout() and clears localStorage, styled with Tailwind CSS.
- Display current user's phone_number in app header using auth.user.phone_number from context, confirming user identity.
- Ensure API calls from authenticated routes include Authorization header with Bearer token from localStorage for backend validation (coordinate with existing API pattern).
- Test that refreshing the app on any protected route redirects to login form (no persistent session per user decision).

## Completion
Verify your changes work — run relevant tests or checks appropriate for this project.

Then create `.codepoet/stories/6c855980-bff2-4e3d-9b16-db4e55716f86/done.json` with this exact structure:
```json
{
  "status": "completed",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The file MUST be at exactly `.codepoet/stories/6c855980-bff2-4e3d-9b16-db4e55716f86/done.json`.
Do not create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).