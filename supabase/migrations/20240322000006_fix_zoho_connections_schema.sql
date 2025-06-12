-- Fix zoho_connections table schema by dropping and recreating with correct structure
-- This ensures we have a clean schema without conflicting constraints

-- Drop the existing table and recreate with the correct schema
DROP TABLE IF EXISTS public.zoho_connections CASCADE;

-- Create the table with the correct OAuth-based schema
CREATE TABLE IF NOT EXISTS public.zoho_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  refresh_token TEXT, -- Can be null initially until OAuth is completed
  client_id TEXT,
  client_secret TEXT,
  api_domain TEXT DEFAULT 'https://www.zohoapis.in',
  api_token TEXT,
  portal_id TEXT,
  custom_fields JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false, -- Default to false until OAuth is completed
  connected_at TIMESTAMP WITH TIME ZONE,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to ensure one connection per user
CREATE UNIQUE INDEX IF NOT EXISTS zoho_connections_user_id_unique ON public.zoho_connections(user_id);

-- Create index for better performance on user lookups
CREATE INDEX IF NOT EXISTS idx_zoho_connections_user_id ON public.zoho_connections(user_id);

-- Enable RLS
ALTER TABLE public.zoho_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
DROP POLICY IF EXISTS "Users can manage own Zoho connection" ON public.zoho_connections;
CREATE POLICY "Users can manage own Zoho connection" ON public.zoho_connections
  FOR ALL USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.zoho_connections;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_zoho_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_zoho_connections_updated_at ON public.zoho_connections;
CREATE TRIGGER update_zoho_connections_updated_at
  BEFORE UPDATE ON public.zoho_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_zoho_connections_updated_at();
