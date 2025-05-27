
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

    let token1Amount, token2Amount;
    
    if (poolConfig.name.includes('AURA-WBTC') || poolConfig.name.includes('WBTC-AURA')) {
      const totalValue = balance * 0.1;
      token1Amount = totalValue / (2 * token1Price);
      token2Amount = totalValue / (2 * token2Price);
    } else {
      const estimatedTotalValue = balance * 0.05;
      token1Amount = estimatedTotalValue / (2 * token1Price);
      token2Amount = estimatedTotalValue / (2 * token2Price);
    }

    const token1UsdValue = token1Amount * token1Price;
    const token2UsdValue = token2Amount * token2Price;
    const totalUsdValue = token1UsdValue + token2UsdValue;

    console.log(`LP position calculated - ${token1Info.symbol}: ${token1Amount.toFixed(6)} ($${token1UsdValue.toFixed(2)}), ${token2Info.symbol}: ${token2Amount.toFixed(6)} ($${token2UsdValue.toFixed(2)}), Total: $${totalUsdValue.toFixed(2)}`);

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
      totalUsdValue: totalUsdValue
    };
  } catch (error) {
    console.error(`Error calculating LP details for ${mint}:`, error);
    return null;
  }
}
