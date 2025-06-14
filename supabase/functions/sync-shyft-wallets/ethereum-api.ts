
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
const UNISWAPV2_WETH_CULT_LP = "0x63F659b6a154b2bB88B501eEcA62141883b8bEe8"; // Hypothetical, replace with correct if needed

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

// UniswapV2 LP info fetch (totalSupply, reserves, and wallet LP balance)
export async function fetchWethCultLpData(wallet: string) {
  // Get wallet's LP token balance
  const lpBalanceRaw = await eth_rpc("eth_call", [{
    to: UNISWAPV2_WETH_CULT_LP,
    data: ERC20_ABI_BALANCEOF + wallet.replace(/^0x/, "").padStart(64, "0"),
  }, "latest"]);
  const lpBalance = parseInt(lpBalanceRaw, 16) / 1e18;

  // Get totalSupply
  const totalSupplyRaw = await eth_rpc("eth_call", [{
    to: UNISWAPV2_WETH_CULT_LP,
    data: UNISWAPV2_ABI_TOTALSUPPLY
  }, "latest"]);
  const totalSupply = parseInt(totalSupplyRaw, 16) / 1e18;

  // Get reserves (returns bytes, decode first 2 uint112=>WETH/CULT)
  const reservesRaw = await eth_rpc("eth_call", [{
    to: UNISWAPV2_WETH_CULT_LP,
    data: UNISWAPV2_ABI_RESERVES
  }, "latest"]);
  const reservesData = reservesRaw.slice(2).padStart(192, "0");
  const reserve0 = parseInt(reservesData.slice(0, 64), 16) / 1e18; // WETH
  const reserve1 = parseInt(reservesData.slice(64, 128), 16) / 1e18; // CULT

  // User share
  const userShare = totalSupply > 0 ? lpBalance / totalSupply : 0;
  return { lpBalance, totalSupply, reserve0, reserve1, userShare };
}

