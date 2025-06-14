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
        // Continue execution to ensure AURA is added even if token fetch fails
      }

      console.log(`Token account response for ${address}:`, tokenData);
      
      if (tokenData?.result?.value) {
        console.log(`Found ${tokenData.result.value.length} token accounts for ${address}`);
        
        for (const account of tokenData.result.value) {
          try {
            const tokenInfo = account.account.data.parsed.info;
            const mint = tokenInfo.mint;
            const balance = parseFloat(tokenInfo.tokenAmount.uiAmount || '0');
            
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
            
            if (balance > 0 || tokenMeta.symbol === 'AURA' || isLpToken) {
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
        console.log(`No token accounts found for ${address} (possibly due to rate limiting or RPC issues)`);
      }

      // CRITICAL: Always ensure AURA token is included, even if token account fetch failed
      const auraExists = balances.find(b => b.tokenAddress === '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe');
      if (!auraExists) {
        console.log(`Adding AURA token with zero balance for ${address} (fallback due to missing token account data)`);
        try {
          const auraPrice = await getTokenPrice('3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe');
          balances.push({
            symbol: 'AURA',
            name: 'AURA Token',
            balance: 0,
            usdValue: 0,
            tokenAddress: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
            isLpToken: false,
            platform: 'spl-token'
          });
          console.log(`Successfully added AURA fallback token for ${address}`);
        } catch (error) {
          console.error(`Failed to add AURA fallback token for ${address}:`, error);
        }
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
