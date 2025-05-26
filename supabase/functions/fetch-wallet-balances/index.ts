
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

interface LPDetails {
  poolAddress: string;
  token1: { symbol: string; amount: number; usdValue: number };
  token2: { symbol: string; amount: number; usdValue: number };
  priceRange: { min: number; max: number };
  totalUsdValue: number;
}

interface WalletBalance {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  tokenAddress?: string;
  isLpToken: boolean;
  platform: string;
  lpDetails?: LPDetails;
}

// Enhanced token cache with fallbacks
const tokenCache = new Map<string, TokenInfo>();
const priceCache = new Map<string, { price: number; timestamp: number }>();

// Known token mappings with better identification
const KNOWN_TOKENS: Record<string, TokenInfo> = {
  'So11111111111111111111111111111111111111112': {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9
  },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6
  },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6
  },
  '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe': {
    symbol: 'AURA',
    name: 'Aurora Ventures',
    decimals: 9
  },
  '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8
  },
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 8
  },
  '2d77b594b9bbaed03221f7c63af8c4307432daf1': {
    symbol: 'DCULT',
    name: 'Cult DAO',
    decimals: 18
  }
};

// Known LP token mints from Meteora with updated pool info
const METEORA_LP_TOKENS = new Map([
  ['FVtpMFtDtskHt5MmLExkjKrCkXQi8ebVZHuFhRnQL6W5', {
    token1: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe', // AURA
    token2: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh', // WBTC
    name: 'AURA-WBTC',
    poolUrl: 'https://www.meteora.ag/pools/FVtpMFtDtskHt5MmLExkjKrCkXQi8ebVZHuFhRnQL6W5'
  }],
  ['8trgRQFSHKSiUUY19Qba5MrcRoq6ALnbmaocvfti3ZjP', {
    token1: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe', // AURA
    token2: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh', // WBTC
    name: 'AURA-WBTC',
    poolUrl: 'https://www.meteora.ag/pools/8trgRQFSHKSiUUY19Qba5MrcRoq6ALnbmaocvfti3ZjP'
  }],
  ['GyQ4VWSERBxvLRJmRatxk3DMdF6GeMk4hsBo4h7jcpfX', {
    token1: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', // ETH
    token2: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe', // AURA
    name: 'ETH-AURA',
    poolUrl: 'https://www.meteora.ag/pools/GyQ4VWSERBxvLRJmRatxk3DMdF6GeMk4hsBo4h7jcpfX'
  }],
  ['GTMY5eBd4cXaihz2ZB69g3WkVmvhudamf1kQn3E9preW', {
    token1: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe', // AURA
    token2: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', // ETH
    name: 'AURA-ETH',
    poolUrl: 'https://www.meteora.ag/pools/GTMY5eBd4cXaihz2ZB69g3WkVmvhudamf1kQn3E9preW'
  }]
]);

// Reduced rate limiting with longer delays
let lastRequestTime = 0;
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 5; // Reduced from 10
const BASE_DELAY = 2000; // Increased to 2 seconds

