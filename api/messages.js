import { scheduleReminders } from '../src/utils/reminder-scheduler.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messageId, userId, scheduledTime, recipientName, messageContent } = req.body;

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

    if (!recipientName) {
      return res.status(400).json({ error: 'Missing required field: recipientName' });
    }

    if (!messageContent) {
      return res.status(400).json({ error: 'Missing required field: messageContent' });
    }

    // Schedule reminder emails for this message
    const reminderResult = await scheduleReminders(messageId, scheduledTime, userId);

    return res.status(200).json({
      success: true,
      messageId,
      scheduledTime,
      reminders: reminderResult,
    });
  } catch (error) {
    console.error('Error creating message:', {
      message: error.message,
    });
    return res.status(500).json({
      error: 'Failed to create message',
      details: error.message,
    });
  }
}
