
/**
 * Ethereum/EVM helpers for ERC-20 balance and UniswapV2 LP detection
 * - Only implements what's needed for Project Funding (Ethereum) wallet
 */

const INFURA_URL = `https://mainnet.infura.io/v3/${Deno.env.get('INFURA_API_KEY')}`;
const ERC20_ABI_BALANCEOF = "0x70a08231";
const UNISWAPV2_ABI_RESERVES = "0x0902f1ac";
const UNISWAPV2_ABI_TOTALSUPPLY = "0x18160ddd";

// Known contract addresses
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const CULT = "0xf0f9d895aca5c8678f706fb8216fa22957685a13";

// Allow dynamic LP contracts via array
export const UNISWAPV2_LP_CONTRACTS = [
  // Main CULT-WETH LP (legacy)
  "0x63F659b6a154b2bB88B501eEcA62141883b8bEe8",
  // AURA-WETH Uniswap V2 LP (from your etherscan link)
  "0x5281e311734869c64ca60ef047fd87759397efe6",
];

// LP token definitions for user-friendly naming and underlying pairs
export const LP_META = {
  "0x63F659b6a154b2bB88B501eEcA62141883b8bEe8": { symbol: "WETH-CULT", name: "WETH-CULT UniV2 LP", token0: "WETH", token1: "CULT" },
  "0x5281e311734869c64ca60ef047fd87759397efe6": { symbol: "AURA-WETH", name: "AURA-WETH UniV2 LP", token0: "WETH", token1: "AURA" },
};

async function eth_rpc(method: string, params: any[], id: number = 1) {
  const resp = await fetch(INFURA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!resp.ok) throw new Error(`Infura ${method} failed: ${resp.status}`);
  const out = await resp.json();
  if (out.error) throw new Error(`Infura error: ${out.error.message}`);
  return out.result;
}

// Basic ERC-20 balanceOf
export async function fetchERC20Balance(token: string, wallet: string): Promise<number> {
  // data: function selector + wallet address (20 bytes, no 0x prefix)
  const data = ERC20_ABI_BALANCEOF + wallet.replace(/^0x/, "").padStart(64, "0");
  const result = await eth_rpc("eth_call", [{
    to: token, data
  }, "latest"]);
  return parseInt(result, 16) / 1e18;
}

export async function fetchEthBalance(wallet: string): Promise<number> {
  const result = await eth_rpc("eth_getBalance", [wallet, "latest"]);
  return parseInt(result, 16) / 1e18;
}

// UniswapV2 LP info fetch for any supported LP
export async function fetchUniV2LpData(lpContract: string, wallet: string) {
  const meta = LP_META[lpContract] || { symbol: "UNI-V2", name: "UniswapV2 LP", token0: "Token0", token1: "Token1" };
  
  // LP balance
  const lpBalanceRaw = await eth_rpc("eth_call", [{
    to: lpContract,
    data: ERC20_ABI_BALANCEOF + wallet.replace(/^0x/, "").padStart(64, "0"),
  }, "latest"]);
  const lpBalance = parseInt(lpBalanceRaw, 16) / 1e18;
  
  // totalSupply
  const totalSupplyRaw = await eth_rpc("eth_call", [{
    to: lpContract,
    data: UNISWAPV2_ABI_TOTALSUPPLY
  }, "latest"]);
  const totalSupply = parseInt(totalSupplyRaw, 16) / 1e18;
  
  // reserves (first two)
  const reservesRaw = await eth_rpc("eth_call", [{
    to: lpContract,
    data: UNISWAPV2_ABI_RESERVES
  }, "latest"]);
  const reservesData = reservesRaw.slice(2).padStart(192, "0");
  const reserve0 = parseInt(reservesData.slice(0, 64), 16) / 1e18;
  const reserve1 = parseInt(reservesData.slice(64, 128), 16) / 1e18;
  
  // User share
  const userShare = totalSupply > 0 ? lpBalance / totalSupply : 0;
  
  return { lpBalance, totalSupply, reserve0, reserve1, userShare, ...meta, lpContract };
}
