export interface ShyftTokenBasic {
  address: string;
  balance: number;
  associated_account: string;
  info: {
    symbol: string;
    name: string;
    decimals: number;
    image?: string;
  };
}

// Fetch raw Shyft wallet data for an address, return tokens array
export async function fetchWalletFromShyft(apiKey: string, wallet: string) {
  const url = `https://api.shyft.to/sol/v1/wallet/balance?network=mainnet-beta&wallet=${wallet}`;
  const response = await fetch(url, {
    headers: { 'x-api-key': apiKey }
  });

  if (!response.ok) {
    throw new Error(`Shyft error [${response.status}]: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message ?? "Unknown error from Shyft");
  }
  return data.result;
}

// Helper to extract tokens, including AURA if present.
export function getTokensWithAura(tokens: ShyftTokenBasic[]): ShyftTokenBasic[] {
  // Ensure AURA appears even if balance is 0, but keep only one AURA entry if present.
  const auraMint = "3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe";
  const foundIndex = tokens.findIndex(t => t.address === auraMint);
  if (foundIndex === -1) {
    tokens.push({
      address: auraMint,
      balance: 0,
      associated_account: "",
      info: {
        symbol: "AURA",
        name: "AURA Token",
        decimals: 6
      }
    });
    console.log(`[getTokensWithAura] Injected missing AURA token for wallet`);
  } else {
    // Defensive: Fix decimals if missing
    if (!tokens[foundIndex].info.decimals) tokens[foundIndex].info.decimals = 6;
  }
  // LOG for debugging
  const auraToken = tokens.find(t => t.address === auraMint);
  if (auraToken) {
    console.log(`[getTokensWithAura] AURA entry:`, auraToken);
  }
  return tokens;
}
