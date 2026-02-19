# Task: Messages queue locally when offline and sync when connection restored

## Description
Implement local message queuing in Redux state when offline, with automatic sync to server when connection returns, ensuring no messages are lost during network interruptions.

## Acceptance Criteria
- Messages are queued in Redux state when offline
- Queued messages are sent to server automatically when connection returns
- Sync retries failed messages up to 3 times with exponential backoff
- User sees visual indication of queued vs. sent messages in UI

## Implementation Notes
- Create useOnlineStatus.js hook that listens to window online/offline events and returns boolean isOnline state.
- Add queuedMessages array to smsSlice initialState to store messages pending sync when offline.
- Create offline-sync.js service with syncQueuedMessages function that batches queued messages and sends to schedule-sms endpoint when online.
- Add Redux thunk action scheduleMessageWithOfflineSupport that adds message to queuedMessages if offline, or calls API immediately if online.
- Implement retry logic in offline-sync.js with exponential backoff (1s, 2s, 4s) for failed sync attempts, max 3 retries before marking as failed.
- Add useEffect in main.jsx that calls syncQueuedMessages when useOnlineStatus returns true, ensuring sync happens automatically on reconnection.

## When You're Done
When you have completed all acceptance criteria, create the file `.codepoet/done.json` with this structure:
```json
{"status": "completed", "summary": "<brief summary of what you did>", "files_changed": ["list", "of", "files"]}
```
Do NOT create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).