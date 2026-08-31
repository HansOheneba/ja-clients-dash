-- Client operations: profile fields, portal accounts, updates, vault documents

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'client_status' AND n.nspname = 'wealth'
  ) THEN
    CREATE TYPE wealth.client_status AS ENUM (
      'onboarding',
      'active',
      'review_due',
      'inactive'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'update_kind' AND n.nspname = 'wealth'
  ) THEN
    CREATE TYPE wealth.update_kind AS ENUM (
      'report',
      'portfolio',
      'transaction',
      'note',
      'invite',
      'general'
    );
  END IF;
END $$;

CREATE SEQUENCE IF NOT EXISTS wealth.client_number_seq START WITH 1 INCREMENT BY 1;

ALTER TABLE wealth.clients
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS status wealth.client_status NOT NULL DEFAULT 'onboarding',
  ADD COLUMN IF NOT EXISTS risk_profile text,
  ADD COLUMN IF NOT EXISTS investment_horizon text,
  ADD COLUMN IF NOT EXISTS primary_objective text,
  ADD COLUMN IF NOT EXISTS marital_status text,
  ADD COLUMN IF NOT EXISTS dependents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estate_status text,
  ADD COLUMN IF NOT EXISTS financial_goals text,
  ADD COLUMN IF NOT EXISTS advisor_notes text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invited_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'clients_auth_user_id_key'
      AND conrelid = 'wealth.clients'::regclass
  ) THEN
    ALTER TABLE wealth.clients
      ADD CONSTRAINT clients_auth_user_id_key UNIQUE (auth_user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'clients_dependents_nonneg'
      AND conrelid = 'wealth.clients'::regclass
  ) THEN
    ALTER TABLE wealth.clients
      ADD CONSTRAINT clients_dependents_nonneg CHECK (dependents >= 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_wealth_clients_status ON wealth.clients (status);
CREATE INDEX IF NOT EXISTS idx_wealth_clients_auth_user ON wealth.clients (auth_user_id);

CREATE OR REPLACE FUNCTION wealth.next_client_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  n bigint;
BEGIN
  n := nextval('wealth.client_number_seq');
  RETURN 'CN' || lpad(n::text, 3, '0');
END;
$$;

CREATE TABLE IF NOT EXISTS wealth.client_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  kind wealth.update_kind NOT NULL DEFAULT 'general',
  title text NOT NULL,
  body text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_wealth_updates_client
  ON wealth.client_updates (client_id, created_at DESC);

CREATE TABLE IF NOT EXISTS wealth.vault_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  storage_path text NOT NULL,
  file_size_bytes bigint,
  mime_type text NOT NULL DEFAULT 'application/pdf',
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wealth_vault_client
  ON wealth.vault_documents (client_id, created_at DESC);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vault',
  'vault',
  false,
  20971520,
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE wealth.client_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth.vault_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS client_updates_select ON wealth.client_updates;
CREATE POLICY client_updates_select ON wealth.client_updates
  FOR SELECT TO authenticated
  USING (
    client_id = wealth.current_client_id()
    OR EXISTS (
      SELECT 1 FROM wealth.clients c
      WHERE c.id = client_id AND c.advisor_id = wealth.current_advisor_id()
    )
    OR EXISTS (
      SELECT 1 FROM wealth.profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS client_updates_advisor_write ON wealth.client_updates;
CREATE POLICY client_updates_advisor_write ON wealth.client_updates
  FOR ALL TO authenticated
  USING (wealth.is_advisor())
  WITH CHECK (wealth.is_advisor());

DROP POLICY IF EXISTS client_updates_client_read ON wealth.client_updates;
CREATE POLICY client_updates_client_read ON wealth.client_updates
  FOR UPDATE TO authenticated
  USING (client_id = wealth.current_client_id())
  WITH CHECK (client_id = wealth.current_client_id());

DROP POLICY IF EXISTS vault_documents_select ON wealth.vault_documents;
CREATE POLICY vault_documents_select ON wealth.vault_documents
  FOR SELECT TO authenticated
  USING (
    client_id = wealth.current_client_id()
    OR EXISTS (
      SELECT 1 FROM wealth.clients c
      WHERE c.id = client_id AND c.advisor_id = wealth.current_advisor_id()
    )
    OR EXISTS (
      SELECT 1 FROM wealth.profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS vault_documents_advisor_write ON wealth.vault_documents;
CREATE POLICY vault_documents_advisor_write ON wealth.vault_documents
  FOR ALL TO authenticated
  USING (wealth.is_advisor())
  WITH CHECK (wealth.is_advisor());

DROP POLICY IF EXISTS vault_storage_advisor_insert ON storage.objects;
CREATE POLICY vault_storage_advisor_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vault' AND wealth.is_advisor());

DROP POLICY IF EXISTS vault_storage_advisor_update ON storage.objects;
CREATE POLICY vault_storage_advisor_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'vault' AND wealth.is_advisor())
  WITH CHECK (bucket_id = 'vault' AND wealth.is_advisor());

DROP POLICY IF EXISTS vault_storage_select ON storage.objects;
CREATE POLICY vault_storage_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'vault'
    AND (
      wealth.is_advisor()
      OR (storage.foldername(name))[1] = wealth.current_client_id()::text
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON wealth.client_updates, wealth.vault_documents
  TO authenticated, service_role;
GRANT ALL ON wealth.client_updates, wealth.vault_documents TO service_role;
GRANT USAGE, SELECT ON SEQUENCE wealth.client_number_seq TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION wealth.next_client_number() TO authenticated, service_role;
REVOKE ALL ON wealth.client_updates FROM anon;
REVOKE ALL ON wealth.vault_documents FROM anon;

UPDATE wealth.clients
SET
  status = 'active',
  phone = COALESCE(phone, '+1 310 555 0100'),
  advisor_notes = COALESCE(
    advisor_notes,
    'Sample wealth client seeded from the investment report template.'
  )
WHERE client_number = 'CN000';

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
