
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

    // Assume a 50/50 pool and calculate the total value based on actual token prices
    // Simplified: For each LP token, assume it represents an equal share of token1 and token2
    const token1Amount = balance / 2; // This is a simplification; real pools need on-chain data
    const token2Amount = balance / 2;
    
    const token1UsdValue = token1Amount * token1Price;
    const token2UsdValue = token2Amount * token2Price;
    const estimatedTotalValue = token1UsdValue + token2UsdValue;

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
