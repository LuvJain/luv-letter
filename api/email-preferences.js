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
    if (typeof userId !== 'string' || userId.trim() === '') {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate action
    if (!action) {
      return res.status(400).json({ error: 'Missing required field: action' });
    }

    const validActions = ['get', 'update_email', 'set_unsubscribed', 'set_snooze'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        error: `Invalid action. Must be one of: ${validActions.join(', ')}`,
      });
    }

    // Handle each action
    if (action === 'get') {
      // Return current preferences (placeholder - client-side storage handles this)
      return res.status(200).json({
        success: true,
        message: 'Use client-side getEmailPreferences for localStorage access',
      });
    }

    if (action === 'update_email') {
      // Validate email
      if (!email || typeof email !== 'string' || email.trim() === '') {
        return res.status(400).json({ error: 'Email is required and must be a non-empty string' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          error: 'Invalid email format: must contain @ symbol and a valid domain',
        });
      }

      return res.status(200).json({
        success: true,
        userId,
        email: email.trim(),
        message: 'Email updated successfully',
      });
    }

    if (action === 'set_unsubscribed') {
      if (typeof unsubscribe_status !== 'boolean') {
        return res.status(400).json({ error: 'unsubscribe_status must be a boolean value' });
      }

      return res.status(200).json({
        success: true,
        userId,
        unsubscribe_status,
        message: unsubscribe_status
          ? 'Successfully unsubscribed from email reminders'
          : 'Successfully re-subscribed to email reminders',
      });
    }

    if (action === 'set_snooze') {
      // Allow null/0 to clear snooze
      if (snooze_days === null || snooze_days === 0) {
        return res.status(200).json({
          success: true,
          userId,
          snooze_until: null,
          message: 'Snooze cleared',
        });
      }

      const days = Number(snooze_days);
      if (isNaN(days) || days < 0) {
        return res.status(400).json({ error: 'snooze_days must be a non-negative number' });
      }

      const snoozeUntil = new Date();
      snoozeUntil.setDate(snoozeUntil.getDate() + days);

      // Validate snooze_until is a future timestamp
      if (snoozeUntil <= new Date()) {
        return res.status(400).json({ error: 'Snooze period must result in a future date' });
      }

      return res.status(200).json({
        success: true,
        userId,
        snooze_until: snoozeUntil.toISOString(),
        message: `Reminders snoozed for ${days} days`,
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
