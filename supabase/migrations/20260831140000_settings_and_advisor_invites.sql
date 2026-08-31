-- Advisor portal invites and email notification preference on profiles.

ALTER TABLE wealth.advisors
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;

ALTER TABLE wealth.profiles
  ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN NOT NULL DEFAULT true;
