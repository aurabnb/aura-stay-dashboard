
import { TokenInfo } from './types.ts';
import { KNOWN_TOKENS, FIXED_PRICES } from './constants.ts';

const tokenCache = new Map<string, TokenInfo>();
const priceCache = new Map<string, { price: number; timestamp: number }>();

export async function getTokenInfo(mint: string): Promise<TokenInfo> {
  if (tokenCache.has(mint)) {
    return tokenCache.get(mint)!;
  }

  if (KNOWN_TOKENS[mint]) {
    tokenCache.set(mint, KNOWN_TOKENS[mint]);
    return KNOWN_TOKENS[mint];
  }

  const fallbackInfo: TokenInfo = {
    symbol: 'UNK',
    name: 'Unknown Token',
    decimals: 9
  };
  tokenCache.set(mint, fallbackInfo);
  return fallbackInfo;
}

export async function getTokenPrice(tokenAddress: string): Promise<number> {
  const cached = priceCache.get(tokenAddress);
  if (cached && Date.now() - cached.timestamp < 600000) {
    return cached.price;
  }

  if (FIXED_PRICES[tokenAddress]) {
    const price = FIXED_PRICES[tokenAddress];
    priceCache.set(tokenAddress, { price, timestamp: Date.now() });
    return price;
  }

  return 0;
}
