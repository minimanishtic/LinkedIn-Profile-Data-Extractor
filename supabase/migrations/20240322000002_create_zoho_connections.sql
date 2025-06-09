-- Create zoho_connections table to store user-specific Zoho credentials
CREATE TABLE IF NOT EXISTS public.zoho_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  webhook_url TEXT NOT NULL,
  api_token TEXT,
  portal_id TEXT,
  custom_fields JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to ensure one connection per user
CREATE UNIQUE INDEX IF NOT EXISTS zoho_connections_user_id_unique ON public.zoho_connections(user_id);

-- Enable realtime
alter publication supabase_realtime add table zoho_connections;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
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
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
