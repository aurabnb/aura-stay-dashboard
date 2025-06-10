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

// Solana connection - FORCE MAINNET ONLY for treasury monitoring
const solanaRpcUrl = 'https://api.mainnet-beta.solana.com'; // Always use mainnet for treasury
console.log(`🚀 TREASURY SYSTEM: Using Solana MAINNET - ${solanaRpcUrl}`);

const solanaConnection = new Connection(
  solanaRpcUrl,
  {
    commitment: 'confirmed',
    wsEndpoint: undefined,
  }
);

// Token mint addresses
const TOKEN_MINTS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  AURA: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
};

// Token metadata
const TOKEN_METADATA = {
  [TOKEN_MINTS.SOL]: { symbol: 'SOL', name: 'Solana', decimals: 9 },
  [TOKEN_MINTS.USDC]: { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  [TOKEN_MINTS.AURA]: { symbol: 'AURA', name: 'AURA Token', decimals: 9 },
};

// Fetch current token prices
async function fetchTokenPrices(): Promise<{ sol: number; usdc: number; aura: number; eth: number }> {
  // Skip internal API call in server-side context and go directly to external API
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum&vs_currencies=usd');
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      sol: data.solana?.usd || 180,
      usdc: 1.0,
      aura: 0.0002700, // Default AURA price - would need separate API for real price
      eth: data.ethereum?.usd || 3000,
    };
  } catch (error) {
    console.error('Error fetching prices from CoinGecko:', error);
    // Return fallback prices
    return {
      sol: 180,
      usdc: 1.0,
      aura: 0.0002700,
      eth: 3000,
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

    // Fetch SPL token accounts
    const tokenAccounts = await solanaConnection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
    );

    for (const account of tokenAccounts.value) {
      const tokenInfo = account.account.data.parsed.info;
      const mint = tokenInfo.mint;
      const balance = parseFloat(tokenInfo.tokenAmount.uiAmount || '0');
      
      if (balance > 0 && TOKEN_METADATA[mint]) {
        const metadata = TOKEN_METADATA[mint];
        let price = 0;
        
        if (mint === TOKEN_MINTS.USDC) {
          price = prices.usdc;
        } else if (mint === TOKEN_MINTS.AURA) {
          price = prices.aura;
        }
        
        balances.push({
          token_symbol: metadata.symbol,
          token_name: metadata.name,
          balance: balance,
          usd_value: balance * price,
          token_address: mint,
          is_lp_token: false,
          platform: 'Solana',
        });
      }
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
    // Try multiple Ethereum balance APIs in order of preference
    const apiEndpoints = [
      // Blockscout API (free, no API key required)
      `https://eth.blockscout.com/api?module=account&action=balance&address=${address}`,
      // Etherscan API without API key (limited requests)
      `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest`,
    ];

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
            const balanceETH = Number(balanceWei) / Math.pow(10, 18);
            
            console.log(`Successfully fetched Ethereum balance: ${balanceETH} ETH`);
            
            return [
              {
                token_symbol: 'ETH',
                token_name: 'Ethereum',
                balance: balanceETH,
                usd_value: balanceETH * prices.eth,
                token_address: '0x0000000000000000000000000000000000000000',
                is_lp_token: false,
                platform: 'Ethereum',
              }
            ];
          }
        }
      } catch (apiError) {
        console.log(`Failed to fetch from ${endpoint}:`, apiError);
        continue;
      }
    }
    
    // Final fallback: Use a simple RPC call
    try {
      console.log('Trying direct RPC call to Ethereum...');
      const rpcResponse = await fetch('https://eth.llamarpc.com', {
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

      if (rpcResponse.ok) {
        const contentType = rpcResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const rpcData = await rpcResponse.json();
          
          if (rpcData.result) {
            // Convert hex balance to ETH (Wei to ETH)
            const balanceWei = parseInt(rpcData.result, 16);
            const balanceETH = balanceWei / Math.pow(10, 18);
            
            console.log(`RPC call successful: ${balanceETH} ETH`);
            
            return [
              {
                token_symbol: 'ETH',
                token_name: 'Ethereum',
                balance: balanceETH,
                usd_value: balanceETH * prices.eth,
                token_address: '0x0000000000000000000000000000000000000000',
                is_lp_token: false,
                platform: 'Ethereum',
              }
            ];
          }
        }
      }
    } catch (rpcError) {
      console.log('RPC call failed:', rpcError);
    }
    
    console.log(`Could not fetch Ethereum balance for ${address} from any source, using zero balance`);
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
      
      let balances: any[] = [];
      
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