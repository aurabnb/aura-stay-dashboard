
export interface MeteoraPoolData {
  poolAddress: string;
  name: string;
  tokenA: {
    mint: string;
    symbol: string;
    amount: number;
    usdValue: number;
  };
  tokenB: {
    mint: string;
    symbol: string;
    amount: number;
    usdValue: number;
  };
  totalLiquidity: number;
  volume24h: number;
  fees24h: number;
  apy: number;
  userShare: number;
  userUsdValue: number;
}

export async function fetchMeteoraPoolData(poolAddress: string, userLpBalance: number): Promise<MeteoraPoolData | null> {
  try {
    console.log(`Fetching Meteora pool data for: ${poolAddress}`);
    
    // Fetch pool info from Meteora API
    const poolResponse = await fetch(`https://app.meteora.ag/api/pool/${poolAddress}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Aura-Treasury-Dashboard/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!poolResponse.ok) {
      console.warn(`Failed to fetch pool data for ${poolAddress}: ${poolResponse.status}`);
      return null;
    }

    const poolData = await poolResponse.json();
    
    // Calculate user's share based on LP token balance
    const totalSupply = poolData.totalSupply || 1;
    const userSharePercentage = (userLpBalance / totalSupply) * 100;
    
    // Calculate user's USD value
    const userUsdValue = (poolData.totalLiquidity || 0) * (userLpBalance / totalSupply);

    // Estimate APY based on recent performance
    const apy = poolData.apy || calculateEstimatedAPY(poolData.fees24h, poolData.totalLiquidity);

    return {
      poolAddress,
      name: poolData.name || 'Unknown Pool',
      tokenA: {
        mint: poolData.tokenA?.mint || '',
        symbol: poolData.tokenA?.symbol || 'TOKEN_A',
        amount: (poolData.tokenA?.amount || 0) * (userLpBalance / totalSupply),
        usdValue: (poolData.tokenA?.usdValue || 0) * (userLpBalance / totalSupply)
      },
      tokenB: {
        mint: poolData.tokenB?.mint || '',
        symbol: poolData.tokenB?.symbol || 'TOKEN_B',
        amount: (poolData.tokenB?.amount || 0) * (userLpBalance / totalSupply),
        usdValue: (poolData.tokenB?.usdValue || 0) * (userLpBalance / totalSupply)
      },
      totalLiquidity: poolData.totalLiquidity || 0,
      volume24h: poolData.volume24h || 0,
      fees24h: poolData.fees24h || 0,
      apy: apy,
      userShare: userSharePercentage,
      userUsdValue: userUsdValue
    };
  } catch (error) {
    console.error(`Error fetching Meteora pool data for ${poolAddress}:`, error);
    return null;
  }
}

function calculateEstimatedAPY(fees24h: number, totalLiquidity: number): number {
  if (!fees24h || !totalLiquidity) return 0;
  
  // Annualize the daily fees
  const annualFees = fees24h * 365;
  const apy = (annualFees / totalLiquidity) * 100;
  
  return Math.min(apy, 1000); // Cap at 1000% to avoid unrealistic values
}

export async function fetchAllMeteoraPoolsForWallet(walletAddress: string, lpBalances: Array<{mint: string, balance: number}>): Promise<MeteoraPoolData[]> {
  const poolPromises = lpBalances.map(async (lpToken) => {
    const poolData = await fetchMeteoraPoolData(lpToken.mint, lpToken.balance);
    return poolData;
  });

  const results = await Promise.all(poolPromises);
  return results.filter(pool => pool !== null) as MeteoraPoolData[];
}
