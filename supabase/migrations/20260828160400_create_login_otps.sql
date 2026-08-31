-- App-managed login OTP codes (sent via Resend, not Supabase email)

CREATE TABLE IF NOT EXISTS wealth.login_otps (
  email TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS login_otps_expires_at_idx ON wealth.login_otps (expires_at);

-- Only server (postgres role) touches this table; no RLS needed for app-only access
