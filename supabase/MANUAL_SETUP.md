# Manual Supabase setup (JA-Clients-Portal)

**Project:** `mmubhwyxszonhnpyeosy`  
**Do not run this on the HR project (`mrraggagfceaiggerfha`).**

## 1. Run the SQL

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/mmubhwyxszonhnpyeosy/sql/new)
2. Paste the contents of [`manual/001_full_setup.sql`](manual/001_full_setup.sql)
3. Click **Run**
4. Confirm the verify query at the bottom returns at least 1 client and 5 snapshots

## 2. App environment (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://mmubhwyxszonhnpyeosy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your publishable key>
SUPABASE_DB_PASSWORD=<database password from Project Settings → Database>
SUPABASE_SERVICE_ROLE_KEY=<optional, for Storage uploads>
```

## 3. Enable email OTP (Auth)

Dashboard → Authentication → Providers → Email → enable OTP/magic link.

## 4. Link a test user (optional)

After signing up via the app, run in SQL Editor:

```sql
-- Replace with your auth user id from Authentication → Users
INSERT INTO wealth.profiles (id, role, client_id, full_name)
VALUES (
  '<auth-user-uuid>',
  'client',
  'c0000000-0000-4000-8000-000000000001',
  'John Doe'
)
ON CONFLICT (id) DO UPDATE SET client_id = EXCLUDED.client_id, role = EXCLUDED.role;
```

## 5. Test the app

```bash
npm run dev
```

- Generate report: `/clients/dashboard/documents` → **Generate statement**
- Advisor view: `/advisors/dashboard/clients/john-doe` → Documents tab

## 6. Clean up duplicate seed rows (optional)

If you ran the seed SQL more than once, you may have duplicate transactions. Run:

```sql
DELETE FROM wealth.transactions t
USING wealth.transactions t2
WHERE t.id > t2.id
  AND t.client_id = t2.client_id
  AND t.occurred_on = t2.occurred_on
  AND t.amount_usd = t2.amount_usd
  AND t.description = t2.description;
```

## Alternative: Supabase CLI

```bash
npx supabase link --project-ref mmubhwyxszonhnpyeosy
npx supabase db push
```

Uses files in `supabase/migrations/` (same content, split into 3 files).
