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

# Goal: Email Reminders for Scheduled Messages
Implement an automated email notification system that sends reminders to users when their scheduled messages are about to be sent. The system should integrate with the existing scheduled message functionality to trigger email notifications at appropriate times before message send dates, allowing users to review and make changes without logging into the application. Emails should include message previews and quick action links to facilitate rapid review and modification. The implementation must handle email delivery reliability, user email storage, and unsubscribe request management. This feature targets users who don't check the application daily and need out-of-band notifications to stay informed about their scheduled content.

# Your Task: Users can store email addresses and control reminder notification settings

## Description
Extend the user authentication system to store email addresses and manage reminder preferences including unsubscribe status and snooze periods. This creates the foundation for sending emails and respecting user communication preferences.

## Acceptance Criteria
- Users can add and update their email address through the preferences API
- Users can unsubscribe from all email reminders and remain unsubscribed until they re-enable
- Users can snooze reminders for a specified number of days; reminders resume automatically after snooze expires
- Email validation rejects invalid formats (missing @, no domain, etc.) with clear error messages

## Implementation Notes
- Add email, unsubscribe_status (boolean, default false), snooze_until (nullable timestamp) fields to user storage structure in src/utils/storage.js
- Create src/utils/email-preferences.js with functions: getEmailPreferences(userId), updateEmail(userId, email), setUnsubscribed(userId, status), setSnoozePeriod(userId, daysToSnooze)
- Create api/email-preferences.js endpoint POST /api/email-preferences to update email and preferences with validation that email is non-empty string and snooze_until is valid future timestamp
- Add early return validation in email-preferences endpoint: return 400 if userId missing, return 400 if email invalid format, return 401 if user not authenticated
- Use existing try-catch pattern with console.error for failures and return 500 on unexpected errors
- Store snooze_until as ISO timestamp string in localStorage alongside user data, check snooze expiration before sending reminders

## Completion
Verify your changes work — run relevant tests or checks appropriate for this project.

Then create `.codepoet/stories/fcaafc9b-e481-4b44-af7f-b3a7f42ebb0e/done.json` with this exact structure:
```json
{
  "status": "completed",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The file MUST be at exactly `.codepoet/stories/fcaafc9b-e481-4b44-af7f-b3a7f42ebb0e/done.json`.
Do not create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).