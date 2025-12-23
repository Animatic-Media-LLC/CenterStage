-- Add background_image_url column to presentation_config table
ALTER TABLE presentation_config
ADD COLUMN background_image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN presentation_config.background_image_url IS 'URL to background image for presentation page (max 5MB)';
