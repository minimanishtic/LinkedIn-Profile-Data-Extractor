-- Remove webhook_url column from zoho_connections table as it's no longer needed
-- The OAuth flow will handle authentication directly

ALTER TABLE zoho_connections DROP COLUMN IF EXISTS webhook_url;

-- Update the table to ensure proper OAuth flow
-- Make sure refresh_token can be null initially (before OAuth completion)
ALTER TABLE zoho_connections ALTER COLUMN refresh_token DROP NOT NULL;

-- Ensure is_active defaults to false until OAuth is completed
ALTER TABLE zoho_connections ALTER COLUMN is_active SET DEFAULT false;

-- Add index for better performance on user lookups
CREATE INDEX IF NOT EXISTS idx_zoho_connections_user_id ON zoho_connections(user_id);

-- Enable realtime for the table
alter publication supabase_realtime add table zoho_connections;
