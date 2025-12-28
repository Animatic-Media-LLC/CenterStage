-- Add email field to submissions table
-- This field is optional and only collected when require_email is enabled in presentation_config

ALTER TABLE submissions
ADD COLUMN email VARCHAR(255);

-- Create index for email lookups (optional but helpful for searches)
CREATE INDEX idx_submissions_email ON submissions(email);

-- Add comment to document the column
COMMENT ON COLUMN submissions.email IS 'Optional email field, collected when require_email is enabled in presentation_config';
