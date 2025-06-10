import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { ConsolidatedData, WalletData } from '@/types/treasury';

// Environment variable for treasury wallets configuration
const TREASURY_WALLETS_JSON = process.env.NEXT_PUBLIC_TREASURY_WALLETS;

interface TreasuryWallet {
  name: string;
  address: string;
  blockchain: string;
}

// Parse treasury wallets from environment variable
function getTreasuryWallets(): TreasuryWallet[] {
  if (!TREASURY_WALLETS_JSON) {
    console.warn('NEXT_PUBLIC_TREASURY_WALLETS not found, using fallback wallets');
    return [
      {
        name: "Operations",
        address: "fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh",
        blockchain: "Solana"
      },
      {
        name: "Business Costs", 
        address: "Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg",
        blockchain: "Solana"
      },
      {
        name: "Marketing",
        address: "7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2", 
        blockchain: "Solana"
      },
      {
        name: "Project Funding - Solana",
        address: "Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i",
        blockchain: "Solana"
      },
      {
        name: "Project Funding - Ethereum", 
        address: "0xf05fc9a3c6011c76eb6fe4cbb956eeac8750306d",
        blockchain: "Ethereum"
      }
    ];
  }

  try {
    return JSON.parse(TREASURY_WALLETS_JSON);
  } catch (error) {
    console.error('Error parsing NEXT_PUBLIC_TREASURY_WALLETS:', error);
    return [];
  }
}

// Solana connection - FORCE MAINNET ONLY (no devnet)
const premiumRpcUrl = 'https://rpc.ankr.com/solana/6f286d63d463674394f138b2b02265c2cd807147e2c945d6d136246ae8961245';
const fallbackRpcUrl = 'https://api.mainnet-beta.solana.com';
// FORCE MAINNET: Override any env vars that might point to devnet
const solanaRpcUrl = premiumRpcUrl; // Always use premium mainnet, ignore env vars

// Ethereum RPC configuration - Define before console.log
const premiumEthRpcUrl = 'https://rpc.ankr.com/eth/6f286d63d463674394f138b2b02265c2cd807147e2c945d6d136246ae8961245';
const fallbackEthRpcUrl = 'https://eth.llamarpc.com';
const ethRpcUrl = process.env.ETH_PREMIUM_RPC_URL || premiumEthRpcUrl;

console.log(`🚀 TREASURY SYSTEM: FORCED MAINNET ONLY - Solana: ${solanaRpcUrl}`);
console.log(`🔗 TREASURY SYSTEM: FORCED MAINNET ONLY - Ethereum: ${ethRpcUrl}`);
console.log(`⚠️  TREASURY WARNING: All devnet connections are BLOCKED for treasury operations`);

const solanaConnection = new Connection(
  solanaRpcUrl,
  {
    commitment: 'confirmed',
    wsEndpoint: undefined,
  }
);

// Known LP token mint addresses and their associated DEXs
const KNOWN_LP_TOKENS = {
  // Raydium LP tokens (common pairs)
  'Ra8u31dUH31dHJZ7UHZ7qP5L3F3L3F3L3F3L3F3L3F3L': { protocol: 'Raydium', pair: 'SOL/USDC' },
  'RayLP1111111111111111111111111111111111111111': { protocol: 'Raydium', pair: 'RAY/SOL' },
  
  // Orca LP tokens
  'OrcaLP111111111111111111111111111111111111111': { protocol: 'Orca', pair: 'SOL/USDC' },
  'OrcaSOLUSDC111111111111111111111111111111111': { protocol: 'Orca', pair: 'SOL/USDC' },
  
  // Meteora LP tokens
  'METLx42QV8qH8N4LuZhkkJ3nZ8Q3nZ8Q3nZ8Q3nZ8Q': { protocol: 'Meteora', pair: 'SOL/USDC' },
  'METSOLUSDCLPToken11111111111111111111111111': { protocol: 'Meteora', pair: 'SOL/USDC' },
  
  // Saber LP tokens
  'SabLP1111111111111111111111111111111111111111': { protocol: 'Saber', pair: 'USDC/USDT' },
};

// Token mint addresses (Solana)
const TOKEN_MINTS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  AURA: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
};

// Ethereum token addresses
const ETH_TOKEN_ADDRESSES = {
  DCULT: '0x2d77B594B9BBaED03221F7c63Af8C4307432daF1', // DCULT token address (correct)
  USDC: '0xA0b86a33E6417fBCb0b7E8B4E35E2D3a1B2f5A2a', // USDC on Ethereum
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Wrapped ETH
};

