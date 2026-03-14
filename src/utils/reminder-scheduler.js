// Reminder scheduling for scheduled messages

import { createReminderJob } from '../services/job-queue.js';
import { getEmailPreferencesStore } from './storage.js';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 1 * 24 * 60 * 60 * 1000;

/**
 * Schedule reminder jobs for a message: 3 days before and 1 day before send time.
 *
 * Returns early without scheduling if:
 * - scheduledSendTime is in the past
 * - userId has unsubscribe_status true
 *
 * @param {string} messageId - The scheduled message identifier
 * @param {string|Date} scheduledSendTime - When the message is scheduled to send
 * @param {string} userId - The user who created the message
 * @returns {Promise<{ scheduled: boolean, jobIds?: string[], reason?: string }>}
 */
export const scheduleReminders = async (messageId, scheduledSendTime, userId) => {
  const sendDate = new Date(scheduledSendTime);
  const now = new Date();

  // Return early if scheduled send time is in the past
  if (sendDate.getTime() <= now.getTime()) {
    return { scheduled: false, reason: 'Scheduled send time is in the past' };
  }

  // Return early if user has unsubscribed
  const prefs = getEmailPreferencesStore(userId);
  if (prefs.unsubscribe_status) {
    return { scheduled: false, reason: 'User has unsubscribed from reminders' };
  }

  const jobIds = [];

  // Schedule 3-day reminder (only if that time is still in the future)
  const threeDaysBefore = new Date(sendDate.getTime() - THREE_DAYS_MS);
  if (threeDaysBefore.getTime() > now.getTime()) {
    const job = await createReminderJob(messageId + '-3day', userId, threeDaysBefore);
    jobIds.push(job.id);
  }

  // Schedule 1-day reminder (only if that time is still in the future)
  const oneDayBefore = new Date(sendDate.getTime() - ONE_DAY_MS);
  if (oneDayBefore.getTime() > now.getTime()) {
    const job = await createReminderJob(messageId + '-1day', userId, oneDayBefore);
    jobIds.push(job.id);
  }

  return { scheduled: true, jobIds };
};
