# Task: All routes protected; unauthenticated users see only login screen

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

## When You're Done
When you have completed all acceptance criteria, create the file `.codepoet/stories/6c855980-bff2-4e3d-9b16-db4e55716f86/done.json` with this exact structure:
```json
{
  "status": "completed",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The file MUST be at exactly `.codepoet/stories/6c855980-bff2-4e3d-9b16-db4e55716f86/done.json`.
Do NOT create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).