// Known Ethereum LP token addresses
const KNOWN_ETH_LP_TOKENS = {
  // Uniswap V2 LP tokens
  '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11': { protocol: 'Uniswap V2', pair: 'DAI/WETH' },
  '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc': { protocol: 'Uniswap V2', pair: 'USDC/WETH' },
  '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852': { protocol: 'Uniswap V2', pair: 'WETH/USDT' },
  
  // SushiSwap LP tokens
  '0x397FF1542f962076d0BFE58eA045FfA2d347ACa0': { protocol: 'SushiSwap', pair: 'WETH/USDC' },
  '0x06da0fd433C1A5d7a4faa01111c044910A184553': { protocol: 'SushiSwap', pair: 'WETH/USDT' },
  
  // Curve LP tokens
  '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490': { protocol: 'Curve', pair: '3Pool' },
  '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7': { protocol: 'Curve', pair: 'USDC/USDT/DAI' },
};

// Token metadata (Solana)
const TOKEN_METADATA = {
  [TOKEN_MINTS.SOL]: { symbol: 'SOL', name: 'Solana', decimals: 9 },
  [TOKEN_MINTS.USDC]: { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  [TOKEN_MINTS.AURA]: { symbol: 'AURA', name: 'AURA Token', decimals: 9 },
};

// Ethereum token metadata
const ETH_TOKEN_METADATA = {
  [ETH_TOKEN_ADDRESSES.DCULT]: { symbol: 'DCULT', name: 'DCULT Token', decimals: 18 },
  [ETH_TOKEN_ADDRESSES.USDC]: { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  [ETH_TOKEN_ADDRESSES.WETH]: { symbol: 'WETH', name: 'Wrapped Ethereum', decimals: 18 },
};

// Fetch current token prices
async function fetchTokenPrices(): Promise<{ sol: number; usdc: number; aura: number; eth: number; cult: number }> {
  // Skip internal API call in server-side context and go directly to external API
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum,cult-dao&vs_currencies=usd');
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      sol: data.solana?.usd || 180,
      usdc: 1.0,
      aura: 0.0002700, // Default AURA price - would need separate API for real price
      eth: data.ethereum?.usd || 3000,
      cult: data['cult-dao']?.usd || 0.000001, // CULT token price
    };
  } catch (error) {
    console.error('Error fetching prices from CoinGecko:', error);
    // Return fallback prices
    return {
      sol: 180,
      usdc: 1.0,
      aura: 0.0002700,
      eth: 3000,
      cult: 0.000001,
    };
  }
}

// Enhanced LP token detection and valuation
async function detectAndValueLPToken(mint: string, balance: number, decimals: number): Promise<{
  isLpToken: boolean;
  metadata: any;
  price: number;
  lpDetails?: any;
}> {
  // Check if it's a known LP token
  if (KNOWN_LP_TOKENS[mint]) {
    const lpInfo = KNOWN_LP_TOKENS[mint];
    
    // Try to fetch real LP position data from DEX APIs
    const lpValue = await fetchLPTokenValue(mint, balance, lpInfo.protocol, lpInfo.pair);
    
    return {
      isLpToken: true,
      metadata: {
        symbol: `${lpInfo.protocol} ${lpInfo.pair} LP`,
        name: `${lpInfo.protocol} ${lpInfo.pair} Liquidity Pool`,
        decimals: decimals
      },
      price: lpValue.pricePerToken,
      lpDetails: lpValue.details
    };
  }
  
  // Enhanced heuristic detection for unknown LP tokens
  const lpHeuristics = await analyzePotentialLPToken(mint, balance, decimals);
  
  if (lpHeuristics.isLikelyLP) {
    return {
      isLpToken: true,
      metadata: {
        symbol: `${lpHeuristics.protocol} LP`,
        name: `${lpHeuristics.protocol} Liquidity Pool Token`,
        decimals: decimals
      },
      price: lpHeuristics.estimatedPrice,
      lpDetails: lpHeuristics.details
    };
  }
  
  return {
    isLpToken: false,
    metadata: {
      symbol: mint.substring(0, 8) + '...',
      name: `Unknown Token (${mint.substring(0, 8)}...)`,
      decimals: decimals
    },
    price: 0
  };
}

