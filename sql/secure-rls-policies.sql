-- Secure RLS Policies with Supabase Auth
-- Run this SQL in your Supabase SQL Editor to secure your database

-- First, drop the existing public write policies (DANGEROUS!)
DROP POLICY IF EXISTS "Public write access for projects" ON projects;
DROP POLICY IF EXISTS "Public write access for services" ON services;
DROP POLICY IF EXISTS "Public write access for about_content" ON about_content;

-- Keep public read access (anyone can view your portfolio)
-- These policies already exist, but included here for completeness

-- Projects: Public can read, only authenticated users can write
CREATE POLICY "Authenticated users can insert projects"
    ON projects FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
    ON projects FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete projects"
    ON projects FOR DELETE
    TO authenticated
    USING (true);

-- Services: Public can read, only authenticated users can write
CREATE POLICY "Authenticated users can insert services"
    ON services FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update services"
    ON services FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete services"
    ON services FOR DELETE
    TO authenticated
    USING (true);

-- About Content: Public can read, only authenticated users can write
CREATE POLICY "Authenticated users can insert about_content"
    ON about_content FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update about_content"
    ON about_content FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete about_content"
    ON about_content FOR DELETE
    TO authenticated
    USING (true);

-- Optional: Create a specific admin role for even tighter security
-- Uncomment and modify if you want only specific users to have write access

/*
-- Create admin_users table to track who can edit
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read admin_users to check if they're admin
CREATE POLICY "Authenticated users can read admin_users"
    ON admin_users FOR SELECT
    TO authenticated
    USING (true);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update policies to only allow admins (replace the authenticated policies above)
-- Example for projects:
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
CREATE POLICY "Admin users can insert projects"
    ON projects FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

-- Repeat for all other tables and operations
*/

-- Storage Policies for profile photos (if using Supabase Storage)
-- Make sure your storage bucket 'portfolio-assets' exists

-- Allow public to read files
CREATE POLICY "Public can read portfolio assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'portfolio-assets');

-- Only authenticated users can upload
CREATE POLICY "Authenticated users can upload portfolio assets"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'portfolio-assets');

-- Only authenticated users can update their uploads
CREATE POLICY "Authenticated users can update portfolio assets"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'portfolio-assets');

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete portfolio assets"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'portfolio-assets');
