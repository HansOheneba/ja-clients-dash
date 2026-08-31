-- Platform superadmin: can manage other admins. tech@celerey.co is the bootstrap owner.
ALTER TABLE wealth.advisors
  ADD COLUMN IF NOT EXISTS is_superadmin boolean NOT NULL DEFAULT false;

UPDATE wealth.advisors
SET is_superadmin = true, is_admin = true, is_active = true
WHERE lower(email) = 'tech@celerey.co';

COMMENT ON COLUMN wealth.advisors.is_superadmin IS
  'Platform owner. Can promote/demote admins and cannot be deactivated by regular admins.';
