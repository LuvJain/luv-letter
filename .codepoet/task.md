# Task: Users can compose and schedule SMS messages through intuitive form UI

## Description
Build a React component that allows users to compose SMS messages, select recipients, choose delivery time, and submit for scheduling with real-time validation feedback.

## Acceptance Criteria
- Form validates phone number format and shows error if invalid
- Users can select delivery time up to 3 days in future
- Message content character count is displayed with warning at SMS limit
- Form shows loading state during submission and success confirmation after scheduling
- Form works offline by queuing message in Redux state

## Implementation Notes
- Create sms-message-form.jsx component with useState for recipientPhone, messageContent, scheduledTime, and loading/error states.
- Implement form submission handler that validates all fields, calls scheduleMessageWithOfflineSupport thunk, and shows success/error feedback.
- Create phone-input.jsx sub-component that calls validatePhoneNumber on blur and displays validation error message if invalid.
- Create schedule-time-picker.jsx sub-component with date/time input that enforces 3-day maximum scheduling window (today + 72 hours).
- Add character counter for message content with visual warning at 160 characters (SMS limit) and disable submit if exceeding 320 characters.
- Display loading spinner during submission and disable form inputs; show success toast with message ID and scheduled time on completion.

## When You're Done
When you have completed all acceptance criteria, create the file `.codepoet/done.json` with this structure:
```json
{"status": "completed", "summary": "<brief summary of what you did>", "files_changed": ["list", "of", "files"]}
```
Do NOT create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).