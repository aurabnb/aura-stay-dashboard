
import { TokenInfo } from './types.ts';
import { KNOWN_TOKENS, FIXED_PRICES } from './constants.ts';

const tokenCache = new Map<string, TokenInfo>();
const priceCache = new Map<string, { price: number; timestamp: number }>();

export async function getTokenInfo(mint: string): Promise<TokenInfo> {
  if (tokenCache.has(mint)) {
    return tokenCache.get(mint)!;
  }

  // Handle AURA token specifically
  if (mint === '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe') {
    const auraInfo: TokenInfo = {
      symbol: 'AURA',
      name: 'AURA Token',
      decimals: 6
    };
    tokenCache.set(mint, auraInfo);
    return auraInfo;
  }

  // Handle DCULT token (should display as CULT)
  if (mint === '0x2d77b594b9bbaed03221f7c63af8c4307432daf1') {
    const cultInfo: TokenInfo = {
      symbol: 'CULT',
      name: 'Cult DAO',
      decimals: 18
    };
    tokenCache.set(mint, cultInfo);
    return cultInfo;
  }

  // Alias DCULT to CULT if they share the same address
  if (mint === '0xf0f9d895aca5c8678f706fb8216fa22957685a13') {
    const cultInfo: TokenInfo = {
      symbol: 'CULT',
      name: 'Cult DAO',
      decimals: 18
    };
    tokenCache.set(mint, cultInfo);
    return cultInfo;
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

  // Handle AURA token price specifically
  if (tokenAddress === '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe') {
    const auraPrice = 0.00011566;
    priceCache.set(tokenAddress, { price: auraPrice, timestamp: Date.now() });
    console.log(`Fetched price for AURA token: $${auraPrice}`);
    return auraPrice;
  }

  // Handle DCULT token (price as CULT)
  if (tokenAddress === '0x2d77b594b9bbaed03221f7c63af8c4307432daf1') {
    const cultPrice = 0.00001;
    priceCache.set(tokenAddress, { price: cultPrice, timestamp: Date.now() });
    console.log(`Fetched price for DCULT token (as CULT): $${cultPrice}`);
    return cultPrice;
  }

  if (FIXED_PRICES[tokenAddress]) {
    const price = FIXED_PRICES[tokenAddress];
    priceCache.set(tokenAddress, { price, timestamp: Date.now() });
    console.log(`Fetched price for token ${tokenAddress}: $${price}`);
    return price;
  }

  return 0;
}
