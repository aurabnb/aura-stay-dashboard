
/**
 * Shared helper for detection and value calculation of LP tokens (Solana Meteora and ETH UniswapV2)
 */

import { fetchERC20Balance, fetchEthBalance, UNISWAPV2_LP_CONTRACTS, fetchUniV2LpData } from "./ethereum-api.ts";
import { getTokensWithAura, fetchWalletFromShyft, ShyftTokenBasic } from "./shyft-api.ts";
import { fetchAllMeteoraPoolsForWallet } from "./meteora-service.ts";
console.log('[lp-detection] Using fetchAllMeteoraPoolsForWallet from local meteora-service.ts!');

// Solana: fetch Meteora LP positions via Shyft + Meteora API
export async function getSolanaWalletLps(walletAddress: string) {
  // Use Shyft API to list tokens
  const tokensData = await fetchWalletFromShyft(Deno.env.get('SHYFT_API_KEY'), walletAddress);
  let tokens: ShyftTokenBasic[] = tokensData.tokens || [];
  tokens = getTokensWithAura(tokens);

  // Get only tokens with "LP" in their symbol - basic filtering for now
  const lpTokens = tokens.filter(t =>
    t.info.symbol && t.info.symbol.toUpperCase().includes('LP')
  );

  // Gather all LP token addresses and balances (for Meteora)
  const lpBalances = lpTokens.map(t => ({
    mint: t.address,
    balance: t.balance / Math.pow(10, t.info.decimals ?? 0),
  }));

  // Fetch detailed pool data using meteora-service (batch fetch)
  const meteoraLps: any[] = lpBalances.length > 0
    ? await fetchAllMeteoraPoolsForWallet(walletAddress, lpBalances)
    : [];

  // Map each pool as a WalletBalance with lp_details.meteoraData
  const lpBalancesDetailed = meteoraLps.map(pool => ({
    token_symbol: pool.name + " LP",
    token_name: pool.name,
    balance: pool.userShare > 0 ? pool.userUsdValue / pool.totalLiquidity * pool.totalLiquidity : 0,
    usd_value: pool.userUsdValue,
    token_address: pool.poolAddress,
    is_lp_token: true,
    platform: "Meteora",
    lp_details: {
      meteoraData: pool,
      totalUsdValue: pool.userUsdValue,
    }
  }));

  return lpBalancesDetailed;
}

// Ethereum: fetch any UniswapV2 LP supported and calculate its value
export async function getEthereumLpBalances(wallet: string, prices: Record<string, number>) {
  const out = [];
  for (const lpContract of UNISWAPV2_LP_CONTRACTS) {
    try {
      const {
        lpBalance, totalSupply, reserve0, reserve1, userShare, symbol, name, token0, token1
      } = await fetchUniV2LpData(lpContract, wallet);

      // Underlying prices
      const token0Price = prices[token0] ?? 0; // e.g. WETH, AURA, CULT
      const token1Price = prices[token1] ?? 0;
      const userToken0 = reserve0 * userShare;
      const userToken1 = reserve1 * userShare;
      const usdValue = userToken0 * token0Price + userToken1 * token1Price;

      // Debug logging
      console.log(
        `[getEthereumLpBalances] wallet=${wallet} pool=${lpContract} balance=${lpBalance} ` + 
        `userShare=${userShare} reserves=(${reserve0},${reserve1}) prices=(${token0Price},${token1Price}) usdValue=${usdValue}`
      );

      // Always push output (even 0 balance for debugging).
      out.push({
        token_symbol: `${symbol} LP`,
        token_name: name,
        balance: lpBalance,
        usd_value: usdValue,
        token_address: lpContract,
        is_lp_token: true,
        platform: "UniswapV2",
        lp_details: {
          poolAddress: lpContract,
          token1: { symbol: token0, amount: userToken0, usdValue: userToken0 * token0Price },
          token2: { symbol: token1, amount: userToken1, usdValue: userToken1 * token1Price },
          priceRange: { min: 0, max: 0 },
          totalUsdValue: usdValue,
        }
      });
    } catch (err) {
      console.warn('Error fetching/unpacking LP', lpContract, err);
    }
  }
  // Log what LPs will be returned
  console.log("[getEthereumLpBalances] Out:", out);
  return out;
}
