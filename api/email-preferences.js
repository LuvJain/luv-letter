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
    const validActions = ['get', 'update_email', 'set_unsubscribed', 'set_snooze'];
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({
        error: `Invalid action. Must be one of: ${validActions.join(', ')}`,
      });
    }

    // Handle each action
    if (action === 'get') {
      // Return current preferences (stored client-side, but endpoint
      // serves as the contract for the preference structure)
      return res.status(200).json({
        success: true,
        preferences: {
          email: '',
          unsubscribe_status: false,
          snooze_until: null,
        },
      });
    }

    if (action === 'update_email') {
      // Validate email format
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email is required and must be a string' });
      }

      const trimmedEmail = email.trim();

      if (trimmedEmail.length === 0) {
        return res.status(400).json({ error: 'Email cannot be empty' });
      }

      if (!trimmedEmail.includes('@')) {
        return res.status(400).json({ error: 'Email must contain an @ symbol' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({ error: 'Email format is invalid (expected: user@domain.com)' });
      }

      return res.status(200).json({
        success: true,
        email: trimmedEmail,
      });
    }

    if (action === 'set_unsubscribed') {
      if (typeof unsubscribe_status !== 'boolean') {
        return res.status(400).json({ error: 'unsubscribe_status must be a boolean' });
      }

      return res.status(200).json({
        success: true,
        unsubscribe_status,
      });
    }

    if (action === 'set_snooze') {
      if (typeof snooze_days !== 'number' || snooze_days <= 0 || !Number.isFinite(snooze_days)) {
        return res.status(400).json({ error: 'snooze_days must be a positive number' });
      }

      const snoozeUntil = new Date();
      snoozeUntil.setDate(snoozeUntil.getDate() + snooze_days);
      const snoozeUntilISO = snoozeUntil.toISOString();

      // Validate that snooze_until is a future timestamp
      if (new Date(snoozeUntilISO) <= new Date()) {
        return res.status(400).json({ error: 'Snooze period must result in a future timestamp' });
      }

      return res.status(200).json({
        success: true,
        snooze_until: snoozeUntilISO,
      });
    }
  } catch (error) {
    console.error('Error handling email preferences:', {
      message: error.message,
    });
    return res.status(500).json({
      error: 'Failed to process email preferences',
      details: error.message,
    });
  }
}
