INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('reports', 'reports', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY reports_storage_advisor_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'reports' AND wealth.is_advisor());

CREATE POLICY reports_storage_advisor_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'reports' AND wealth.is_advisor())
  WITH CHECK (bucket_id = 'reports' AND wealth.is_advisor());

CREATE POLICY reports_storage_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'reports'
    AND (
      wealth.is_advisor()
      OR (storage.foldername(name))[1] = wealth.current_client_id()::text
    )
  );
