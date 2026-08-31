-- Client numbers must not be sequential, so they do not reveal book size.
-- The app generates JA-******** from the client UUID. This replaces the
-- leftover sequence helper used by older inserts.

CREATE OR REPLACE FUNCTION wealth.next_client_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text;
  i int;
  idx int;
BEGIN
  LOOP
    result := 'JA-';
    FOR i IN 1..8 LOOP
      idx := 1 + floor(random() * 32)::int;
      result := result || substr(alphabet, idx, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM wealth.clients WHERE client_number = result
    );
  END LOOP;
  RETURN result;
END;
$$;
