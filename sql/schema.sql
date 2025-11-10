-- Supabase Database Schema for Portfolio Website
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tech_stack TEXT[] DEFAULT '{}',
    live_url TEXT,
    code_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About Content Table
CREATE TABLE IF NOT EXISTS about_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey TEXT,
    profile_photo_url TEXT,
    stats JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    skills JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (anon users can read)
CREATE POLICY "Public read access for projects"
    ON projects FOR SELECT
    USING (true);

CREATE POLICY "Public read access for services"
    ON services FOR SELECT
    USING (true);

CREATE POLICY "Public read access for about_content"
    ON about_content FOR SELECT
    USING (true);

-- Note: For insert/update/delete operations, you'll need to:
-- 1. Either create authenticated policies
-- 2. Or use service role key in admin panel (not recommended for production)
-- 3. Or implement server-side API endpoints

-- For now, we'll allow public write access (for admin panel)
-- WARNING: This allows anyone to modify data. For production, use proper authentication.
CREATE POLICY "Public write access for projects"
    ON projects FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public write access for services"
    ON services FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public write access for about_content"
    ON about_content FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_content_updated_at BEFORE UPDATE ON about_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