// Fetch LP token value from DEX APIs
async function fetchLPTokenValue(mint: string, balance: number, protocol: string, pair: string) {
  try {
    let apiUrl = '';
    
    switch (protocol.toLowerCase()) {
      case 'raydium':
        // Use Raydium API
        apiUrl = `https://api.raydium.io/v2/ammV3/positionInfo/${mint}`;
        break;
      case 'orca':
        // Use Orca API
        apiUrl = `https://api.orca.so/v1/pools/${mint}`;
        break;
      case 'meteora':
        // Use Meteora API
        apiUrl = `https://app.meteora.ag/pools/${mint}`;
        break;
      default:
        // Try Jupiter aggregator for general price data
        apiUrl = `https://price.jup.ag/v4/price?ids=${mint}`;
    }
    
    if (apiUrl) {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        
        // Parse LP position data based on protocol
        if (protocol.toLowerCase() === 'raydium' && data.positionInfo) {
          return {
            pricePerToken: data.positionInfo.price || 0,
            details: {
              poolAddress: mint,
              token1: { 
                symbol: pair.split('/')[0], 
                amount: data.positionInfo.token1Amount || 0,
                usdValue: (data.positionInfo.token1Amount || 0) * (data.positionInfo.token1Price || 0)
              },
              token2: { 
                symbol: pair.split('/')[1], 
                amount: data.positionInfo.token2Amount || 0,
                usdValue: (data.positionInfo.token2Amount || 0) * (data.positionInfo.token2Price || 0)
              },
              priceRange: { 
                min: data.positionInfo.priceRangeMin || 0, 
                max: data.positionInfo.priceRangeMax || 0 
              },
              totalUsdValue: data.positionInfo.totalValue || 0
            }
          };
        } else if (data.data && data.data[mint]) {
          // Jupiter price data
          const price = data.data[mint].price || 0;
          return {
            pricePerToken: price,
            details: {
              poolAddress: mint,
              token1: { symbol: pair.split('/')[0], amount: balance / 2, usdValue: (balance / 2) * price },
              token2: { symbol: pair.split('/')[1], amount: balance / 2, usdValue: (balance / 2) * price },
              priceRange: { min: price * 0.9, max: price * 1.1 },
              totalUsdValue: balance * price
            }
          };
        }
      }
    }
  } catch (error) {
    console.log(`Error fetching LP value for ${mint}:`, error);
  }
  
  // Fallback: estimate LP value based on common LP patterns
  const estimatedPrice = await estimateLPTokenPrice(mint, balance, protocol, pair);
  
  return {
    pricePerToken: estimatedPrice,
    details: {
      poolAddress: mint,
      token1: { symbol: pair.split('/')[0], amount: balance * 0.5, usdValue: (balance * 0.5) * estimatedPrice },
      token2: { symbol: pair.split('/')[1], amount: balance * 0.5, usdValue: (balance * 0.5) * estimatedPrice },
      priceRange: { min: estimatedPrice * 0.9, max: estimatedPrice * 1.1 },
      totalUsdValue: balance * estimatedPrice
    }
  };
}

// Analyze potential LP token using on-chain data
async function analyzePotentialLPToken(mint: string, balance: number, decimals: number) {
  try {
    // Fetch token account info to analyze LP characteristics
    const mintInfo = await solanaConnection.getParsedAccountInfo(new PublicKey(mint));
    
    if (mintInfo.value?.data) {
      const accountData = mintInfo.value.data;
      
      // LP token characteristics:
      // 1. Usually have smaller total supply
      // 2. Decimals are typically 6-9
      // 3. Authority might be null (burned)
      // 4. May have specific program owners
      
      if ('parsed' in accountData) {
        const mintData = accountData.parsed;
        const supply = parseFloat(mintData.info.supply);
        const supplyFormatted = supply / Math.pow(10, decimals);
        
        // Heuristics for LP token detection
        const isLikelyLP = (
          decimals >= 6 && decimals <= 9 &&
          supplyFormatted < 10000000 && // LP tokens usually have smaller supply
          supplyFormatted > 0.001 && // But not too small
          balance < supplyFormatted * 0.1 // User doesn't own too much of total supply
        );
        
        if (isLikelyLP) {
          // Try to determine protocol from mint address patterns
          let protocol = 'Unknown DEX';
          let estimatedPrice = 0;
          
          if (mint.includes('Ray') || mint.startsWith('Ra')) {
            protocol = 'Raydium';
            estimatedPrice = await estimateRaydiumLPPrice(mint, balance);
          } else if (mint.includes('Orc') || mint.includes('orca')) {
            protocol = 'Orca';
            estimatedPrice = await estimateOrcaLPPrice(mint, balance);
          } else if (mint.includes('Met') || mint.includes('meteor')) {
            protocol = 'Meteora';
            estimatedPrice = await estimateMeteoraLPPrice(mint, balance);
          } else {
            // Generic LP price estimation
            estimatedPrice = await estimateGenericLPPrice(mint, balance);
          }
          
          return {
            isLikelyLP: true,
            protocol: protocol,
            estimatedPrice: estimatedPrice,
            details: {
              poolAddress: mint,
              token1: { symbol: 'Token A', amount: balance * 0.5, usdValue: (balance * 0.5) * estimatedPrice },
              token2: { symbol: 'Token B', amount: balance * 0.5, usdValue: (balance * 0.5) * estimatedPrice },
              priceRange: { min: estimatedPrice * 0.8, max: estimatedPrice * 1.2 },
              totalUsdValue: balance * estimatedPrice
            }
          };
        }
      }
    }
  } catch (error) {
    console.log(`Error analyzing potential LP token ${mint}:`, error);
  }
  
  return {
    isLikelyLP: false,
    protocol: 'Unknown',
    estimatedPrice: 0,
    details: null
  };
}

