-- Phase 5.2: Admin Dashboard UI Improvements
-- Migration: Add new fields for randomization, video controls, and project management

-- Add new fields to presentation_config table
ALTER TABLE presentation_config
ADD COLUMN IF NOT EXISTS randomize_order BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_video_duration INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS allow_video_finish BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN presentation_config.randomize_order IS 'When true, randomizes submission order on each presentation load';
COMMENT ON COLUMN presentation_config.max_video_duration IS 'Maximum allowed video duration in seconds (default: 12)';
COMMENT ON COLUMN presentation_config.allow_video_finish IS 'When true, extends slide duration to match video length if video > transition duration';

-- Note: archived_at field already exists in projects table from initial schema
-- Verify it exists and add if somehow missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'projects'
        AND column_name = 'archived_at'
    ) THEN
        ALTER TABLE projects ADD COLUMN archived_at TIMESTAMP;
        COMMENT ON COLUMN projects.archived_at IS 'Timestamp when project was archived (null if active)';
    END IF;
END $$;

-- Create index on archived_at for faster filtering
CREATE INDEX IF NOT EXISTS idx_projects_archived_at ON projects(archived_at);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