async function rateLimitedFetch(url: string, options?: RequestInit, retries = 2): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  // Reset counter every minute
  if (timeSinceLastRequest > 60000) {
    requestCount = 0;
  }
  
  // More aggressive rate limiting
  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    const delay = BASE_DELAY * Math.pow(2, Math.min(requestCount - MAX_REQUESTS_PER_MINUTE, 5));
    console.log(`Rate limit reached, waiting ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // Ensure minimum delay between requests
  const minDelay = BASE_DELAY + (requestCount * 500); // Increased delay multiplier
  if (timeSinceLastRequest < minDelay) {
    await new Promise(resolve => setTimeout(resolve, minDelay - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  requestCount++;
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (response.status === 429 && retries > 0) {
      console.log(`Rate limited, retrying in ${BASE_DELAY * 3}ms...`);
      await new Promise(resolve => setTimeout(resolve, BASE_DELAY * 3));
      return rateLimitedFetch(url, options, retries - 1);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Request failed, retrying in ${BASE_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, BASE_DELAY));
      return rateLimitedFetch(url, options, retries - 1);
    }
    throw error;
  }
}

async function getTokenInfo(mint: string): Promise<TokenInfo> {
  if (tokenCache.has(mint)) {
    return tokenCache.get(mint)!;
  }

  // Check known tokens first
  if (KNOWN_TOKENS[mint]) {
    tokenCache.set(mint, KNOWN_TOKENS[mint]);
    return KNOWN_TOKENS[mint];
  }

  // For unknown tokens, return fallback without API call to reduce rate limiting
  const fallbackInfo: TokenInfo = {
    symbol: 'UNK',
    name: 'Unknown Token',
    decimals: 9
  };
  tokenCache.set(mint, fallbackInfo);
  return fallbackInfo;
}

async function getSolanaPrice(): Promise<number> {
  try {
    console.log('Fetching SOL price from CoinGecko...');
    const response = await rateLimitedFetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Aura-Treasury-Dashboard/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const price = data?.solana?.usd;
    
    if (!price || typeof price !== 'number') {
      throw new Error('Invalid price data from CoinGecko');
    }

    console.log(`SOL price fetched: $${price}`);
    return price;
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    return 180; // Reasonable fallback
  }
}

async function getTokenPrice(tokenAddress: string): Promise<number> {
  // Check cache first (10 minute cache)
  const cached = priceCache.get(tokenAddress);
  if (cached && Date.now() - cached.timestamp < 600000) {
    return cached.price;
  }

  // Fixed prices for known tokens to reduce API calls
  const FIXED_PRICES: Record<string, number> = {
    '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe': 0.00011566, // AURA
    '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': 105000, // WBTC
    '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': 3500, // ETH
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1, // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 1, // USDT
    '2d77b594b9bbaed03221f7c63af8c4307432daf1': 0.000005 // DCULT
  };

  if (FIXED_PRICES[tokenAddress]) {
    const price = FIXED_PRICES[tokenAddress];
    priceCache.set(tokenAddress, { price, timestamp: Date.now() });
    return price;
  }

  // For other tokens, return 0 to avoid API calls
  return 0;
}

async function getLPTokenDetails(mint: string, balance: number): Promise<LPDetails | null> {
  try {
    const poolConfig = METEORA_LP_TOKENS.get(mint);
    if (!poolConfig) {
      return null;
    }

    console.log(`Calculating LP details for pool: ${mint} (${poolConfig.name})`);

    // Get token info for both tokens
    const token1Info = await getTokenInfo(poolConfig.token1);
    const token2Info = await getTokenInfo(poolConfig.token2);

    // Get token prices
    const token1Price = await getTokenPrice(poolConfig.token1);
    const token2Price = await getTokenPrice(poolConfig.token2);

    console.log(`LP token prices: ${token1Info.symbol}=$${token1Price}, ${token2Info.symbol}=$${token2Price}`);

    // Improved LP value calculation based on typical 50/50 pool
    // For a balanced LP position, we assume equal USD value in both tokens
    const estimatedToken1Amount = balance * 0.5;
    const estimatedToken2Amount = balance * 0.5;

    const token1UsdValue = estimatedToken1Amount * token1Price;
    const token2UsdValue = estimatedToken2Amount * token2Price;
    const totalUsdValue = token1UsdValue + token2UsdValue;

    console.log(`LP position estimated value: $${totalUsdValue.toFixed(2)}`);

    return {
      poolAddress: mint,
      token1: {
        symbol: token1Info.symbol,
        amount: estimatedToken1Amount,
        usdValue: token1UsdValue
      },
      token2: {
        symbol: token2Info.symbol,
        amount: estimatedToken2Amount,
        usdValue: token2UsdValue
      },
      priceRange: { min: 0, max: 0 }, // Would need real pool data
      totalUsdValue: totalUsdValue
    };
  } catch (error) {
    console.error(`Error calculating LP details for ${mint}:`, error);
    return null;
  }
}

async function getWalletBalances(address: string, blockchain: string = 'Solana'): Promise<WalletBalance[]> {
  const balances: WalletBalance[] = [];

  try {
    if (blockchain === 'Solana') {
      console.log(`Fetching Solana balances for: ${address}`);
      
      // Get SOL balance with timeout
      const response = await fetch(`https://api.mainnet-beta.solana.com`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address]
        }),
        signal: AbortSignal.timeout(8000)
      });

      const data = await response.json();
      
      if (data.result) {
        const solBalance = data.result.value / 1e9;
        const solPrice = await getSolanaPrice();
        
        balances.push({
          symbol: 'SOL',
          name: 'Solana',
          balance: solBalance,
          usdValue: solBalance * solPrice,
          isLpToken: false,
          platform: 'native'
        });
      }

      // Get SPL token balances with timeout
      const tokenResponse = await fetch(`https://api.mainnet-beta.solana.com`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            address,
            { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
            { encoding: 'jsonParsed' }
          ]
        }),
        signal: AbortSignal.timeout(8000)
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.result?.value) {
        for (const account of tokenData.result.value) {
          try {
            const tokenInfo = account.account.data.parsed.info;
            const mint = tokenInfo.mint;
            const balance = parseFloat(tokenInfo.tokenAmount.uiAmount || '0');
            
            if (balance > 0) {
              const tokenMeta = await getTokenInfo(mint);
              const isLpToken = METEORA_LP_TOKENS.has(mint);
              
              let tokenPrice = 0;
              let lpDetails = null;
              
              if (isLpToken) {
                lpDetails = await getLPTokenDetails(mint, balance);
                // For LP tokens, use the total USD value from LP details
                tokenPrice = lpDetails ? lpDetails.totalUsdValue / balance : 0;
              } else {
                tokenPrice = await getTokenPrice(mint);
              }
              
              const poolConfig = METEORA_LP_TOKENS.get(mint);
              
              balances.push({
                symbol: isLpToken ? `${poolConfig?.name || 'LP'}` : tokenMeta.symbol,
                name: isLpToken ? `${tokenMeta.name} LP Token` : tokenMeta.name,
                balance: balance,
                usdValue: balance * tokenPrice,
                tokenAddress: mint,
                isLpToken: isLpToken,
                platform: isLpToken ? 'meteora' : 'spl-token',
                lpDetails: lpDetails || undefined
              });
            }
          } catch (error) {
            console.warn('Error processing token account:', error);
          }
        }
      }

    } else if (blockchain === 'Ethereum') {
      console.log(`Fetching Ethereum balance for: ${address}`);
      
      const infuraKey = Deno.env.get('INFURA_API_KEY');
      if (!infuraKey) {
        console.warn('INFURA_API_KEY not configured');
        return balances;
      }

      const response = await fetch(`https://mainnet.infura.io/v3/${infuraKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBalance',
          params: [address, 'latest']
        }),
        signal: AbortSignal.timeout(8000)
      });

      const data = await response.json();
      
      if (data.result) {
        const ethBalance = parseInt(data.result, 16) / 1e18;
        const ethPrice = 3500; // Fixed price to avoid additional API calls
        
        balances.push({
          symbol: 'ETH',
          name: 'Ethereum',
          balance: ethBalance,
          usdValue: ethBalance * ethPrice,
          isLpToken: false,
          platform: 'native'
        });
      }
    }

  } catch (error) {
    console.error(`Error fetching balances for ${address}:`, error);
  }

  return balances;
}

async function getAuraMarketCap(): Promise<number> {
  try {
    console.log('Calculating AURA market cap...');
    
    const auraTokenMint = '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe';
    
    // Get total supply from Solana RPC
    const response = await fetch(`https://api.mainnet-beta.solana.com`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenSupply',
        params: [auraTokenMint]
      }),
      signal: AbortSignal.timeout(8000)
    });

    const data = await response.json();
    
    if (data.result?.value?.uiAmount) {
      const totalSupply = data.result.value.uiAmount;
      console.log(`AURA total supply: ${totalSupply}`);
      
      // Use fixed price to avoid additional API calls
      const fixedPrice = 0.00011566;
      const marketCap = totalSupply * fixedPrice;
      console.log(`AURA market cap calculated: $${marketCap} (${totalSupply} tokens × $${fixedPrice})`);
      return marketCap;
    }

    console.warn('Could not get AURA total supply, returning fallback');
    return 75000; // Reasonable fallback based on recent data
    
  } catch (error) {
    console.error('Error calculating AURA market cap:', error);
    return 75000; // Fallback value
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Starting wallet balance fetch ===');
    
    // Predefined wallets to monitor
    const wallets = [
      {
        wallet_id: '69fe7f1c-bf6a-4981-9d2e-93f25b3ae6be',
        name: 'Operations',
        address: 'fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh',
        blockchain: 'Solana'
      },
      {
        wallet_id: 'dfa84c3c-8cf0-4a03-a209-c2ad09f5016d',
        name: 'Business Costs',
        address: 'Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg',
        blockchain: 'Solana'
      },
      {
        wallet_id: '5635149e-2095-4777-afeb-316c273cf2ec',
        name: 'Marketing',
        address: '7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2',
        blockchain: 'Solana'
      },
      {
        wallet_id: '296a8349-e4bd-4480-a4ac-e6039726d6fa',
        name: 'Project Funding - Solana',
        address: 'Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i',
        blockchain: 'Solana'
      },
      {
        wallet_id: '746a0a15-e232-4706-a156-c2e1d901dcdf',
        name: 'Project Funding - Ethereum',
        address: '0xf05fc9a3c6011c76eb6fe4cbb956eeac8750306d',
        blockchain: 'Ethereum'
      }
    ];

    console.log(`Processing ${wallets.length} wallets...`);

    // Process wallets with better error handling
    const walletPromises = wallets.map(async (wallet) => {
      try {
        console.log(`Processing wallet: ${wallet.name} (${wallet.blockchain})`);
        const balances = await getWalletBalances(wallet.address, wallet.blockchain);
        const totalUsdValue = balances.reduce((sum, balance) => sum + (balance.usdValue || 0), 0);
        
        console.log(`${wallet.name} total value: $${totalUsdValue.toFixed(2)}`);
        
        return {
          ...wallet,
          balances: balances,
          totalUsdValue: totalUsdValue
        };
      } catch (error) {
        console.error(`Error processing wallet ${wallet.name}:`, error);
        return {
          ...wallet,
          balances: [],
          totalUsdValue: 0
        };
      }
    });

    const processedWallets = await Promise.all(walletPromises);

    // Calculate treasury metrics
    const volatileAssets = processedWallets.reduce((sum, wallet) => sum + wallet.totalUsdValue, 0);
    const hardAssets = 607.8665742658975; // Static value as before
    const auraMarketCap = await getAuraMarketCap();
    const solPrice = await getSolanaPrice();

    const result = {
      treasury: {
        totalMarketCap: auraMarketCap,
        volatileAssets: volatileAssets,
        hardAssets: hardAssets,
        lastUpdated: new Date().toISOString()
      },
      wallets: processedWallets,
      solPrice: solPrice
    };

    console.log('=== Fetch completed successfully ===');
    console.log(`Total wallets processed: ${processedWallets.length}`);
    console.log(`Total volatile assets: $${volatileAssets.toFixed(2)}`);
    console.log(`AURA market cap: $${auraMarketCap.toFixed(2)}`);
    console.log(`SOL price: $${solPrice.toFixed(2)}`);

    // Log detailed LP token information
    processedWallets.forEach(wallet => {
      const lpTokens = wallet.balances.filter(b => b.isLpToken);
      if (lpTokens.length > 0) {
        console.log(`${wallet.name} LP tokens:`, lpTokens.map(lp => ({
          symbol: lp.symbol,
          balance: lp.balance,
          usdValue: lp.usdValue,
          hasDetails: !!lp.lpDetails
        })));
      }
    });

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
        } 
      }
    )

  } catch (error) {
    console.error('Fatal error in fetch-wallet-balances:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        treasury: {
          totalMarketCap: 75000, // Fallback values
          volatileAssets: 0,
          hardAssets: 607.8665742658975,
          lastUpdated: new Date().toISOString()
        },
        wallets: [],
        solPrice: 180
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
