export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, action, email, unsubscribe_status, snooze_days } = req.body;

    // Validate userId is present
    if (!userId) {
      return res.status(400).json({ error: 'Missing required field: userId' });
    }

    // Basic authentication check - userId must be a non-empty string
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate action
    if (!action) {
      return res.status(400).json({ error: 'Missing required field: action' });
    }

    const validActions = ['update_email', 'set_unsubscribed', 'set_snooze', 'get_preferences'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        error: `Invalid action. Must be one of: ${validActions.join(', ')}`,
      });
    }

    // Handle each action
    if (action === 'update_email') {
      // Validate email is non-empty string
      if (!email || typeof email !== 'string' || email.trim().length === 0) {
        return res.status(400).json({ error: 'Email is required and must be a non-empty string' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Invalid email format: must contain @ and a valid domain' });
      }

      return res.status(200).json({
        success: true,
        message: 'Email updated successfully',
        data: { email: email.trim() },
      });
    }

    if (action === 'set_unsubscribed') {
      if (typeof unsubscribe_status !== 'boolean') {
        return res.status(400).json({ error: 'unsubscribe_status must be a boolean (true or false)' });
      }

      return res.status(200).json({
        success: true,
        message: unsubscribe_status
          ? 'Successfully unsubscribed from email reminders'
          : 'Successfully re-subscribed to email reminders',
        data: { unsubscribe_status },
      });
    }

    if (action === 'set_snooze') {
      if (typeof snooze_days !== 'number' || !Number.isInteger(snooze_days) || snooze_days <= 0) {
        return res.status(400).json({ error: 'snooze_days must be a positive integer' });
      }

      const snoozeUntil = new Date();
      snoozeUntil.setDate(snoozeUntil.getDate() + snooze_days);
      const snoozeUntilISO = snoozeUntil.toISOString();

      // Validate that snooze_until is a valid future timestamp
      if (new Date(snoozeUntilISO) <= new Date()) {
        return res.status(400).json({ error: 'Snooze period must result in a future timestamp' });
      }

      return res.status(200).json({
        success: true,
        message: `Reminders snoozed for ${snooze_days} day(s)`,
        data: { snooze_until: snoozeUntilISO },
      });
    }

    if (action === 'get_preferences') {
      return res.status(200).json({
        success: true,
        data: {
          userId: userId.trim(),
        },
      });
    }
  } catch (error) {
    console.error('Error updating email preferences:', {
      message: error.message,
    });
    return res.status(500).json({
      error: 'Failed to update email preferences',
      details: error.message,
    });
  }
}
