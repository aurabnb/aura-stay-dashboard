
import { WalletBalance } from './types.ts';
import { METEORA_LP_TOKENS, FIXED_PRICES } from './constants.ts';
import { getTokenInfo, getTokenPrice } from './token-service.ts';
import { getLPTokenDetails } from './lp-service.ts';
import { getSolanaPrice } from './price-service.ts';
import { getEthereumWalletBalances } from './ethereum-service.ts';

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        const delayMs = baseDelay * Math.pow(2, attempt);
        console.log(`Waiting ${delayMs}ms before retry...`);
        await delay(delayMs);
      }
    }
  }
  
  throw lastError!;
}

// Helper function to get specific token balance directly
async function getSpecificTokenBalance(walletAddress: string, tokenMint: string): Promise<number> {
  try {
    console.log(`Fetching specific token balance for ${tokenMint} in wallet ${walletAddress}`);
    
    const response = await retryWithBackoff(async () => {
      return await fetch(`https://api.mainnet-beta.solana.com`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            walletAddress,
            { mint: tokenMint },
            { encoding: 'jsonParsed', commitment: 'confirmed' }
          ]
        }),
        signal: AbortSignal.timeout(10000)
      });
    }, 2, 1500);

    const data = await response.json();
    
    if (data.error) {
      console.warn(`RPC Error for ${tokenMint}:`, data.error.message);
      return 0;
    }

    if (data.result?.value && data.result.value.length > 0) {
      const account = data.result.value[0];
      const balance = parseFloat(account.account.data.parsed.info.tokenAmount.uiAmount || '0');
      console.log(`Found ${tokenMint} balance: ${balance} for wallet ${walletAddress}`);
      return balance;
    }
    
    console.log(`No ${tokenMint} account found for wallet ${walletAddress}`);
    return 0;
  } catch (error) {
    console.warn(`Failed to fetch ${tokenMint} balance for ${walletAddress}:`, error);
    return 0;
  }
}

export async function getWalletBalances(address: string, blockchain: string = 'Solana'): Promise<WalletBalance[]> {
  const balances: WalletBalance[] = [];

  try {
    if (blockchain === 'Ethereum') {
      console.log(`Fetching Ethereum balances for: ${address}`);
      
      const ethBalances = await getEthereumWalletBalances(address);
      
      // Convert to our standard format
      for (const balance of ethBalances) {
        balances.push({
          symbol: balance.symbol,
          name: balance.name,
          balance: balance.balance,
          usdValue: balance.usdValue,
          tokenAddress: balance.tokenAddress,
          isLpToken: balance.isLpToken,
          platform: balance.platform,
          lpDetails: balance.lpDetails
        });
      }
      
    } else if (blockchain === 'Solana') {
      console.log(`Fetching Solana balances for: ${address}`);
      
      // Get SOL balance with retry
      try {
        const response = await retryWithBackoff(async () => {
          return await fetch(`https://api.mainnet-beta.solana.com`, {
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
      } catch (error) {
        console.warn(`Failed to fetch SOL balance for ${address}:`, error);
      }

      // Always try to get AURA balance specifically, even if general token fetch fails
      const auraBalance = await getSpecificTokenBalance(address, '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe');
      const auraPrice = await getTokenPrice('3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe');
      
      balances.push({
        symbol: 'AURA',
        name: 'AURA Token',
        balance: auraBalance,
        usdValue: auraBalance * auraPrice,
        tokenAddress: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
        isLpToken: false,
        platform: 'spl-token'
      });

      console.log(`AURA balance for ${address}: ${auraBalance} tokens, USD value: $${(auraBalance * auraPrice).toFixed(6)}`);

      // Fetch token accounts with improved retry logic
      let tokenData = null;
      try {
        const tokenResponse = await retryWithBackoff(async () => {
          const response = await fetch(`https://api.mainnet-beta.solana.com`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getTokenAccountsByOwner',
              params: [
                address,
                { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
                { encoding: 'jsonParsed', commitment: 'confirmed' }
              ]
            }),
            signal: AbortSignal.timeout(12000)
          });

          const data = await response.json();
          if (data.error) {
            throw new Error(`RPC Error: ${data.error.message}`);
          }
          return data;
        }, 4, 2000); // More retries and longer delays for token accounts

        tokenData = tokenResponse;
      } catch (error) {
        console.warn(`Failed to fetch token accounts for ${address} after retries:`, error);
        // Continue execution since we already have AURA balance
      }

      console.log(`Token account response for ${address}:`, tokenData);
      
      if (tokenData?.result?.value) {
        console.log(`Found ${tokenData.result.value.length} token accounts for ${address}`);
        
        for (const account of tokenData.result.value) {
          try {
            const tokenInfo = account.account.data.parsed.info;
            const mint = tokenInfo.mint;
            const balance = parseFloat(tokenInfo.tokenAmount.uiAmount || '0');
            
            // Skip AURA since we already added it specifically
            if (mint === '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe') {
              console.log(`Skipping AURA token ${mint} since already added specifically`);
              continue;
            }
            
            console.log(`Processing token ${mint} with balance: ${balance}`);
            
            const tokenMeta = await getTokenInfo(mint);
            const isLpToken = METEORA_LP_TOKENS.has(mint);
            
            console.log(`Token ${mint}: symbol=${tokenMeta.symbol}, isLP=${isLpToken}, balance=${balance}`);
            
            let tokenPrice = 0;
            let lpDetails = null;
            
            if (isLpToken) {
              console.log(`Processing LP token: ${mint} with balance: ${balance}`);
              lpDetails = await getLPTokenDetails(mint, balance);
              
              if (lpDetails && lpDetails.totalUsdValue > 0) {
                tokenPrice = lpDetails.totalUsdValue / balance;
                console.log(`LP Token ${mint}: calculated price per token=$${tokenPrice}, total value=$${lpDetails.totalUsdValue}`);
              } else {
                console.warn(`LP Token ${mint}: failed to calculate details or got 0 value`);
                tokenPrice = await getTokenPrice(mint);
              }
            } else {
              tokenPrice = await getTokenPrice(mint);
            }
            
            const poolConfig = METEORA_LP_TOKENS.get(mint);
            const finalUsdValue = balance * tokenPrice;
            
            console.log(`Adding token: ${tokenMeta.symbol}, balance: ${balance}, price: $${tokenPrice}, USD value: $${finalUsdValue}`);
            
            if (balance > 0 || isLpToken) {
              balances.push({
                symbol: isLpToken ? `${poolConfig?.name || tokenMeta.symbol} LP` : tokenMeta.symbol,
                name: isLpToken ? `${poolConfig?.name || tokenMeta.name} LP Token` : tokenMeta.name,
                balance: balance,
                usdValue: finalUsdValue,
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
      } else {
        console.log(`No additional token accounts found for ${address} (AURA already added specifically)`);
      }
    }

  } catch (error) {
    console.error(`Error fetching balances for ${address}:`, error);
  }

  console.log(`Final balances for ${address}:`, balances.map(b => ({
    symbol: b.symbol,
    balance: b.balance,
    usdValue: b.usdValue,
    isLP: b.isLpToken
  })));

  return balances;
}
