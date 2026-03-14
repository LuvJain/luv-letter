// Job queue service for scheduling and processing reminder email jobs

import Queue from 'bull';
import { sendReminderEmail } from './email-service.js';

const QUEUE_NAME = 'reminder-emails';

/**
 * Initialize Bull queue with Redis connection.
 * @returns {Queue.Queue}
 */
const createQueue = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  const queue = new Queue(QUEUE_NAME, redisUrl, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: {
        age: 3600,
      },
      removeOnFail: false,
    },
  });

  return queue;
};

let queueInstance = null;

/**
 * Get or create the singleton queue instance.
 * @returns {Queue.Queue}
 */
const getQueue = () => {
  if (!queueInstance) {
    queueInstance = createQueue();
  }
  return queueInstance;
};

/**
 * Create a reminder job in the queue, scheduled for the specified send time.
 *
 * @param {string} messageId - The scheduled message identifier
 * @param {string} userId - The user to notify
 * @param {Date|string} sendTime - When the reminder should be sent
 * @returns {Promise<import('bull').Job>}
 */
export const createReminderJob = async (messageId, userId, sendTime) => {
  const queue = getQueue();

  const sendDate = new Date(sendTime);
  const now = new Date();
  const delay = Math.max(0, sendDate.getTime() - now.getTime());

  const job = await queue.add(
    {
      messageId,
      userId,
      sendTime: sendDate.toISOString(),
    },
    {
      delay,
      jobId: `reminder-${messageId}-${userId}`,
    },
  );

  return job;
};

/**
 * Start processing jobs in the queue.
 * Each job calls sendReminderEmail and handles success/failure.
 */
export const processQueue = () => {
  const queue = getQueue();

  queue.process(async (job) => {
    const { messageId, userId } = job.data;

    const messagePreview = `Scheduled message ${messageId}`;

    const result = await sendReminderEmail(userId, messageId, messagePreview);

    if (!result.sent) {
      // If skipped due to unsubscribe/snooze, don't retry
      if (result.reason) {
        return { skipped: true, reason: result.reason };
      }
    }

    return { sent: true };
  });

  queue.on('failed', (job, error) => {
    console.error(`Job ${job.id} failed:`, {
      messageId: job.data.messageId,
      userId: job.data.userId,
      attempt: job.attemptsMade,
      error: error.message,
    });
  });

  queue.on('completed', (job, result) => {
    if (result && result.skipped) {
      console.error(`Job ${job.id} skipped: ${result.reason}`);
    }
  });

  return queue;
};
