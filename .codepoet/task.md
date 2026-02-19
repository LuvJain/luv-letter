# Task: Serverless endpoint accepts SMS requests and schedules delivery via Twilio

## Description
Create a serverless function endpoint that receives SMS message requests, validates them, schedules delivery through Twilio's API, and returns confirmation with message ID and scheduled time.

## Acceptance Criteria
- Endpoint accepts POST requests with phone, message content, and scheduled time
- JWT authentication is required and validated before processing
- Phone numbers are validated before sending to Twilio
- Messages are scheduled for delivery within 3 days using Twilio's SendAt feature
- Endpoint returns message ID and confirmation status on success

## Implementation Notes
- Create api/schedule-sms.js serverless function that accepts POST requests with recipientPhone, messageContent, and scheduledTime in request body.
- Validate JWT token from Authorization header using existing authentication pattern, returning 401 if missing or invalid.
- Call validatePhoneNumber utility and return 400 with error message if phone validation fails.
- Create sms-service.js with scheduleMessage function that calls Twilio API using fetch with account SID and auth token from environment variables.
- Use Twilio's built-in scheduling feature by passing SendAt parameter (Unix timestamp) to schedule delivery within 3 days.
- Return 200 response with messageId from Twilio, formattedPhone, scheduledTime, and status 'scheduled' on success; return 500 with error details on Twilio API failure.

## When You're Done
When you have completed all acceptance criteria, create the file `.codepoet/done.json` with this structure:
```json
{"status": "completed", "summary": "<brief summary of what you did>", "files_changed": ["list", "of", "files"]}
```
Do NOT create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).