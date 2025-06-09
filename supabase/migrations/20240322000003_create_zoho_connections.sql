CREATE TABLE IF NOT EXISTS zoho_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  refresh_token TEXT,
  client_id TEXT,
  client_secret TEXT,
  api_domain TEXT DEFAULT 'https://www.zohoapis.in',
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP,
  UNIQUE(user_id)
);

ALTER TABLE zoho_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own Zoho connection" ON zoho_connections;
CREATE POLICY "Users can manage own Zoho connection" ON zoho_connections
  FOR ALL USING (auth.uid() = user_id);

alter publication supabase_realtime add table zoho_connections;