// Estimate LP token prices for different protocols
async function estimateLPTokenPrice(mint: string, balance: number, protocol: string, pair: string): Promise<number> {
  try {
    // For now, use a simplified estimation
    // In production, would integrate with each DEX's specific API
    
    switch (protocol.toLowerCase()) {
      case 'raydium':
        return await estimateRaydiumLPPrice(mint, balance);
      case 'orca':
        return await estimateOrcaLPPrice(mint, balance);
      case 'meteora':
        return await estimateMeteoraLPPrice(mint, balance);
      default:
        return await estimateGenericLPPrice(mint, balance);
    }
  } catch (error) {
    console.log(`Error estimating LP price for ${protocol}:`, error);
    return 0;
  }
}

async function estimateRaydiumLPPrice(mint: string, balance: number): Promise<number> {
  // Try Raydium's API for pool information
  try {
    const response = await fetch('https://api.raydium.io/v2/sdk/liquidity/mainnet.json');
    if (response.ok) {
      const pools = await response.json();
      const pool = pools.official?.find((p: any) => p.lpMint === mint);
      
      if (pool) {
        // Calculate LP token value based on pool reserves
        const baseReserve = parseFloat(pool.baseReserve || '0');
        const quoteReserve = parseFloat(pool.quoteReserve || '0');
        const lpSupply = parseFloat(pool.lpSupply || '1');
        
        if (lpSupply > 0) {
          // Estimate LP token price based on pool TVL
          const poolTVL = (baseReserve * 180) + (quoteReserve * 1); // Rough SOL/USDC estimation
          return poolTVL / lpSupply;
        }
      }
    }
  } catch (error) {
    console.log(`Error fetching Raydium data:`, error);
  }
  
  // Fallback estimation
  return balance > 0 ? Math.random() * 50 + 10 : 0; // Random between $10-60 for demo
}

async function estimateOrcaLPPrice(mint: string, balance: number): Promise<number> {
  // Try Orca's API
  try {
    const response = await fetch('https://api.orca.so/v1/pools');
    if (response.ok) {
      const pools = await response.json();
      const pool = Object.values(pools).find((p: any) => p.lpMint === mint);
      
      if (pool) {
        // Calculate based on Orca pool data
        return parseFloat((pool as any).price || '0');
      }
    }
  } catch (error) {
    console.log(`Error fetching Orca data:`, error);
  }
  
  return balance > 0 ? Math.random() * 40 + 15 : 0; // Random between $15-55 for demo
}

async function estimateMeteoraLPPrice(mint: string, balance: number): Promise<number> {
  // Meteora estimation
  return balance > 0 ? Math.random() * 30 + 20 : 0; // Random between $20-50 for demo
}

async function estimateGenericLPPrice(mint: string, balance: number): Promise<number> {
  // Generic LP price estimation using Jupiter or other aggregators
  try {
    const response = await fetch(`https://price.jup.ag/v4/price?ids=${mint}`);
    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data[mint]) {
        return data.data[mint].price || 0;
      }
    }
  } catch (error) {
    console.log(`Error fetching generic LP price:`, error);
  }
  
  return balance > 0 ? Math.random() * 25 + 5 : 0; // Random between $5-30 for demo
}

// Enhanced Ethereum LP token detection
async function detectEthereumLPToken(address: string, balance: number): Promise<{
  isLpToken: boolean;
  metadata: any;
  price: number;
  lpDetails?: any;
}> {
  // Check if it's a known Ethereum LP token
  if (KNOWN_ETH_LP_TOKENS[address]) {
    const lpInfo = KNOWN_ETH_LP_TOKENS[address];
    
    const lpValue = await fetchEthereumLPValue(address, balance, lpInfo.protocol, lpInfo.pair);
    
    return {
      isLpToken: true,
      metadata: {
        symbol: `${lpInfo.protocol} ${lpInfo.pair} LP`,
        name: `${lpInfo.protocol} ${lpInfo.pair} Liquidity Pool`,
        decimals: 18
      },
      price: lpValue.pricePerToken,
      lpDetails: lpValue.details
    };
  }
  
  return {
    isLpToken: false,
    metadata: {
      symbol: address.substring(0, 8) + '...',
      name: `Unknown Token (${address.substring(0, 8)}...)`,
      decimals: 18
    },
    price: 0
  };
}

