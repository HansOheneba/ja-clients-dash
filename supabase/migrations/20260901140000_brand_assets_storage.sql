INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand',
  'brand',
  true,
  1048576,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS brand_public_read ON storage.objects;
CREATE POLICY brand_public_read ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'brand');
