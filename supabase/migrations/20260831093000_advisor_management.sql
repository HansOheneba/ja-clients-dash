-- Advisor management: admins create advisors, deactivate them, and reassign clients.
-- Advisor rows drive role assignment at sign in (see lib/auth/ensure-profile.ts),
-- so creating an advisor is a row insert rather than a separate invite flow.

ALTER TABLE wealth.advisors
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Bootstrap the platform account so there is an admin who can create the rest.
UPDATE wealth.advisors SET is_admin = true WHERE lower(email) = 'tech@celerey.co';

-- Statement heading follows the JA Wealth report template.
UPDATE wealth.disclaimers
   SET title = 'Important Notice Regarding Valuations & Performance'
 WHERE is_active = true;

-- Server code reaches the database through a direct pool, so this policy mirrors
-- the application guards rather than replacing them.
DROP POLICY IF EXISTS advisors_admin_write ON wealth.advisors;
CREATE POLICY advisors_admin_write ON wealth.advisors
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wealth.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wealth.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );
