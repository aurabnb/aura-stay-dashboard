import { fetchWalletFromShyft, getTokensWithAura, ShyftTokenBasic } from "./shyft-api.ts";
import { getSolanaWalletLps, getEthereumLpBalances } from "./lp-detection.ts";

const TOKEN_PRICES: Record<string, number> = {
  'SOL': 147.04,
  'USDC': 1.00,
  'USDT': 1.00,
  'AURA': 0.00011566,
  'WBTC': 105000,
  'ETH': 3500
};

/**
 * Get balances for this wallet (all tokens, including AURA + LPs) using the Shyft API or Ethereum
 */
export async function getLiveWalletData(walletCfg: { name: string; address: string; blockchain?: string }, apiKey: string) {
  if (walletCfg.blockchain === "Ethereum") {
    // ETH and ERC-20 balances (WETH + CULT + LP)
    const ethPrice = TOKEN_PRICES.ETH ?? 3500;
    const cultPrice = 0.00001; // FIXME: Fetch from coingecko if needed
    const wethPrice = ethPrice;
    const balances = [];
    const ethBal = await fetchEthBalance(walletCfg.address);
    if (ethBal > 0) {
      balances.push({
        token_symbol: "ETH",
        token_name: "Ethereum",
        balance: ethBal,
        usd_value: ethBal * ethPrice,
        token_address: "ETH",
        is_lp_token: false,
        platform: "Native"
      });
    }
    // CULT ERC20 balance
    const cultBal = await fetchERC20Balance("0xf0f9d895aca5c8678f706fb8216fa22957685a13", walletCfg.address);
    if (cultBal > 0) {
      balances.push({
        token_symbol: "CULT",
        token_name: "Cult DAO",
        balance: cultBal,
        usd_value: cultBal * cultPrice,
        token_address: "0xf0f9d895aca5c8678f706fb8216fa22957685a13",
        is_lp_token: false,
        platform: "ERC20"
      });
    }
    // (Optional) DCULT ERC20 balance...
    // WETH-CULT LP (UniswapV2)
    const ethLps = await getEthereumLpBalances(walletCfg.address, ethPrice, cultPrice, wethPrice);
    for (const lp of ethLps) balances.push(lp);

    return {
      ...walletCfg,
      balances,
      totalUsdValue: balances.reduce((sum, t) => sum + (t.usd_value || 0), 0)
    };
  }

  // Default: Solana wallets - use Shyft
  const walletResult = await fetchWalletFromShyft(apiKey, walletCfg.address);
  const solBalance = walletResult.balance / 1e9; // in SOL
  let tokens: ShyftTokenBasic[] = walletResult.tokens || [];
  tokens = getTokensWithAura(tokens);

  const tokenBalances = [];

  if (solBalance > 0) {
    tokenBalances.push({
      token_symbol: 'SOL',
      token_name: 'Solana',
      balance: solBalance,
      usd_value: solBalance * (TOKEN_PRICES['SOL'] ?? 0),
      token_address: 'So11111111111111111111111111111111111111112',
      is_lp_token: false,
      platform: 'Shyft'
    });
  }

  for (const t of tokens) {
    const decimals = t.info.decimals ?? 0;
    const rawBalance = t.balance / Math.pow(10, decimals);
    const symbol = t.info.symbol;
    const price = TOKEN_PRICES[symbol] ?? 0.0;
    const usdValue = rawBalance * price;

    tokenBalances.push({
      token_symbol: symbol,
      token_name: t.info.name,
      balance: rawBalance,
      usd_value: usdValue,
      token_address: t.address,
      is_lp_token: false,
      platform: 'Shyft'
    });
  }

  // ==== [NEW] Dynamically add Meteora LPs (live) ====
  const meteoraLps = await getSolanaWalletLps(walletCfg.address);
  for (const lp of meteoraLps) tokenBalances.push(lp);

  // ==== END NEW ====

  const totalUsdValue = tokenBalances.reduce((sum, t) => sum + (t.usd_value || 0), 0);

  return {
    ...walletCfg,
    balances: tokenBalances,
    totalUsdValue
  };
}
