import { supabase } from '../lib/supabase';

/**
 * Create a new message schedule with recipients.
 * @param {string} templateId - UUID of the message template
 * @param {string} scheduledAt - ISO 8601 timestamp for delivery
 * @param {string} channel - 'sms', 'letter', or 'both'
 * @param {Array} recipients - Array of recipient objects
 * @returns {Promise<{schedule: object, recipients: Array}>}
 */
export async function createSchedule(templateId, scheduledAt, channel, recipients) {
  try {
    const { data: schedule, error: scheduleError } = await supabase
      .from('message_schedules')
      .insert({
        template_id: templateId,
        scheduled_at: scheduledAt,
        channel,
        status: 'pending',
        created_by: 'admin',
      })
      .select()
      .single();

    if (scheduleError) {
      throw scheduleError;
    }

    const recipientRows = recipients.map((r) => ({
      schedule_id: schedule.id,
      recipient_id: r.recipientId,
      phone_number: r.phoneNumber || null,
      address: r.address || null,
      personalization_data: r.personalizationData || {},
    }));

    const { data: insertedRecipients, error: recipientError } = await supabase
      .from('schedule_recipients')
      .insert(recipientRows)
      .select();

    if (recipientError) {
      throw recipientError;
    }

    return { schedule, recipients: insertedRecipients };
  } catch (error) {
    console.error('Error creating schedule:', error.message);
    throw error;
  }
}

/**
 * Fetch all schedules with optional filters.
 * @param {object} filters - { status, channel, dateFrom, dateTo, limit, offset }
 * @returns {Promise<{schedules: Array, totalCount: number}>}
 */
export async function fetchSchedules(filters = {}) {
  try {
    const { status, channel, dateFrom, dateTo, limit = 50, offset = 0 } = filters;

    let query = supabase
      .from('message_schedules')
      .select('*, schedule_recipients(*)', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (channel) {
      query = query.eq('channel', channel);
    }

    if (dateFrom) {
      query = query.gte('scheduled_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('scheduled_at', dateTo);
    }

    query = query
      .order('scheduled_at', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: schedules, count, error } = await query;

    if (error) {
      throw error;
    }

    return { schedules: schedules || [], totalCount: count || 0 };
  } catch (error) {
    console.error('Error fetching schedules:', error.message);
    throw error;
  }
}

/**
 * Delete (cancel) a schedule by ID.
 * @param {string} scheduleId - UUID of the schedule
 * @returns {Promise<object>}
 */
export async function deleteSchedule(scheduleId) {
  try {
    const { data: schedule, error } = await supabase
      .from('message_schedules')
      .update({ status: 'cancelled' })
      .eq('id', scheduleId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return schedule;
  } catch (error) {
    console.error('Error deleting schedule:', error.message);
    throw error;
  }
}

/**
 * Bulk update schedules (scheduled_at only).
 * @param {Array<string>} scheduleIds - Array of schedule UUIDs
 * @param {object} updates - { scheduledAt: ISO 8601 string }
 * @returns {Promise<{updatedCount: number, schedules: Array}>}
 */
export async function bulkUpdateSchedules(scheduleIds, updates) {
  try {
    const { data, error } = await supabase
      .from('message_schedules')
      .update({ scheduled_at: updates.scheduledAt })
      .in('id', scheduleIds)
      .select();

    if (error) {
      throw error;
    }

    return { updatedCount: data.length, schedules: data };
  } catch (error) {
    console.error('Error bulk updating schedules:', error.message);
    throw error;
  }
}