// Fetch Ethereum LP token values
async function fetchEthereumLPValue(address: string, balance: number, protocol: string, pair: string) {
  try {
    let apiUrl = '';
    
    switch (protocol.toLowerCase()) {
      case 'uniswap v2':
        apiUrl = `https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2`;
        break;
      case 'sushiswap':
        apiUrl = `https://api.thegraph.com/subgraphs/name/sushiswap/exchange`;
        break;
      case 'curve':
        // Curve has its own API
        apiUrl = `https://api.curve.fi/api/getPools/ethereum/main`;
        break;
    }
    
    // For now, provide estimated values
    // In production, would integrate with proper DEX APIs
    const estimatedPrice = balance > 0 ? Math.random() * 100 + 50 : 0;
    
    return {
      pricePerToken: estimatedPrice,
      details: {
        poolAddress: address,
        token1: { 
          symbol: pair.split('/')[0], 
          amount: balance * 0.5, 
          usdValue: (balance * 0.5) * estimatedPrice 
        },
        token2: { 
          symbol: pair.split('/')[1], 
          amount: balance * 0.5, 
          usdValue: (balance * 0.5) * estimatedPrice 
        },
        priceRange: { min: estimatedPrice * 0.9, max: estimatedPrice * 1.1 },
        totalUsdValue: balance * estimatedPrice
      }
    };
  } catch (error) {
    console.log(`Error fetching Ethereum LP value:`, error);
    return {
      pricePerToken: 0,
      details: null
    };
  }
}

// Fetch Solana wallet balances
async function fetchSolanaWalletBalances(address: string, prices: any) {
  try {
    const publicKey = new PublicKey(address);
    
    // Fetch SOL balance with detailed logging
    console.log(`Fetching SOL balance for ${address}...`);
    const solBalance = await solanaConnection.getBalance(publicKey);
    const solBalanceFormatted = solBalance / LAMPORTS_PER_SOL;
    
    console.log(`SOL balance raw: ${solBalance} lamports`);
    console.log(`SOL balance formatted: ${solBalanceFormatted} SOL`);
    
    const balances = [
      {
        token_symbol: 'SOL',
        token_name: 'Solana',
        balance: solBalanceFormatted,
        usd_value: solBalanceFormatted * prices.sol,
        token_address: TOKEN_MINTS.SOL,
        is_lp_token: false,
        platform: 'Solana',
      }
    ];

    // Fetch SPL token accounts with rate limiting handling
    try {
      console.log(`Fetching SPL token accounts for ${address}...`);
      
      // Add a small delay to help with rate limiting - reduced for premium RPC
      await new Promise(resolve => setTimeout(resolve, 50)); // Reduced delay for premium RPC
      
      const tokenAccounts = await solanaConnection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      console.log(`Found ${tokenAccounts.value.length} token accounts for ${address}`);

      for (const account of tokenAccounts.value) {
        const tokenInfo = account.account.data.parsed.info;
        const mint = tokenInfo.mint;
        const balance = parseFloat(tokenInfo.tokenAmount.uiAmount || '0');
        const decimals = tokenInfo.tokenAmount.decimals;
        
                  if (balance > 0) {
            let metadata, price = 0;
            let isLpToken = false;
            let lpDetails = null;
            
            // Check if we have metadata for this token
            if (TOKEN_METADATA[mint]) {
              metadata = TOKEN_METADATA[mint];
              
              if (mint === TOKEN_MINTS.USDC) {
                price = prices.usdc;
              } else if (mint === TOKEN_MINTS.AURA) {
                price = prices.aura;
              }
            } else {
              // Use enhanced LP token detection with error handling
              try {
                const lpAnalysis = await detectAndValueLPToken(mint, balance, decimals);
                
                if (lpAnalysis.isLpToken) {
                  isLpToken = true;
                  metadata = lpAnalysis.metadata;
                  price = lpAnalysis.price;
                  lpDetails = lpAnalysis.lpDetails;
                  
                  console.log(`Detected LP token: ${metadata.symbol} - Price: $${price.toFixed(4)} - Total Value: $${(balance * price).toFixed(2)}`);
                } else {
                  // Unknown regular token
                  console.log(`Found unknown token: ${mint} with balance ${balance}`);
                  metadata = lpAnalysis.metadata;
                  price = lpAnalysis.price;
                }
              } catch (lpError) {
                console.log(`Error in LP token detection for ${mint}:`, lpError);
                // Fallback to basic unknown token handling
                metadata = {
                  symbol: mint.substring(0, 8) + '...',
                  name: `Unknown Token (${mint.substring(0, 8)}...)`,
                  decimals: decimals
                };
                price = 0;
                isLpToken = false;
                lpDetails = null;
              }
            }
            
            const tokenData = {
              token_symbol: metadata.symbol,
              token_name: metadata.name,
              balance: balance,
              usd_value: balance * price,
              token_address: mint,
              is_lp_token: isLpToken,
              platform: 'Solana',
              ...(lpDetails && { lp_details: lpDetails }), // Add detailed LP info if available
            };
            
            balances.push(tokenData);
            
            const lpLabel = isLpToken ? ' (LP Token)' : '';
            console.log(`Added token: ${metadata.symbol}${lpLabel} - Balance: ${balance} - USD Value: $${(balance * price).toFixed(2)}`);
          }
      }
    } catch (tokenError) {
      console.error(`Error fetching SPL tokens for ${address}:`, tokenError);
      // Continue without failing completely
    }

    return balances;
  } catch (error) {
    console.error(`Error fetching Solana balances for ${address}:`, error);
    return [
      {
        token_symbol: 'SOL',
        token_name: 'Solana',
        balance: 0,
        usd_value: 0,
        token_address: TOKEN_MINTS.SOL,
        is_lp_token: false,
        platform: 'Solana',
      }
    ];
  }
}

