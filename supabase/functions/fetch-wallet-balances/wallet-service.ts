
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
                tokenPrice = lpDetails ? lpDetails.totalUsdValue / balance : 0;
                console.log(`LP Token ${mint}: balance=${balance}, calculated price per token=$${tokenPrice}, total value=$${lpDetails?.totalUsdValue || 0}`);
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

      // Get CULT token balance
      const cultTokenAddress = '0xf0f9d895aca5c8678f706fb8216fa22957685a13';
      const cultResponse = await fetch(`https://mainnet.infura.io/v3/${infuraKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'eth_call',
          params: [
            {
              to: cultTokenAddress,
              data: `0x70a08231000000000000000000000000${address.slice(2)}`
            },
            'latest'
          ]
        }),
        signal: AbortSignal.timeout(8000)
      });

      const cultData = await cultResponse.json();
      
      if (cultData.result && cultData.result !== '0x') {
        const cultBalance = parseInt(cultData.result, 16) / 1e18;
        const cultPrice = await getTokenPrice(cultTokenAddress);
        
        if (cultBalance > 0) {
          console.log(`CULT balance found: ${cultBalance}, price: $${cultPrice}`);
          balances.push({
            symbol: 'CULT',
            name: 'Cult DAO',
            balance: cultBalance,
            usdValue: cultBalance * cultPrice,
            tokenAddress: cultTokenAddress,
            isLpToken: false,
            platform: 'erc20'
          });
        }
      }
    }

  } catch (error) {
    console.error(`Error fetching balances for ${address}:`, error);
  }

  return balances;
}
