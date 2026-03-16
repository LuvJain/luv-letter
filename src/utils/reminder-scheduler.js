// Reminder scheduler for creating email reminder jobs at appropriate times
// Schedules two reminders: 3 days before and 1 day before message send time

import { createReminderJob } from '../services/job-queue.js';
import { getEmailPreferences } from './email-preferences.js';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 1 * 24 * 60 * 60 * 1000;

// Schedule reminder jobs for a message
// Returns an array of job IDs that can be stored with the message for cancellation
export const scheduleReminders = async (messageId, scheduledSendTime, userId) => {
  if (!messageId || !scheduledSendTime || !userId) {
    return { success: false, error: 'messageId, scheduledSendTime, and userId are required', jobIds: [] };
  }

  const sendTime = new Date(scheduledSendTime);

  // Return early if scheduledSendTime is in the past
  if (sendTime.getTime() <= Date.now()) {
    return { success: false, error: 'Scheduled send time is in the past', jobIds: [] };
  }

  // Return early if user has unsubscribed
  const preferences = getEmailPreferences(userId);
  if (preferences.unsubscribe_status) {
    return { success: false, error: 'User has unsubscribed from reminders', jobIds: [] };
  }

  const jobIds = [];
  const errors = [];

  // Calculate reminder times
  const threeDaysBefore = new Date(sendTime.getTime() - THREE_DAYS_MS);
  const oneDayBefore = new Date(sendTime.getTime() - ONE_DAY_MS);

  // Schedule 3-day reminder if the reminder time is still in the future
  if (threeDaysBefore.getTime() > Date.now()) {
    try {
      const result = await createReminderJob(messageId, userId, threeDaysBefore.toISOString());
      jobIds.push(result.jobId);
    } catch (error) {
      console.error('Failed to schedule 3-day reminder:', { messageId, userId, error: error.message });
      errors.push({ type: '3-day', error: error.message });
    }
  }

  // Schedule 1-day reminder if the reminder time is still in the future
  if (oneDayBefore.getTime() > Date.now()) {
    try {
      const result = await createReminderJob(messageId, userId, oneDayBefore.toISOString());
      jobIds.push(result.jobId);
    } catch (error) {
      console.error('Failed to schedule 1-day reminder:', { messageId, userId, error: error.message });
      errors.push({ type: '1-day', error: error.message });
    }
  }

  return {
    success: errors.length === 0,
    jobIds,
    errors: errors.length > 0 ? errors : undefined,
    remindersScheduled: jobIds.length,
  };
};
