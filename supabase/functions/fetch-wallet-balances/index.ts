
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

interface WalletBalance {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  tokenAddress?: string;
  isLpToken: boolean;
  platform: string;
  lpDetails?: any;
}

// Enhanced token cache with fallbacks
const tokenCache = new Map<string, TokenInfo>();

// Known token mappings as fallback
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
  }
};

async function getTokenInfo(mint: string): Promise<TokenInfo> {
  if (tokenCache.has(mint)) {
    return tokenCache.get(mint)!;
  }

  // Check known tokens first
  if (KNOWN_TOKENS[mint]) {
    tokenCache.set(mint, KNOWN_TOKENS[mint]);
    return KNOWN_TOKENS[mint];
  }

  try {
    console.log(`Fetching token info for: ${mint}`);
    
    // Try Jupiter Token List API first
    const response = await fetch(`https://tokens.jup.ag/token/${mint}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const tokenData = await response.json();
      const tokenInfo: TokenInfo = {
        symbol: tokenData.symbol || 'UNK',
        name: tokenData.name || 'Unknown Token',
        decimals: tokenData.decimals || 9,
        logoURI: tokenData.logoURI
      };
      tokenCache.set(mint, tokenInfo);
      return tokenInfo;
    }

    throw new Error(`Jupiter API failed: ${response.status}`);
  } catch (error) {
    console.warn(`Failed to get token info for ${mint}:`, error);
    
    // Return unknown token info as fallback
    const fallbackInfo: TokenInfo = {
      symbol: 'UNK',
      name: 'Unknown Token',
      decimals: 9
    };
    tokenCache.set(mint, fallbackInfo);
    return fallbackInfo;
  }
}

async function getSolanaPrice(): Promise<number> {
  try {
    console.log('Fetching SOL price from CoinGecko...');
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Aura-Treasury-Dashboard/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
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
    // Return fallback price instead of 0
    return 180; // Reasonable fallback
  }
}

async function getTokenPrice(tokenAddress: string): Promise<number> {
  try {
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${tokenAddress}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Aura-Treasury-Dashboard/1.0'
        }
      }
    );

    if (!response.ok) {
      console.warn(`CoinGecko token price API error for ${tokenAddress}: ${response.status}`);
      return 0;
    }

    const data = await response.json();
    const price = data?.[tokenAddress]?.usd;
    
    if (price && typeof price === 'number') {
      console.log(`Token ${tokenAddress} price: $${price}`);
      return price;
    }

    return 0;
  } catch (error) {
    console.warn(`Failed to get price for token ${tokenAddress}:`, error);
    return 0;
  }
}

async function getWalletBalances(address: string, blockchain: string = 'Solana'): Promise<WalletBalance[]> {
  const balances: WalletBalance[] = [];

  try {
    if (blockchain === 'Solana') {
      console.log(`Fetching Solana balances for: ${address}`);
      
      // Get SOL balance
      const response = await fetch(`https://api.mainnet-beta.solana.com`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address]
        })
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

      // Get SPL token balances
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
        })
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
              const tokenPrice = await getTokenPrice(mint);
              
              balances.push({
                symbol: tokenMeta.symbol,
                name: tokenMeta.name,
                balance: balance,
                usdValue: balance * tokenPrice,
                tokenAddress: mint,
                isLpToken: false,
                platform: 'spl-token'
              });
            }
          } catch (error) {
            console.warn('Error processing token account:', error);
          }
        }
      }

    } else if (blockchain === 'Ethereum') {
      console.log(`Fetching Ethereum balance for: ${address}`);
      
      // Get ETH balance using Infura
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
        })
      });

      const data = await response.json();
      
      if (data.result) {
        const ethBalance = parseInt(data.result, 16) / 1e18;
        
        // Get ETH price
        const ethPriceResponse = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        const ethPriceData = await ethPriceResponse.json();
        const ethPrice = ethPriceData?.ethereum?.usd || 3000;
        
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
    console.log('Fetching AURA market cap...');
    
    // Try multiple approaches for AURA market cap
    const auraTokenMint = '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe';
    
    // Method 1: Try CoinGecko with AURA contract
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${auraTokenMint}&vs_currencies=usd&include_market_cap=true`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Aura-Treasury-Dashboard/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const marketCap = data?.[auraTokenMint]?.usd_market_cap;
        
        if (marketCap && typeof marketCap === 'number' && marketCap > 0) {
          console.log(`AURA market cap from CoinGecko: $${marketCap}`);
          return marketCap;
        }
      }
    } catch (error) {
      console.warn('CoinGecko AURA market cap failed:', error);
    }

    // Method 2: Calculate from token supply
    try {
      const response = await fetch(`https://api.mainnet-beta.solana.com`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenSupply',
          params: [auraTokenMint]
        })
      });

      const data = await response.json();
      
      if (data.result?.value?.uiAmount) {
        const totalSupply = data.result.value.uiAmount;
        
        // Try to get AURA price
        const priceResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${auraTokenMint}&vs_currencies=usd`
        );
        
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          const price = priceData?.[auraTokenMint]?.usd;
          
          if (price && typeof price === 'number' && price > 0) {
            const marketCap = totalSupply * price;
            console.log(`AURA market cap calculated: $${marketCap} (${totalSupply} tokens × $${price})`);
            return marketCap;
          }
        }
      }
    } catch (error) {
      console.warn('Token supply calculation failed:', error);
    }

    console.warn('Unable to fetch AURA market cap, returning 0');
    return 0;
    
  } catch (error) {
    console.error('Error fetching AURA market cap:', error);
    return 0;
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

    // Fetch wallet balances with improved error handling
    const walletPromises = wallets.map(async (wallet) => {
      try {
        console.log(`Processing wallet: ${wallet.name} (${wallet.blockchain})`);
        const balances = await getWalletBalances(wallet.address, wallet.blockchain);
        const totalUsdValue = balances.reduce((sum, balance) => sum + (balance.usdValue || 0), 0);
        
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
          totalMarketCap: 0,
          volatileAssets: 0,
          hardAssets: 607.8665742658975,
          lastUpdated: new Date().toISOString()
        },
        wallets: [],
        solPrice: 0
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
