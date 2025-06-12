-- Add missing columns to zoho_connections table to match code expectations
ALTER TABLE zoho_connections ADD COLUMN IF NOT EXISTS api_domain TEXT DEFAULT 'https://www.zohoapis.in';
ALTER TABLE zoho_connections ADD COLUMN IF NOT EXISTS refresh_token TEXT;
ALTER TABLE zoho_connections ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE zoho_connections ADD COLUMN IF NOT EXISTS client_secret TEXT;
ALTER TABLE zoho_connections ADD COLUMN IF NOT EXISTS connected_at TIMESTAMP DEFAULT NOW();
ALTER TABLE zoho_connections ADD COLUMN IF NOT EXISTS last_used TIMESTAMP;
ALTER TABLE zoho_connections ADD COLUMN IF NOT EXISTS webhook_url TEXT;
ALTER TABLE zoho_connections ADD COLUMN IF NOT EXISTS api_token TEXT;
ALTER TABLE zoho_connections ADD COLUMN IF NOT EXISTS portal_id TEXT;
ALTER TABLE zoho_connections ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- Update the unique constraint to be on user_id only
DROP INDEX IF EXISTS zoho_connections_user_id_unique;
CREATE UNIQUE INDEX IF NOT EXISTS zoho_connections_user_id_unique ON zoho_connections(user_id);


