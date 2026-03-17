import { listSchedules } from '../lib/schedule-service.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status, channel, dateFrom, dateTo, limit, offset } = req.query;

    const filters = {};

    if (status) {
      filters.status = status;
    }

    if (channel) {
      filters.channel = channel;
    }

    if (dateFrom) {
      filters.dateFrom = dateFrom;
    }

    if (dateTo) {
      filters.dateTo = dateTo;
    }

    if (limit) {
      const parsedLimit = parseInt(limit, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return res.status(400).json({ error: 'Invalid limit: must be a positive integer' });
      }
      filters.limit = parsedLimit;
    }

    if (offset) {
      const parsedOffset = parseInt(offset, 10);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return res.status(400).json({ error: 'Invalid offset: must be a non-negative integer' });
      }
      filters.offset = parsedOffset;
    }

    const { schedules, totalCount } = await listSchedules(filters);

    return res.status(200).json({ schedules, totalCount });
  } catch (error) {
    console.error('Error listing schedules:', error.message);
    return res.status(500).json({
      error: 'Failed to list schedules',
      details: error.message,
    });
  }
}
