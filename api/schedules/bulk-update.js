import { bulkUpdateSchedules } from '../lib/schedule-service.js';

const VALID_STATUSES = ['pending', 'scheduled', 'sent', 'failed', 'cancelled'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scheduleIds, updates } = req.body;

    // Validate scheduleIds
    if (!scheduleIds || !Array.isArray(scheduleIds) || scheduleIds.length === 0) {
      return res.status(400).json({ error: 'Missing required field: scheduleIds (must be a non-empty array)' });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Missing required field: updates (must be an object)' });
    }

    // Build validated updates from allowed fields only (scheduled_at and status)
    const validatedUpdates = {};

    if (updates.scheduledAt !== undefined) {
      const scheduledDate = new Date(updates.scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ error: 'Invalid scheduledAt: must be a valid ISO 8601 date' });
      }
      if (scheduledDate <= new Date()) {
        return res.status(400).json({ error: 'scheduledAt must be in the future' });
      }
      validatedUpdates.scheduled_at = updates.scheduledAt;
    }

    if (updates.status !== undefined) {
      if (!VALID_STATUSES.includes(updates.status)) {
        return res.status(400).json({
          error: `Invalid status: ${updates.status}. Must be one of: ${VALID_STATUSES.join(', ')}`,
        });
      }
      validatedUpdates.status = updates.status;
    }

    if (Object.keys(validatedUpdates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update. Allowed fields: scheduledAt, status' });
    }

    const result = await bulkUpdateSchedules(scheduleIds, validatedUpdates);

    return res.status(200).json(result);
  } catch (error) {
    // Handle "not found" errors from the service layer
    if (error.message && error.message.startsWith('Schedules not found:')) {
      return res.status(404).json({ error: error.message });
    }

    console.error('Error bulk updating schedules:', error.message);
    return res.status(500).json({
      error: 'Failed to bulk update schedules',
      details: error.message,
    });
  }
}
