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
- **Phase 1: Add email storage and unsubscribe preferences to user data** — Added email preference storage and management for reminder notifications. Extended storage.js with EMAIL_PREFERENCES localStorage key and per-user get/save functions supporting email, unsubscribe_status (boolean), and snooze_until (nullable ISO timestamp) fields. Created src/utils/email-preferences.js with getEmailPreferences, updateEmail (with regex validation), setUnsubscribed, setSnoozePeriod (days-to-ISO conversion), and shouldSendReminders helper. Created api/email-preferences.js POST endpoint with early-return validation (400 for missing userId/invalid email/bad action, 401 for unauthenticated users, 405 for non-POST, 500 for unexpected errors) following the existing try-catch + console.error pattern.
  Files: src/utils/storage.js, src/utils/email-preferences.js, api/email-preferences.js
- **Phase 2: Set up job queue for scheduled email reminders** — Implemented background job queue for reliable email reminder delivery. Created src/services/job-queue.js with Bull/Redis queue featuring 3-attempt retry with exponential backoff (5s base), completed job cleanup after 1 hour, and delayed job scheduling. Created src/services/email-service.js with sendReminderEmail that checks user unsubscribe_status and snooze_until before sending via SMTP (nodemailer). Created api/jobs/send-reminders.js POST endpoint with validation for messageId, userId, and scheduledTime fields, returning 400/401/405/500 status codes following existing patterns.
  Files: src/services/job-queue.js, src/services/email-service.js, api/jobs/send-reminders.js

# Your Task: Email reminders include message previews and action links

## Description
Build email templates for reminder notifications that include message previews and quick-action links. Integrate the email system with the existing scheduled message functionality to automatically create reminder jobs when messages are scheduled.

## Acceptance Criteria
- Email templates include message preview, recipient name, and scheduled send time
- Emails contain clickable links to review and edit messages that track source as 'email_reminder'
- Two reminders are automatically scheduled: 3 days before and 1 day before message send time
- Reminders are not scheduled if user is unsubscribed or message send time is in the past

## Implementation Notes
- Create src/utils/email-templates.js with function generateReminderEmail(messagePreview, messageId, recipientName, actionUrl) that returns HTML string with message preview, recipient name, scheduled send time, and clickable links to review/edit message
- Include two action links in template: 'Review Message' (links to /messages/{messageId}) and 'Edit Message' (links to /messages/{messageId}/edit) with query parameter utm_source=email_reminder
- Create src/utils/reminder-scheduler.js with function scheduleReminders(messageId, scheduledSendTime, userId) that calculates two reminder times: 3 days before and 1 day before send time, calls createReminderJob for each
- Modify api/messages.js POST /api/messages endpoint to call scheduleReminders after message is created, passing messageId, scheduledTime, and userId from request body
- Add validation in scheduleReminders: return early if scheduledSendTime is in past, return early if userId has unsubscribe_status true
- Store reminder job IDs in message object so reminders can be cancelled if message is deleted before send time

## Completion
Verify your changes work — run relevant tests or checks appropriate for this project.

Then create `.codepoet/stories/39a3f961-d639-4654-afa2-3a72a85a4752/done.json` with this exact structure:
```json
{
  "status": "completed",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The file MUST be at exactly `.codepoet/stories/39a3f961-d639-4654-afa2-3a72a85a4752/done.json`.
Do not create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).