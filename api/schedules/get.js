import { getSchedule } from '../lib/schedule-service.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing required parameter: id' });
    }

    const schedule = await getSchedule(id);

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    return res.status(200).json(schedule);
  } catch (error) {
    console.error('Error getting schedule:', error.message);
    return res.status(500).json({
      error: 'Failed to get schedule',
      details: error.message,
    });
  }
}
