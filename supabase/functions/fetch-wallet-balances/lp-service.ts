
import { LPDetails } from './types.ts';
import { METEORA_LP_TOKENS } from './constants.ts';
import { getTokenInfo, getTokenPrice } from './token-service.ts';
import { fetchMeteoraPoolData } from './meteora-service.ts';

export async function getLPTokenDetails(mint: string, balance: number): Promise<LPDetails | null> {
  try {
    const poolConfig = METEORA_LP_TOKENS.get(mint);
    if (!poolConfig) {
      console.log(`No pool config found for LP token: ${mint}`);
      return null;
    }

    console.log(`Fetching live Meteora data for pool: ${mint} (${poolConfig.name})`);

    // Try to fetch real-time data from Meteora first
    const meteoraData = await fetchMeteoraPoolData(mint, balance);
    
    if (meteoraData && meteoraData.userUsdValue > 0) {
      console.log(`Live Meteora data fetched for ${mint}: $${meteoraData.userUsdValue.toFixed(2)} (APY: ${meteoraData.apy.toFixed(2)}%)`);
      
      return {
        poolAddress: mint,
        token1: {
          symbol: meteoraData.tokenA.symbol,
          amount: meteoraData.tokenA.amount,
          usdValue: meteoraData.tokenA.usdValue
        },
        token2: {
          symbol: meteoraData.tokenB.symbol,
          amount: meteoraData.tokenB.amount,
          usdValue: meteoraData.tokenB.usdValue
        },
        priceRange: { min: 0, max: 0 },
        totalUsdValue: meteoraData.userUsdValue,
        meteoraData: meteoraData
      };
    }

    // Fallback to existing calculation method
    console.log(`Falling back to estimated calculation for pool: ${mint}`);

    const token1Info = await getTokenInfo(poolConfig.token1);
    const token2Info = await getTokenInfo(poolConfig.token2);
    const token1Price = await getTokenPrice(poolConfig.token1);
    const token2Price = await getTokenPrice(poolConfig.token2);

    console.log(`LP token prices: ${token1Info.symbol}=$${token1Price}, ${token2Info.symbol}=$${token2Price}`);

    // Use a more realistic calculation based on the pool type
    let estimatedTotalValue = 0;
    let token1Amount = 0;
    let token2Amount = 0;

    if (token1Price > 0 || token2Price > 0) {
      // Calculate based on a 50/50 split assumption
      if (token1Price > 0 && token2Price > 0) {
        const totalValuePerToken = (token1Price + token2Price) / 2;
        estimatedTotalValue = balance * totalValuePerToken;
        token1Amount = balance * 0.5;
        token2Amount = balance * 0.5;
      } else if (token1Price > 0) {
        estimatedTotalValue = balance * token1Price;
        token1Amount = balance;
        token2Amount = 0;
      } else {
        estimatedTotalValue = balance * token2Price;
        token1Amount = 0;
        token2Amount = balance;
      }
    } else {
      // Fallback to simple estimation if no prices available
      if (poolConfig.name.includes('AURA-WBTC') || poolConfig.name.includes('WBTC-AURA')) {
        estimatedTotalValue = balance * 1.5;
      } else if (poolConfig.name.includes('ETH-AURA') || poolConfig.name.includes('AURA-ETH')) {
        estimatedTotalValue = balance * 0.8;
      } else if (poolConfig.name.includes('SOL-AURA') || poolConfig.name.includes('AURA-SOL')) {
        estimatedTotalValue = balance * 0.3;
      } else {
        estimatedTotalValue = balance * 0.5;
      }
      token1Amount = balance / 2;
      token2Amount = balance / 2;
    }

    const token1UsdValue = token1Amount * token1Price;
    const token2UsdValue = token2Amount * token2Price;

    console.log(`LP position calculated - ${token1Info.symbol}: ${token1Amount.toFixed(6)} ($${token1UsdValue.toFixed(2)}), ${token2Info.symbol}: ${token2Amount.toFixed(6)} ($${token2UsdValue.toFixed(2)}), Total: $${estimatedTotalValue.toFixed(2)}`);

    return {
      poolAddress: mint,
      token1: {
        symbol: token1Info.symbol,
        amount: token1Amount,
        usdValue: token1UsdValue
      },
      token2: {
        symbol: token2Info.symbol,
        amount: token2Amount,
        usdValue: token2UsdValue
      },
      priceRange: { min: 0, max: 0 },
      totalUsdValue: estimatedTotalValue
    };
  } catch (error) {
    console.error(`Error calculating LP details for ${mint}:`, error);
    return null;
  }
}
