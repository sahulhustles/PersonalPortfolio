-- Migration: Add profile_photo_url column to about_content table
-- Run this SQL in your Supabase SQL Editor if you already have the about_content table

-- Add profile_photo_url column if it doesn't exist
ALTER TABLE about_content 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- If you need to update existing records (optional):
-- UPDATE about_content SET profile_photo_url = '' WHERE profile_photo_url IS NULL;