// Fetch Ethereum wallet balances
async function fetchEthereumWalletBalances(address: string, prices: any) {
  try {
    const balances = [];
    
    // First, fetch ETH balance
    console.log(`Fetching ETH balance for ${address}...`);
    
    // Try multiple Ethereum balance APIs in order of preference
    const apiEndpoints = [
      // Blockscout API (free, no API key required)
      `https://eth.blockscout.com/api?module=account&action=balance&address=${address}`,
      // Etherscan API without API key (limited requests)
      `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest`,
    ];

    let ethBalance = 0;
    for (const endpoint of apiEndpoints) {
      try {
        console.log(`Trying Ethereum API: ${endpoint}`);
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'AURA-Treasury-Monitor/1.0',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Ethereum API response:`, data);
          
          if (data.status === '1' && data.result) {
            // Convert Wei to ETH
            const balanceWei = BigInt(data.result);
            ethBalance = Number(balanceWei) / Math.pow(10, 18);
            
            console.log(`Successfully fetched Ethereum balance: ${ethBalance} ETH`);
            break;
          }
        }
      } catch (apiError) {
        console.log(`Failed to fetch from ${endpoint}:`, apiError);
        continue;
      }
    }
    
    // Add ETH balance
    balances.push({
      token_symbol: 'ETH',
      token_name: 'Ethereum',
      balance: ethBalance,
      usd_value: ethBalance * prices.eth,
      token_address: '0x0000000000000000000000000000000000000000',
      is_lp_token: false,
      platform: 'Ethereum',
    });

    // Continue with premium RPC comprehensive token detection below...
    
    // Use premium Ethereum RPC for better reliability
    try {
      console.log(`Using premium Ethereum RPC: ${ethRpcUrl}`);
      
      // Get ETH balance via premium RPC
      const ethBalanceResponse = await fetch(ethRpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1,
        }),
      });

      if (ethBalanceResponse.ok) {
        const contentType = ethBalanceResponse.headers.get('content-type');
        if (contentType !== null && contentType.includes('application/json')) {
          const ethData = await ethBalanceResponse.json();
          
          if (ethData.result) {
            // Convert hex balance to ETH (Wei to ETH)
            const balanceWei = parseInt(ethData.result, 16);
            const balanceETH = balanceWei / Math.pow(10, 18);
            
            console.log(`Premium RPC ETH balance: ${balanceETH} ETH`);
            
            // If we didn't get ETH balance from other APIs, add it here
            if (ethBalance === 0) {
              ethBalance = balanceETH;
              balances[0] = {
                token_symbol: 'ETH',
                token_name: 'Ethereum',
                balance: ethBalance,
                usd_value: ethBalance * prices.eth,
                token_address: '0x0000000000000000000000000000000000000000',
                is_lp_token: false,
                platform: 'Ethereum',
              };
            }
          }
        }
      }

      // Now try to get comprehensive ERC-20 token list using premium RPC
      console.log('Fetching ERC-20 token balances via premium RPC...');
      
      // Get transaction logs to find token interactions (simplified approach)
      // This would normally require more complex analysis, but we'll use known token addresses for now
      const knownTokens = [
        { address: ETH_TOKEN_ADDRESSES.DCULT, symbol: 'DCULT', decimals: 18 },
        { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', decimals: 6 },
        { address: '0xA0b86a33E6417fBCb0b7E8B4E35E2D3a1B2f5A2a', symbol: 'USDC', decimals: 6 },
        { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', decimals: 18 },
        // Add more known tokens as needed
      ];

      for (const token of knownTokens) {
        try {
          // Call balanceOf function for each token
          const tokenBalanceResponse = await fetch(ethRpcUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{
                to: token.address,
                data: `0x70a08231000000000000000000000000${address.slice(2)}` // balanceOf(address) function call
              }, 'latest'],
              id: 1,
            }),
          });

          if (tokenBalanceResponse.ok) {
            const tokenData = await tokenBalanceResponse.json();
            
            if (tokenData.result && tokenData.result !== '0x') {
              const balanceHex = tokenData.result;
              const balanceWei = BigInt(balanceHex);
              const balance = Number(balanceWei) / Math.pow(10, token.decimals);
              
                              if (balance > 0) {
                console.log(`Found ${token.symbol} balance: ${balance}`);
                
                let price = 0;
                if (token.symbol === 'DCULT') {
                  price = prices.cult;
                  console.log(`DCULT Price: ${price}, USD Value: ${balance * price}`);
                } else if (token.symbol === 'USDC' || token.symbol === 'USDT') {
                  price = 1;
                }
                
                balances.push({
                  token_symbol: token.symbol,
                  token_name: `${token.symbol} Token`,
                  balance: balance,
                  usd_value: balance * price,
                  token_address: token.address,
                  is_lp_token: false,
                  platform: 'Ethereum',
                });
              }
            }
          }
        } catch (tokenError) {
          console.log(`Error fetching ${token.symbol} balance:`, tokenError);
        }
        
        // Small delay between token calls
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Enhanced Ethereum LP token detection
      console.log('Starting Ethereum LP token detection...');
      
      try {
        // Get transaction logs to find potential LP token transfers
        // This is a simplified approach - in production would use more sophisticated methods
        const potentialLPTokens = [
          '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', // Uniswap V2 DAI/WETH
          '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc', // Uniswap V2 USDC/WETH
          '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852', // Uniswap V2 WETH/USDT
          '0x397FF1542f962076d0BFE58eA045FfA2d347ACa0', // SushiSwap WETH/USDC
          '0x06da0fd433C1A5d7a4faa01111c044910A184553', // SushiSwap WETH/USDT
          '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490', // Curve 3Pool
        ];
        
        for (const lpTokenAddress of potentialLPTokens) {
          try {
            const lpBalanceResponse = await fetch(ethRpcUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_call',
                params: [{
                  to: lpTokenAddress,
                  data: `0x70a08231000000000000000000000000${address.slice(2)}` // balanceOf(address)
                }, 'latest'],
                id: 1,
              }),
            });

            if (lpBalanceResponse.ok) {
              const lpData = await lpBalanceResponse.json();
              
              if (lpData.result && lpData.result !== '0x' && lpData.result !== '0x0') {
                const balanceWei = BigInt(lpData.result);
                const lpBalance = Number(balanceWei) / Math.pow(10, 18); // Most LP tokens use 18 decimals
                
                if (lpBalance > 0) {
                  console.log(`Found Ethereum LP token: ${lpTokenAddress} with balance ${lpBalance}`);
                  
                  // Detect LP token details
                  const lpAnalysis = await detectEthereumLPToken(lpTokenAddress, lpBalance);
                  
                  if (lpAnalysis.isLpToken) {
                    balances.push({
                      token_symbol: lpAnalysis.metadata.symbol,
                      token_name: lpAnalysis.metadata.name,
                      balance: lpBalance,
                      usd_value: lpBalance * lpAnalysis.price,
                      token_address: lpTokenAddress,
                      is_lp_token: true,
                      platform: 'Ethereum',
                      ...(lpAnalysis.lpDetails && { lp_details: lpAnalysis.lpDetails }),
                    });
                    
                    console.log(`Added Ethereum LP: ${lpAnalysis.metadata.symbol} - Value: $${(lpBalance * lpAnalysis.price).toFixed(2)}`);
                  }
                }
              }
            }
          } catch (lpError) {
            console.log(`Error checking LP token ${lpTokenAddress}:`, lpError);
          }
          
          // Small delay between calls
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        
        console.log('Ethereum LP token detection completed.');
      } catch (lpDetectionError) {
        console.log('Error in Ethereum LP token detection:', lpDetectionError);
      }

    } catch (rpcError) {
      console.log('Premium RPC call failed:', rpcError);
    }
    
    // Return the balances array which includes ETH and any detected tokens (like DCULT)
    return balances;
  } catch (error) {
    console.error(`Error fetching Ethereum balances for ${address}:`, error);
    return [
      {
        token_symbol: 'ETH',
        token_name: 'Ethereum',
        balance: 0,
        usd_value: 0,
        token_address: '0x0000000000000000000000000000000000000000',
        is_lp_token: false,
        platform: 'Ethereum',
      }
    ];
  }
}

// Main function to fetch all treasury data
export async function getRealTreasuryData(): Promise<ConsolidatedData> {
  try {
    console.log('Starting treasury data fetch...');
    
    const treasuryWallets = getTreasuryWallets();
    console.log(`Found ${treasuryWallets.length} treasury wallets to process`);
    
    const prices = await fetchTokenPrices();
    console.log('Fetched token prices:', prices);
    
    const walletDataPromises = treasuryWallets.map(async (wallet, index): Promise<WalletData> => {
      console.log(`Processing wallet ${index + 1}: ${wallet.name} (${wallet.blockchain}) - ${wallet.address}`);
      
      // Add staggered delay to prevent rate limiting - reduced for premium RPC
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, 100 * index)); // Reduced delay for premium RPC
      }
      
      // Explicitly typed as array of balance objects
      let balances: Array<{
        token_symbol: string;
        token_name: string;
        balance: number;
        usd_value: number;
        token_address: string;
        is_lp_token: boolean;
        platform: string;
      }> = [];
      
      try {
        if (wallet.blockchain === 'Solana') {
          balances = await fetchSolanaWalletBalances(wallet.address, prices);
        } else if (wallet.blockchain === 'Ethereum') {
          balances = await fetchEthereumWalletBalances(wallet.address, prices);
        } else {
          console.warn(`Unsupported blockchain: ${wallet.blockchain}`);
          balances = [];
        }
      } catch (error) {
        console.error(`Error fetching balances for wallet ${wallet.name}:`, error);
        balances = [];
      }
      
      const totalUsdValue = balances.reduce((sum, balance) => sum + balance.usd_value, 0);
      console.log(`Wallet ${wallet.name} total value: $${totalUsdValue.toFixed(2)}`);
      
      return {
        wallet_id: (index + 1).toString(),
        name: wallet.name,
        address: wallet.address,
        blockchain: wallet.blockchain,
        balances: balances,
        totalUsdValue: totalUsdValue,
      };
    });

    const wallets = await Promise.all(walletDataPromises);
    
    // Calculate treasury metrics
    const totalMarketCap = wallets
      .flatMap(wallet => wallet.balances)
      .reduce((sum, balance) => sum + balance.usd_value, 0);

    const volatileAssets = wallets
      .flatMap(wallet => wallet.balances)
      .filter(balance => !['USDC', 'USDT'].includes(balance.token_symbol))
      .reduce((sum, balance) => sum + balance.usd_value, 0);

    const hardAssets = wallets
      .flatMap(wallet => wallet.balances)
      .filter(balance => ['USDC', 'USDT'].includes(balance.token_symbol))
      .reduce((sum, balance) => sum + balance.usd_value, 0);

    console.log(`Treasury summary: Total: $${totalMarketCap.toFixed(2)}, Volatile: $${volatileAssets.toFixed(2)}, Hard: $${hardAssets.toFixed(2)}`);

    return {
      treasury: {
        totalMarketCap,
        volatileAssets,
        hardAssets,
        lastUpdated: new Date().toISOString(),
      },
      wallets: wallets,
      solPrice: prices.sol,
    };
  } catch (error) {
    console.error('Error fetching real treasury data:', error);
    throw error;
  }
}

// Fetch overview data
export async function getRealTreasuryOverview() {
  try {
    const data = await getRealTreasuryData();
    
    return {
      totalValue: data.treasury.totalMarketCap,
      liquidAssets: data.treasury.hardAssets + 
        data.wallets
          .flatMap(w => w.balances)
          .filter(b => b.is_lp_token || ['SOL', 'ETH', 'AURA'].includes(b.token_symbol))
          .reduce((sum, b) => sum + b.usd_value, 0),
      fundingGoalProgress: 0, // Will be calculated in component
      lastUpdated: data.treasury.lastUpdated,
    };
  } catch (error) {
    console.error('Error fetching real treasury overview:', error);
    throw error;
  }
} 