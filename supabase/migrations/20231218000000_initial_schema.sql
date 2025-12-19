-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'super_admin');
CREATE TYPE project_status AS ENUM ('active', 'archived', 'deleted');
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'declined', 'deleted', 'archived');
CREATE TYPE display_mode AS ENUM ('once', 'repeat');
CREATE TYPE animation_style AS ENUM ('fade', 'slide', 'zoom');

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'admin' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- TEAMS TABLE (Optional)
-- =====================================================
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    qr_code_url TEXT,
    status project_status DEFAULT 'active' NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster queries
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);

-- =====================================================
-- PRESENTATION_CONFIG TABLE
-- =====================================================
CREATE TABLE presentation_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID UNIQUE REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    font_family VARCHAR(100) DEFAULT 'Inter' NOT NULL,
    font_size INTEGER DEFAULT 24 NOT NULL CHECK (font_size >= 16 AND font_size <= 72),
    text_color VARCHAR(7) DEFAULT '#FFFFFF' NOT NULL,
    outline_color VARCHAR(7) DEFAULT '#000000' NOT NULL,
    background_color VARCHAR(7) DEFAULT '#1a1a1a' NOT NULL,
    transition_duration INTEGER DEFAULT 5 NOT NULL CHECK (transition_duration >= 1 AND transition_duration <= 30),
    animation_style animation_style DEFAULT 'fade' NOT NULL,
    layout_template VARCHAR(50) DEFAULT 'standard' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on project_id
CREATE INDEX idx_presentation_config_project_id ON presentation_config(project_id);

-- =====================================================
-- SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    social_handle VARCHAR(30),
    comment TEXT NOT NULL CHECK (char_length(comment) >= 10 AND char_length(comment) <= 500),
    photo_url TEXT,
    video_url TEXT,
    status submission_status DEFAULT 'pending' NOT NULL,
    display_mode display_mode DEFAULT 'repeat' NOT NULL,
    custom_timing INTEGER CHECK (custom_timing IS NULL OR (custom_timing >= 1 AND custom_timing <= 30)),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX idx_submissions_project_id ON submissions(project_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_submissions_project_status ON submissions(project_id, status);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presentation_config_updated_at BEFORE UPDATE ON presentation_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES
-- Only authenticated users can view users
CREATE POLICY "Authenticated users can view all users"
    ON users FOR SELECT
    TO authenticated
    USING (true);

-- TEAMS TABLE POLICIES
CREATE POLICY "Authenticated users can view all teams"
    ON teams FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create teams"
    ON teams FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- PROJECTS TABLE POLICIES
-- Authenticated users can view all projects
CREATE POLICY "Authenticated users can view all projects"
    ON projects FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users can create projects
CREATE POLICY "Authenticated users can create projects"
    ON projects FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated users can update all projects
CREATE POLICY "Authenticated users can update all projects"
    ON projects FOR UPDATE
    TO authenticated
    USING (true);

-- Authenticated users can delete projects
CREATE POLICY "Authenticated users can delete projects"
    ON projects FOR DELETE
    TO authenticated
    USING (true);

-- PRESENTATION_CONFIG TABLE POLICIES
CREATE POLICY "Authenticated users can view all presentation configs"
    ON presentation_config FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create presentation configs"
    ON presentation_config FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update presentation configs"
    ON presentation_config FOR UPDATE
    TO authenticated
    USING (true);

-- SUBMISSIONS TABLE POLICIES
-- Public can insert submissions (for the public form)
CREATE POLICY "Public can insert submissions"
    ON submissions FOR INSERT
    TO anon
    WITH CHECK (true);

-- Authenticated users can view all submissions
CREATE POLICY "Authenticated users can view all submissions"
    ON submissions FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users can update submissions
CREATE POLICY "Authenticated users can update submissions"
    ON submissions FOR UPDATE
    TO authenticated
    USING (true);

-- Authenticated users can delete submissions
CREATE POLICY "Authenticated users can delete submissions"
    ON submissions FOR DELETE
    TO authenticated
    USING (true);

-- Public can view approved submissions (for the presentation page)
CREATE POLICY "Public can view approved submissions"
    ON submissions FOR SELECT
    TO anon
    USING (status = 'approved');

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create storage bucket for submission photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', true);

-- Create storage bucket for QR codes
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-codes', 'qr-codes', true);

-- Storage policies for submissions bucket
CREATE POLICY "Public can upload submission photos"
    ON storage.objects FOR INSERT
    TO anon
    WITH CHECK (bucket_id = 'submissions');

CREATE POLICY "Public can view submission photos"
    ON storage.objects FOR SELECT
    TO anon
    USING (bucket_id = 'submissions');

CREATE POLICY "Authenticated users can delete submission photos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'submissions');

-- Storage policies for QR codes bucket
CREATE POLICY "Authenticated users can upload QR codes"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'qr-codes');

CREATE POLICY "Public can view QR codes"
    ON storage.objects FOR SELECT
    TO anon
    USING (bucket_id = 'qr-codes');

CREATE POLICY "Authenticated users can delete QR codes"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'qr-codes');
