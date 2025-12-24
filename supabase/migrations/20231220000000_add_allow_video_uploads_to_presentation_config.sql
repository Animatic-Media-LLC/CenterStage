-- Add allow_video_uploads column to presentation_config table
ALTER TABLE presentation_config
ADD COLUMN allow_video_uploads BOOLEAN DEFAULT true NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN presentation_config.allow_video_uploads IS 'Whether to allow video uploads on the public submission form (default: true)';
