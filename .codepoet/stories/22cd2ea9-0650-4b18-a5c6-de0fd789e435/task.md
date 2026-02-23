# Task: Users can log in via form, session persists in localStorage, logout clears session

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

## When You're Done
When you have completed all acceptance criteria, create the file `.codepoet/stories/22cd2ea9-0650-4b18-a5c6-de0fd789e435/done.json` with this exact structure:
```json
{
  "status": "completed",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The file MUST be at exactly `.codepoet/stories/22cd2ea9-0650-4b18-a5c6-de0fd789e435/done.json`.
Do NOT create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).