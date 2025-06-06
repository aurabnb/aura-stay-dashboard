import { WalletBalance } from './types.ts';
import { METEORA_LP_TOKENS } from './constants.ts';
import { getTokenInfo, getTokenPrice } from './token-service.ts';
import { getLPTokenDetails } from './lp-service.ts';
import { getSolanaPrice } from './price-service.ts';

export async function getWalletBalances(address: string, blockchain: string = 'Solana'): Promise<WalletBalance[]> {
  const balances: WalletBalance[] = [];

  try {
    if (blockchain === 'Solana') {
      console.log(`Fetching Solana balances for: ${address}`);
      
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
        console.log(`Found ${tokenData.result.value.length} token accounts for ${address}`);
        
        for (const account of tokenData.result.value) {
          try {
            const tokenInfo = account.account.data.parsed.info;
            const mint = tokenInfo.mint;
            const balance = parseFloat(tokenInfo.tokenAmount.uiAmount || '0');
            
            console.log(`Processing token ${mint} with balance: ${balance}`);
            
            if (balance > 0) {
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
        console.log(`No token accounts found for ${address}`);
      }

    } else if (blockchain === 'Ethereum') {
      console.log(`Fetching Ethereum balance for: ${address}`);
      
      const infuraKey = Deno.env.get('INFURA_API_KEY');
      if (!infuraKey) {
        console.warn('INFURA_API_KEY not configured');
        return balances;
      }

      // Get ETH balance
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
        const ethPrice = 3500;
        
        balances.push({
          symbol: 'ETH',
          name: 'Ethereum',
          balance: ethBalance,
          usdValue: ethBalance * ethPrice,
          isLpToken: false,
          platform: 'native'
        });
      }

      // Check for both CULT and DCULT tokens
      const tokenAddresses = [
        { address: '0xf0f9d895aca5c8678f706fb8216fa22957685a13', name: 'CULT' },
        { address: '0x2d77b594b9bbaed03221f7c63af8c4307432daf1', name: 'DCULT' }
      ];

      for (const token of tokenAddresses) {
        try {
          const tokenResponse = await fetch(`https://mainnet.infura.io/v3/${infuraKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 2,
              method: 'eth_call',
              params: [
                {
                  to: token.address,
                  data: `0x70a08231000000000000000000000000${address.slice(2)}`
                },
                'latest'
              ]
            }),
            signal: AbortSignal.timeout(8000)
          });

          const tokenData = await tokenResponse.json();
          
          if (tokenData.result && tokenData.result !== '0x' && tokenData.result !== '0x0') {
            const tokenBalance = parseInt(tokenData.result, 16) / 1e18;
            const tokenPrice = await getTokenPrice(token.address);
            
            console.log(`Fetched price for ${token.name}: $${tokenPrice}`);
            console.log(`${token.name} balance found: ${tokenBalance}, price: $${tokenPrice}, USD value: $${tokenBalance * tokenPrice}`);
            
            if (tokenBalance > 0) {
              const tokenInfo = await getTokenInfo(token.address);
              balances.push({
                symbol: tokenInfo.symbol,
                name: tokenInfo.name,
                balance: tokenBalance,
                usdValue: tokenBalance * tokenPrice,
                tokenAddress: token.address,
                isLpToken: false,
                platform: 'erc20'
              });
            }
          } else {
            console.log(`No ${token.name} balance found or balance is zero`);
          }
        } catch (error) {
          console.warn(`Error fetching ${token.name} balance:`, error);
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
