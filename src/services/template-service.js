import { supabase } from '../lib/supabase';

/**
 * Fetch all message templates ordered by creation date.
 * @returns {Promise<Array>} Array of template objects
 */
export async function fetchTemplates() {
  try {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching templates:', error.message);
    throw error;
  }
}

/**
 * Create a new message template.
 * @param {string} name - Template name
 * @param {string} content - Template content with {{variable}} placeholders
 * @param {string} channel - 'sms', 'letter', or 'both'
 * @param {Array<string>} variables - List of variable names used in the template
 * @returns {Promise<object>} The created template
 */
export async function createTemplate(name, content, channel, variables) {
  try {
    const { data, error } = await supabase
      .from('message_templates')
      .insert({
        name,
        content,
        channel,
        variables: variables || [],
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating template:', error.message);
    throw error;
  }
}

/**
 * Update an existing message template.
 * @param {string} id - Template UUID
 * @param {object} updates - Fields to update (name, content, channel, variables)
 * @returns {Promise<object>} The updated template
 */
export async function updateTemplate(id, updates) {
  try {
    const allowedFields = ['name', 'content', 'channel', 'variables'];
    const filteredUpdates = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }

    const { data, error } = await supabase
      .from('message_templates')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating template:', error.message);
    throw error;
  }
}

/**
 * Delete a message template by ID.
 * @param {string} id - Template UUID
 * @returns {Promise<void>}
 */
export async function deleteTemplate(id) {
  try {
    const { error } = await supabase
      .from('message_templates')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting template:', error.message);
    throw error;
  }
}
