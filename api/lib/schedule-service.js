import { supabase } from './supabase.js';

/**
 * Create a new message schedule with recipients.
 * @param {string} templateId - UUID of the message template
 * @param {string} scheduledAt - ISO 8601 timestamp for delivery
 * @param {string} channel - 'sms', 'letter', or 'both'
 * @param {Array} recipients - Array of recipient objects
 * @returns {Promise<{schedule: object, recipients: Array}>}
 */
export async function createSchedule(templateId, scheduledAt, channel, recipients) {
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
}

/**
 * Get a single schedule by ID, including its recipients.
 * @param {string} scheduleId - UUID of the schedule
 * @returns {Promise<object|null>}
 */
export async function getSchedule(scheduleId) {
  const { data: schedule, error } = await supabase
    .from('message_schedules')
    .select('*, schedule_recipients(*)')
    .eq('id', scheduleId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return schedule;
}

/**
 * List schedules with optional filters and pagination.
 * @param {object} filters - { status, channel, dateFrom, dateTo, limit, offset }
 * @returns {Promise<{schedules: Array, totalCount: number}>}
 */
export async function listSchedules(filters = {}) {
  const { status, channel, dateFrom, dateTo, limit = 20, offset = 0 } = filters;

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
}

/**
 * Update a schedule's allowed fields (scheduled_at, status, channel).
 * @param {string} scheduleId - UUID of the schedule
 * @param {object} updates - { scheduled_at, status, channel }
 * @returns {Promise<object|null>}
 */
export async function updateSchedule(scheduleId, updates) {
  const allowedFields = ['scheduled_at', 'status', 'channel'];
  const filteredUpdates = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  }

  if (Object.keys(filteredUpdates).length === 0) {
    throw new Error('No valid fields to update');
  }

  const { data: schedule, error } = await supabase
    .from('message_schedules')
    .update(filteredUpdates)
    .eq('id', scheduleId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return schedule;
}

/**
 * Soft-delete a schedule by setting its status to 'cancelled'.
 * @param {string} scheduleId - UUID of the schedule
 * @returns {Promise<object|null>}
 */
export async function deleteSchedule(scheduleId) {
  const { data: schedule, error } = await supabase
    .from('message_schedules')
    .update({ status: 'cancelled' })
    .eq('id', scheduleId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return schedule;
}

/**
 * Bulk update schedules (scheduled_at and status only).
 * @param {Array<string>} scheduleIds - Array of schedule UUIDs
 * @param {object} updates - { scheduled_at, status }
 * @returns {Promise<{updatedCount: number, schedules: Array}>}
 */
export async function bulkUpdateSchedules(scheduleIds, updates) {
  const allowedFields = ['scheduled_at', 'status'];
  const filteredUpdates = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  }

  if (Object.keys(filteredUpdates).length === 0) {
    throw new Error('No valid fields to update');
  }

  // Verify all schedule IDs exist
  const { data: existing, error: checkError } = await supabase
    .from('message_schedules')
    .select('id')
    .in('id', scheduleIds);

  if (checkError) {
    throw checkError;
  }

  if (existing.length !== scheduleIds.length) {
    const existingIds = new Set(existing.map((s) => s.id));
    const missingIds = scheduleIds.filter((id) => !existingIds.has(id));
    throw new Error(`Schedules not found: ${missingIds.join(', ')}`);
  }

  const { data: schedules, error } = await supabase
    .from('message_schedules')
    .update(filteredUpdates)
    .in('id', scheduleIds)
    .select();

  if (error) {
    throw error;
  }

  return { updatedCount: schedules.length, schedules };
}
