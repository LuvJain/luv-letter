-- Migration: Create scheduling tables for message schedules, templates, and delivery metadata
-- Description: Establishes the persistent data layer for all scheduling operations

-- =============================================================================
-- 1. Create enum types
-- =============================================================================

-- Status enum for schedule lifecycle
CREATE TYPE schedule_status AS ENUM (
  'pending',
  'scheduled',
  'sent',
  'failed',
  'cancelled'
);

-- Channel enum for delivery method
CREATE TYPE delivery_channel AS ENUM (
  'sms',
  'letter',
  'both'
);

-- =============================================================================
-- 2. Create tables
-- =============================================================================

-- Message templates: reusable content with personalization variables
CREATE TABLE message_templates (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  content       text        NOT NULL,
  channel       delivery_channel NOT NULL,
  variables     jsonb       DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Message schedules: when and how to send a template
CREATE TABLE message_schedules (
  id            uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   uuid            NOT NULL REFERENCES message_templates(id) ON DELETE CASCADE,
  scheduled_at  timestamptz     NOT NULL,
  status        schedule_status NOT NULL DEFAULT 'pending',
  channel       delivery_channel NOT NULL,
  created_at    timestamptz     NOT NULL DEFAULT now(),
  updated_at    timestamptz     NOT NULL DEFAULT now(),
  created_by    text            NOT NULL
);

-- Schedule recipients: per-recipient delivery tracking
CREATE TABLE schedule_recipients (
  id                  uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id         uuid            NOT NULL REFERENCES message_schedules(id) ON DELETE CASCADE,
  recipient_id        text            NOT NULL,
  phone_number        text,
  address             jsonb,
  personalization_data jsonb          DEFAULT '{}',
  delivery_status     schedule_status NOT NULL DEFAULT 'pending',
  delivered_at        timestamptz,
  created_at          timestamptz     NOT NULL DEFAULT now()
);

-- =============================================================================
-- 3. Create indexes
-- =============================================================================

-- Composite index for efficient pending-message queries (find schedules due for sending)
CREATE INDEX idx_message_schedules_scheduled_at_status
  ON message_schedules (scheduled_at, status);

-- Composite index for bulk status updates per schedule
CREATE INDEX idx_schedule_recipients_schedule_id_delivery_status
  ON schedule_recipients (schedule_id, delivery_status);

-- =============================================================================
-- 4. Auto-update updated_at trigger
-- =============================================================================

-- Function to auto-update the updated_at column on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to message_templates
CREATE TRIGGER set_message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to message_schedules
CREATE TRIGGER set_message_schedules_updated_at
  BEFORE UPDATE ON message_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
