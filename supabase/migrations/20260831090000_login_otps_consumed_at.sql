-- Track consumption instead of deleting on success, so a resubmitted verify form
-- (browser retry, double click, router replaying the server action) can replay the
-- same code within a short grace window instead of reporting it invalid.
-- A consumed row also skips the resend cooldown, since requesting a new code
-- after a completed sign-in is legitimate.

ALTER TABLE wealth.login_otps
  ADD COLUMN IF NOT EXISTS consumed_at TIMESTAMPTZ;
