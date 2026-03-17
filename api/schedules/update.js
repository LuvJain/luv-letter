import { updateSchedule } from '../lib/schedule-service.js';

const VALID_CHANNELS = ['sms', 'letter', 'both'];
const VALID_STATUSES = ['pending', 'scheduled', 'sent', 'failed', 'cancelled'];

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { scheduledAt, status, channel } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing required parameter: id' });
    }

    // Build updates object from allowed fields only
    const updates = {};

    if (scheduledAt !== undefined) {
      const scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ error: 'Invalid scheduledAt: must be a valid ISO 8601 date' });
      }
      if (scheduledDate <= new Date()) {
        return res.status(400).json({ error: 'scheduledAt must be in the future' });
      }
      updates.scheduled_at = scheduledAt;
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `Invalid status: ${status}. Must be one of: ${VALID_STATUSES.join(', ')}`,
        });
      }
      updates.status = status;
    }

    if (channel !== undefined) {
      if (!VALID_CHANNELS.includes(channel)) {
        return res.status(400).json({
          error: `Invalid channel: ${channel}. Must be one of: ${VALID_CHANNELS.join(', ')}`,
        });
      }
      updates.channel = channel;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update. Allowed fields: scheduledAt, status, channel' });
    }

    const schedule = await updateSchedule(id, updates);

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    return res.status(200).json(schedule);
  } catch (error) {
    console.error('Error updating schedule:', error.message);
    return res.status(500).json({
      error: 'Failed to update schedule',
      details: error.message,
    });
  }
}
