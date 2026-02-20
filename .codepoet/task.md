# Task: Redux state structure ready to store and manage SMS messages with scheduling and status data

## Description
Create Redux slices and state structure to store SMS message details, schedules, and delivery status. Define the data model for messages including phone number, content, scheduled time, and status tracking.

## Acceptance Criteria
- Redux store contains smsSlice with messages array, loading state, and error state
- Message objects include recipientPhone, messageContent, scheduledTime, status, and retryCount fields
- Actions exist to add, update status, and remove messages from Redux state
- Selector functions return filtered message lists by status and ID

## Implementation Notes
- Create smsSlice.js with Redux Toolkit using createSlice to define initialState with messages array, loading state, and error state.
- Define message object structure with fields: id, recipientPhone, messageContent, scheduledTime, status (scheduled/sent/failed), createdAt, updatedAt, and retryCount.
- Add reducers for addMessage, updateMessageStatus, removeMessage, and setLoading following existing Redux patterns in codebase.
- Create sms.types.js with TypeScript-style JSDoc comments defining MessageStatus enum (SCHEDULED, SENT, FAILED) and Message interface.
- Export smsSlice reducer and actions from store/index.js, registering slice in configureStore following existing pattern.
- Add selector functions in smsSlice.js: selectAllMessages, selectMessageById, selectPendingMessages, selectMessagesByStatus.

## When You're Done
When you have completed all acceptance criteria, create the file `.codepoet/done.json` with this exact structure:
```json
{
  "status": "completed",
  "story_id": "a69ba5c7-35e1-4565-816e-8322bafb6904",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The "story_id" field MUST be exactly "a69ba5c7-35e1-4565-816e-8322bafb6904".
Do NOT create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).