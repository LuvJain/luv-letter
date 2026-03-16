import { createReminderJob } from '../../src/services/job-queue.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messageId, userId, scheduledTime } = req.body;

    // Validate userId is present and authenticated
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate required fields
    if (!messageId) {
      return res.status(400).json({ error: 'Missing required field: messageId' });
    }

    if (!scheduledTime) {
      return res.status(400).json({ error: 'Missing required field: scheduledTime' });
    }

    // Validate scheduledTime is a valid date
    const parsedTime = new Date(scheduledTime);
    if (isNaN(parsedTime.getTime())) {
      return res.status(400).json({ error: 'scheduledTime must be a valid date string' });
    }

    const result = await createReminderJob(messageId, userId, scheduledTime);

    return res.status(200).json({
      success: true,
      jobId: result.jobId,
      messageId: result.messageId,
      userId: result.userId,
      scheduledFor: result.scheduledFor,
      message: 'Reminder job created successfully',
    });
  } catch (error) {
    console.error('Error creating reminder job:', {
      message: error.message,
    });
    return res.status(500).json({
      error: 'Failed to create reminder job',
      details: error.message,
    });
  }
}
