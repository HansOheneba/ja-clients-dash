-- Provision tech@celerey.co as platform wealth manager (advisor)
-- Reassign John Doe sample client to this advisor for dashboard access

INSERT INTO wealth.advisors (id, full_name, email)
VALUES (
  'a0000000-0000-4000-8000-000000000002',
  'Celerey Platform',
  'tech@celerey.co'
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name;

UPDATE wealth.clients
SET advisor_id = 'a0000000-0000-4000-8000-000000000002'
WHERE client_number = 'CN000';

-- If auth user already exists from a prior OTP login, link profile now
DO $$
DECLARE
  auth_id UUID;
BEGIN
  SELECT id INTO auth_id FROM auth.users WHERE lower(email) = 'tech@celerey.co' LIMIT 1;

  IF auth_id IS NOT NULL THEN
    UPDATE wealth.advisors
    SET auth_user_id = auth_id
    WHERE email = 'tech@celerey.co';

    INSERT INTO wealth.profiles (id, role, advisor_id, full_name)
    VALUES (
      auth_id,
      'advisor',
      'a0000000-0000-4000-8000-000000000002',
      'Celerey Platform'
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'advisor',
      advisor_id = 'a0000000-0000-4000-8000-000000000002',
      full_name = 'Celerey Platform';
  END IF;
END $$;
