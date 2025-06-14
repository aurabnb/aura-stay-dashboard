/**
 * Shared helper for detection and value calculation of LP tokens (Solana Meteora and ETH UniswapV2)
 */

import { fetchWethCultLpData, fetchERC20Balance, fetchEthBalance } from "./ethereum-api.ts";
import { getTokensWithAura, fetchWalletFromShyft, ShyftTokenBasic } from "./shyft-api.ts";
import { fetchAllMeteoraPoolsForWallet } from "../../fetch-wallet-balances/meteora-service.ts";

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

// Ethereum: fetch the WETH-CULT LP and calculate its value
export async function getEthereumLpBalances(wallet: string, ethPrice: number, cultPrice: number, wethPrice: number) {
  // Fetch WETH-CULT UNI-V2 position
  const { lpBalance, reserve0, reserve1, totalSupply, userShare } = await fetchWethCultLpData(wallet);

  // Value the pool (assume reserve0 WETH, reserve1 CULT; supply is in LP tokens)
  const userWeth = reserve0 * userShare;
  const userCult = reserve1 * userShare;
  const usdValue = userWeth * wethPrice + userCult * cultPrice;

  const out = [];
  if (lpBalance > 0) {
    out.push({
      token_symbol: "WETH-CULT LP",
      token_name: "WETH-CULT UniV2 LP",
      balance: lpBalance,
      usd_value: usdValue,
      token_address: "0x63F659b6a154b2bB88B501eEcA62141883b8bEe8", // LP token mint
      is_lp_token: true,
      platform: "UniswapV2",
      lp_details: {
        poolAddress: "0x63F659b6a154b2bB88B501eEcA62141883b8bEe8",
        token1: { symbol: "WETH", amount: userWeth, usdValue: userWeth * wethPrice },
        token2: { symbol: "CULT", amount: userCult, usdValue: userCult * cultPrice },
        priceRange: { min: 0, max: 0 },
        totalUsdValue: usdValue,
      }
    });
  }
  return out;
}
