
import { LPDetails } from './types.ts';
import { METEORA_LP_TOKENS } from './constants.ts';
import { getTokenInfo, getTokenPrice } from './token-service.ts';

export async function getLPTokenDetails(mint: string, balance: number): Promise<LPDetails | null> {
  try {
    const poolConfig = METEORA_LP_TOKENS.get(mint);
    if (!poolConfig) {
      console.log(`No pool config found for LP token: ${mint}`);
      return null;
    }

    console.log(`Calculating LP details for pool: ${mint} (${poolConfig.name})`);

    const token1Info = await getTokenInfo(poolConfig.token1);
    const token2Info = await getTokenInfo(poolConfig.token2);
    const token1Price = await getTokenPrice(poolConfig.token1);
    const token2Price = await getTokenPrice(poolConfig.token2);

    console.log(`LP token prices: ${token1Info.symbol}=$${token1Price}, ${token2Info.symbol}=$${token2Price}`);

    // Estimate LP token value based on pool composition
    // For AURA-WBTC pools, estimate higher value due to WBTC
    let estimatedTotalValue: number;
    
    if (poolConfig.name.includes('AURA-WBTC') || poolConfig.name.includes('WBTC-AURA')) {
      // Higher value estimation for WBTC pools
      estimatedTotalValue = balance * 1.5;
    } else if (poolConfig.name.includes('ETH-AURA') || poolConfig.name.includes('AURA-ETH')) {
      // Medium value estimation for ETH pools
      estimatedTotalValue = balance * 0.8;
    } else {
      // Default estimation
      estimatedTotalValue = balance * 0.5;
    }

    // Split 50/50 between tokens
    const token1UsdValue = estimatedTotalValue / 2;
    const token2UsdValue = estimatedTotalValue / 2;
    
    // Calculate token amounts based on prices
    const token1Amount = token1Price > 0 ? token1UsdValue / token1Price : 0;
    const token2Amount = token2Price > 0 ? token2UsdValue / token2Price : 0;

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
