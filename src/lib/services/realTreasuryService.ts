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

// Solana connection - Use premium RPC for better rate limits
const premiumRpcUrl = 'https://rpc.ankr.com/solana/6f286d63d463674394f138b2b02265c2cd807147e2c945d6d136246ae8961245';
const fallbackRpcUrl = 'https://api.mainnet-beta.solana.com';
const solanaRpcUrl = process.env.SOLANA_PREMIUM_RPC_URL || premiumRpcUrl; // Use premium by default

// Ethereum RPC configuration - Define before console.log
const premiumEthRpcUrl = 'https://rpc.ankr.com/eth/6f286d63d463674394f138b2b02265c2cd807147e2c945d6d136246ae8961245';
const fallbackEthRpcUrl = 'https://eth.llamarpc.com';
const ethRpcUrl = process.env.ETH_PREMIUM_RPC_URL || premiumEthRpcUrl;

console.log(`🚀 TREASURY SYSTEM: Using Solana MAINNET - ${solanaRpcUrl}`);
console.log(`🔗 TREASURY SYSTEM: Using Ethereum MAINNET - ${ethRpcUrl}`);

const solanaConnection = new Connection(
  solanaRpcUrl,
  {
    commitment: 'confirmed',
    wsEndpoint: undefined,
  }
);

// Token mint addresses (Solana)
const TOKEN_MINTS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  AURA: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
};

// Ethereum token addresses
const ETH_TOKEN_ADDRESSES = {
  DCULT: '0xf0f9d895aca5c8678f706fb8216fa22957685a13', // DCULT token address
  USDC: '0xA0b86a33E6417fBCb0b7E8B4E35E2D3a1B2f5A2a', // USDC on Ethereum
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Wrapped ETH
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
            let lpPairInfo = null;
            
            // Check if we have metadata for this token
            if (TOKEN_METADATA[mint]) {
              metadata = TOKEN_METADATA[mint];
              
              if (mint === TOKEN_MINTS.USDC) {
                price = prices.usdc;
              } else if (mint === TOKEN_MINTS.AURA) {
                price = prices.aura;
              }
            } else {
              // Check if this might be an LP token by analyzing token accounts
              // Common LP token patterns: very long names, contain protocol names
              const accountData = account.account.data.parsed.info;
              
              // Basic LP detection heuristics
              if (decimals <= 9 && balance < 1000000) { // LP tokens usually have smaller supply
                console.log(`Potential LP token detected: ${mint}`);
                
                // Try to identify the LP protocol
                let protocol = 'Unknown';
                if (mint.startsWith('Ra') || mint.includes('ray')) {
                  protocol = 'Raydium';
                } else if (mint.includes('Orc') || mint.includes('orc')) {
                  protocol = 'Orca';
                } else if (mint.includes('Sab') || mint.includes('sab')) {
                  protocol = 'Saber';
                }
                
                isLpToken = true;
                lpPairInfo = {
                  protocol: protocol,
                  pair: 'Unknown/Unknown', // Would need additional API calls to determine
                  type: 'AMM LP'
                };
                
                metadata = {
                  symbol: `${protocol} LP`,
                  name: `${protocol} Liquidity Pool Token`,
                  decimals: decimals
                };
                
                // Estimate LP value (simplified - would need pool data for accuracy)
                price = 0; // Set to 0 for now, would need DEX API integration
              } else {
                // Unknown regular token
                console.log(`Found unknown token: ${mint} with balance ${balance}`);
                metadata = {
                  symbol: mint.substring(0, 8) + '...',
                  name: `Unknown Token (${mint.substring(0, 8)}...)`,
                  decimals: decimals
                };
                price = 0; // No price data for unknown tokens
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
              ...(lpPairInfo && { lp_info: lpPairInfo }), // Add LP info if available
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

      // TODO: Add Ethereum LP token detection here
      // This would involve detecting Uniswap V2/V3, SushiSwap, Curve LP tokens
      console.log('Ethereum LP token detection: Coming soon...');

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