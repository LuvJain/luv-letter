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

## Done
- Phase 1: Add email storage and unsubscribe preferences to user data — Added email preference storage and management system: extended storage.js with EMAIL_PREFERENCES storage key and per-user preference functions (email, unsubscribe_status, snooze_until fields); created src/utils/email-preferences.js with getEmailPreferences, updateEmail, setUnsubscribed, setSnoozePeriod, areRemindersActive functions plus email validation; created api/email-preferences.js POST endpoint with validation for userId, email format, unsubscribe status, and snooze days including early-return error handling following existing patterns.

# Your Task: Background jobs reliably send reminder emails with retry handling

## Description
Implement a background job queue using Bull/BullMQ with Redis to reliably schedule and send email reminder notifications. This ensures emails are sent at the correct times even if the server restarts, with automatic retry logic for failed deliveries.

## Acceptance Criteria
- Jobs are created and stored in Redis queue when reminder is scheduled
- Failed email sends automatically retry up to 3 times with exponential backoff
- Jobs respect user unsubscribe status and snooze periods before sending
- Completed jobs are cleaned up from queue after 1 hour to prevent memory bloat

## Implementation Notes
- Create src/services/job-queue.js that initializes Bull queue with Redis connection using process.env.REDIS_URL, export functions: createReminderJob(messageId, userId, sendTime), processQueue()
- Configure Bull queue with retry strategy: maxAttempts 3, backoff exponential with 5 second base delay, remove completed jobs after 1 hour
- Create src/services/email-service.js with function sendReminderEmail(userId, messageId, messagePreview) that retrieves user email from storage, checks unsubscribe_status and snooze_until before sending
- Implement email sending using Node.js built-in or lightweight library (nodemailer pattern): connect to SMTP server via process.env.SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- Create api/jobs/send-reminders.js endpoint POST /api/jobs/send-reminders that accepts {messageId, userId, scheduledTime} and calls createReminderJob, return 400 if any field missing, return 401 if not authenticated
- Add job processor in job-queue.js that calls sendReminderEmail on job execution, logs job completion with console.error on failure, emits job:failed event for monitoring

## Completion
Verify your changes work — run relevant tests or checks appropriate for this project.

Then create `.codepoet/stories/a77b6f4a-4ff4-497e-8a6b-95bcae388a23/done.json` with this exact structure:
```json
{
  "status": "completed",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The file MUST be at exactly `.codepoet/stories/a77b6f4a-4ff4-497e-8a6b-95bcae388a23/done.json`.
Do not create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).