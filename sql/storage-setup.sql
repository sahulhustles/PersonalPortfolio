-- Supabase Storage Setup for Profile Photos
-- Run this SQL in your Supabase SQL Editor after creating the storage bucket

-- STEP 1: Create storage bucket manually
-- Go to Supabase Dashboard → Storage → Create Bucket
-- Bucket name: portfolio-assets
-- Public bucket: Yes (to allow public access to images)
-- Click "Create bucket"

-- STEP 2: Set up the storage policies (run this SQL after creating the bucket)

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Public read access for portfolio-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public insert access for portfolio-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for portfolio-assets" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public read access for portfolio-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-assets');

-- Allow public insert (for uploading photos)
CREATE POLICY "Public insert access for portfolio-assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio-assets');

-- Allow public delete (for removing photos)
CREATE POLICY "Public delete access for portfolio-assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio-assets');

-- Note: For production, you should restrict these policies to authenticated users only

