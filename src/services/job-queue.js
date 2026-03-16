// Background job queue for scheduling and sending email reminders
// Uses Bull with Redis for reliable job processing with retry logic

import Bull from 'bull';
import { sendReminderEmail } from './email-service.js';

const QUEUE_NAME = 'email-reminders';

// Initialize Bull queue with Redis connection
const createQueue = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  const queue = new Bull(QUEUE_NAME, redisUrl, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000, // 5 second base delay
      },
      removeOnComplete: {
        age: 3600, // Remove completed jobs after 1 hour (in seconds)
      },
      removeOnFail: false, // Keep failed jobs for debugging
    },
  });

  return queue;
};

let queueInstance = null;

// Get or create singleton queue instance
const getQueue = () => {
  if (!queueInstance) {
    queueInstance = createQueue();
  }
  return queueInstance;
};

// Create a reminder job and store it in the Redis queue
export const createReminderJob = async (messageId, userId, sendTime) => {
  if (!messageId) {
    throw new Error('messageId is required');
  }

  if (!userId) {
    throw new Error('userId is required');
  }

  if (!sendTime) {
    throw new Error('sendTime is required');
  }

  const queue = getQueue();

  // Calculate delay until the send time
  const scheduledDate = new Date(sendTime);
  const now = new Date();
  const delay = Math.max(0, scheduledDate.getTime() - now.getTime());

  const job = await queue.add(
    {
      messageId,
      userId,
      sendTime,
      createdAt: now.toISOString(),
    },
    {
      delay,
      jobId: `reminder-${messageId}-${userId}`,
    },
  );

  return {
    success: true,
    jobId: job.id,
    messageId,
    userId,
    scheduledFor: scheduledDate.toISOString(),
    delay,
  };
};

// Process queued jobs - attach the job processor to the queue
export const processQueue = () => {
  const queue = getQueue();

  queue.process(async (job) => {
    const { messageId, userId } = job.data;

    try {
      const result = await sendReminderEmail(userId, messageId);

      if (result.skipped) {
        // Job completed but email was intentionally not sent
        return {
          status: 'skipped',
          reason: result.reason,
          messageId,
          userId,
        };
      }

      return {
        status: 'sent',
        emailMessageId: result.messageId,
        to: result.to,
        messageId,
        userId,
      };
    } catch (error) {
      console.error('Failed to send reminder email:', {
        jobId: job.id,
        messageId,
        userId,
        error: error.message,
        attempt: job.attemptsMade + 1,
      });
      throw error; // Re-throw so Bull handles retry
    }
  });

  // Log job lifecycle events for monitoring
  queue.on('completed', (job, result) => {
    const { messageId, userId } = job.data;
    console.log('Reminder job completed:', {
      jobId: job.id,
      messageId,
      userId,
      result,
    });
  });

  queue.on('failed', (job, error) => {
    const { messageId, userId } = job.data;
    console.error('Reminder job failed:', {
      jobId: job.id,
      messageId,
      userId,
      error: error.message,
      attemptsMade: job.attemptsMade,
    });
  });

  queue.on('stalled', (job) => {
    console.error('Reminder job stalled:', {
      jobId: job.id,
    });
  });

  return queue;
};

// Graceful shutdown helper
export const closeQueue = async () => {
  if (queueInstance) {
    await queueInstance.close();
    queueInstance = null;
  }
};
