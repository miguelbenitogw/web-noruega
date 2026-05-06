-- Bucket for candidate CV uploads (public read so email links work)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-uploads', 'cv-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous uploads (INSERT)
CREATE POLICY "Anyone can upload a CV"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'cv-uploads');

-- Allow public reads (SELECT) so the download link in emails works
CREATE POLICY "Anyone can read CVs"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'cv-uploads');
