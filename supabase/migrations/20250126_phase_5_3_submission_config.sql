-- Phase 5.3: Final Admin Cleanup
-- Migration: Add require_email field to presentation_config

-- Add require_email field to presentation_config table
ALTER TABLE presentation_config
ADD COLUMN IF NOT EXISTS require_email BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN presentation_config.require_email IS 'When true, email field is shown and required on submission form. Email addresses are collected but not displayed publicly.';
