import { createSchedule } from '../lib/schedule-service.js';

const VALID_CHANNELS = ['sms', 'letter', 'both'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { templateId, scheduledAt, channel, recipients } = req.body;

    // Validate required fields
    if (!templateId) {
      return res.status(400).json({ error: 'Missing required field: templateId' });
    }
    if (!scheduledAt) {
      return res.status(400).json({ error: 'Missing required field: scheduledAt' });
    }
    if (!channel) {
      return res.status(400).json({ error: 'Missing required field: channel' });
    }
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Missing required field: recipients (must be a non-empty array)' });
    }

    // Validate channel
    if (!VALID_CHANNELS.includes(channel)) {
      return res.status(400).json({
        error: `Invalid channel: ${channel}. Must be one of: ${VALID_CHANNELS.join(', ')}`,
      });
    }

    // Validate scheduledAt is in the future
    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ error: 'Invalid scheduledAt: must be a valid ISO 8601 date' });
    }
    if (scheduledDate <= new Date()) {
      return res.status(400).json({ error: 'scheduledAt must be in the future' });
    }

    // Validate each recipient has a recipientId
    for (const recipient of recipients) {
      if (!recipient.recipientId) {
        return res.status(400).json({ error: 'Each recipient must have a recipientId' });
      }
    }

    const result = await createSchedule(templateId, scheduledAt, channel, recipients);

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating schedule:', error.message);
    return res.status(500).json({
      error: 'Failed to create schedule',
      details: error.message,
    });
  }
}
