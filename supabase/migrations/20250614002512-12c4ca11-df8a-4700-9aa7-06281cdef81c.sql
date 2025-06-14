
-- Create a table to store Shyft API configurations
CREATE TABLE public.shyft_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_encrypted TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'mainnet-beta',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for security
ALTER TABLE public.shyft_config ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only (you may want to adjust this based on your auth setup)
CREATE POLICY "Admin access to Shyft config" 
  ON public.shyft_config 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Create a table to cache Shyft wallet data
CREATE TABLE public.shyft_wallet_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  wallet_name TEXT,
  raw_data JSONB NOT NULL,
  sol_balance NUMERIC DEFAULT 0,
  total_usd_value NUMERIC DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wallet_address)
);

-- Enable RLS
ALTER TABLE public.shyft_wallet_cache ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (adjust as needed)
CREATE POLICY "Public read access to wallet cache" 
  ON public.shyft_wallet_cache 
  FOR SELECT 
  USING (true);

-- Create policy for service role write access
CREATE POLICY "Service role write access to wallet cache" 
  ON public.shyft_wallet_cache 
  FOR ALL 
  USING (current_setting('role') = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role');

-- Create a table to store detailed token balances from Shyft
CREATE TABLE public.shyft_token_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  token_address TEXT NOT NULL,
  token_symbol TEXT,
  token_name TEXT,
  balance NUMERIC NOT NULL DEFAULT 0,
  ui_amount NUMERIC NOT NULL DEFAULT 0,
  decimals INTEGER NOT NULL DEFAULT 0,
  usd_value NUMERIC DEFAULT 0,
  is_native BOOLEAN DEFAULT false,
  metadata JSONB,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wallet_address, token_address)
);

-- Enable RLS
ALTER TABLE public.shyft_token_balances ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access to token balances" 
  ON public.shyft_token_balances 
  FOR SELECT 
  USING (true);

-- Create policy for service role write access
CREATE POLICY "Service role write access to token balances" 
  ON public.shyft_token_balances 
  FOR ALL 
  USING (current_setting('role') = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role');

-- Create indexes for better performance
CREATE INDEX idx_shyft_wallet_cache_address ON public.shyft_wallet_cache(wallet_address);
CREATE INDEX idx_shyft_wallet_cache_updated ON public.shyft_wallet_cache(last_updated);
CREATE INDEX idx_shyft_token_balances_wallet ON public.shyft_token_balances(wallet_address);
CREATE INDEX idx_shyft_token_balances_updated ON public.shyft_token_balances(last_updated);

-- Create a function to get aggregated wallet data
CREATE OR REPLACE FUNCTION public.get_monitored_wallets_summary()
RETURNS TABLE (
  wallet_address TEXT,
  wallet_name TEXT,
  sol_balance NUMERIC,
  total_usd_value NUMERIC,
  token_count INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    swc.wallet_address,
    swc.wallet_name,
    swc.sol_balance,
    swc.total_usd_value,
    swc.token_count,
    swc.last_updated
  FROM public.shyft_wallet_cache swc
  ORDER BY swc.total_usd_value DESC;
END;
$$;
