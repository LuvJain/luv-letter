import { createReminderJob } from '../../src/services/job-queue.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messageId, userId, scheduledTime } = req.body;

    // Validate required fields
    if (!messageId) {
      return res.status(400).json({ error: 'Missing required field: messageId' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'Missing required field: userId' });
    }

    if (!scheduledTime) {
      return res.status(400).json({ error: 'Missing required field: scheduledTime' });
    }

    // Basic authentication check - userId must be a non-empty string
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const job = await createReminderJob(messageId, userId, scheduledTime);

    return res.status(200).json({
      success: true,
      jobId: job.id,
      scheduledTime,
    });
  } catch (error) {
    console.error('Error scheduling reminder job:', {
      message: error.message,
    });
    return res.status(500).json({
      error: 'Failed to schedule reminder job',
      details: error.message,
    });
  }
}
