
import { fetchWalletFromShyft, getTokensWithAura, ShyftTokenBasic } from "./shyft-api.ts";

const TOKEN_PRICES: Record<string, number> = {
  'SOL': 147.04,
  'USDC': 1.00,
  'USDT': 1.00,
  'AURA': 0.00011566,
  'WBTC': 105000,
  'ETH': 3500
};

/**
 * Get balances for this wallet (all tokens, including AURA) using the Shyft API
 */
export async function getLiveWalletData(walletCfg: { name: string; address: string; }, apiKey: string) {
  const walletResult = await fetchWalletFromShyft(apiKey, walletCfg.address);
  const solBalance = walletResult.balance / 1e9; // in SOL
  let tokens: ShyftTokenBasic[] = walletResult.tokens || [];
  tokens = getTokensWithAura(tokens);

  // Attach SOL as a token
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

  // Go through all tokens, including AURA (mantains 0-balance if missing)
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

  const totalUsdValue = tokenBalances.reduce((sum, t) => sum + (t.usd_value || 0), 0);

  return {
    ...walletCfg,
    balances: tokenBalances,
    totalUsdValue
  };
}
