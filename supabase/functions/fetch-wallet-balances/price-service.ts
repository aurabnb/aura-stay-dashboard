
import { rateLimitedFetch } from './utils.ts';

export async function getSolanaPrice(): Promise<number> {
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
    return 180;
  }
}

export async function getAuraMarketCap(): Promise<number> {
  try {
    console.log('Calculating AURA market cap...');
    
    const auraTokenMint = '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe';
    
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
      
      const fixedPrice = 0.00011566;
      const marketCap = totalSupply * fixedPrice;
      console.log(`AURA market cap calculated: $${marketCap} (${totalSupply} tokens × $${fixedPrice})`);
      return marketCap;
    }

    console.warn('Could not get AURA total supply, returning fallback');
    return 75000;
    
  } catch (error) {
    console.error('Error calculating AURA market cap:', error);
    return 75000;
  }
}
