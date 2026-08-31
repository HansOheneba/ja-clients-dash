-- Remove Jude Addo; tech@celerey.co is the sole bootstrap advisor.

UPDATE wealth.clients
SET advisor_id = 'a0000000-0000-4000-8000-000000000002'
WHERE advisor_id IN (
  SELECT id FROM wealth.advisors WHERE lower(email) = 'jude.addo@jagroup.com'
)
   OR advisor_id = 'a0000000-0000-4000-8000-000000000001';

DO $$
DECLARE
  jude_auth UUID;
BEGIN
  SELECT auth_user_id INTO jude_auth
  FROM wealth.advisors
  WHERE lower(email) = 'jude.addo@jagroup.com';

  IF jude_auth IS NOT NULL THEN
    DELETE FROM wealth.profiles WHERE id = jude_auth;
  END IF;
END $$;

UPDATE wealth.profiles
SET advisor_id = NULL
WHERE advisor_id IN (
  SELECT id FROM wealth.advisors WHERE lower(email) = 'jude.addo@jagroup.com'
);

DELETE FROM wealth.advisors WHERE lower(email) = 'jude.addo@jagroup.com';

UPDATE wealth.advisors
SET
  is_admin = true,
  is_superadmin = true,
  is_active = true,
  full_name = 'Celerey Platform'
WHERE lower(email) = 'tech@celerey.co';

DO $$
DECLARE
  auth_id UUID;
BEGIN
  SELECT id INTO auth_id FROM auth.users WHERE lower(email) = 'tech@celerey.co' LIMIT 1;

  IF auth_id IS NOT NULL THEN
    UPDATE wealth.advisors
    SET auth_user_id = auth_id
    WHERE lower(email) = 'tech@celerey.co';

    INSERT INTO wealth.profiles (id, role, advisor_id, full_name)
    VALUES (
      auth_id,
      'admin',
      'a0000000-0000-4000-8000-000000000002',
      'Celerey Platform'
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      advisor_id = 'a0000000-0000-4000-8000-000000000002',
      full_name = 'Celerey Platform';
  END IF;
END $$;
