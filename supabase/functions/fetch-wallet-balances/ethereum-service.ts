
/**
 * Ethereum blockchain service for wallet balance fetching
 */

interface EthereumBalance {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  tokenAddress?: string;
  isLpToken: boolean;
  platform: string;
  lpDetails?: any;
}

const INFURA_URL = `https://mainnet.infura.io/v3/${Deno.env.get('INFURA_API_KEY')}`;

// LP token contracts - with corrected token order
const ETHEREUM_LP_CONTRACTS = [
  {
    address: "0x5281e311734869c64ca60ef047fd87759397efe6",
    name: "CULT-WETH LP",
    token0: "WETH", // token0 is WETH
    token1: "CULT", // token1 is CULT  
    token0Address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    token1Address: "0xf0f9d895aca5c8678f706fb8216fa22957685a13"
  }
];

const TOKEN_PRICES: Record<string, number> = {
  'ETH': 3500,
  'WETH': 3500,
  'CULT': 0.00001,
  'AURA': 0.00011566
};

async function ethRPC(method: string, params: any[]): Promise<any> {
  const response = await fetch(INFURA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    }),
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`Infura ${method} failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`Infura error: ${data.error.message}`);
  }

  return data.result;
}

async function getERC20Balance(tokenAddress: string, walletAddress: string): Promise<number> {
  const data = `0x70a08231000000000000000000000000${walletAddress.slice(2)}`;
  const result = await ethRPC('eth_call', [{
    to: tokenAddress,
    data
  }, 'latest']);
  
  return parseInt(result, 16) / 1e18;
}

async function getETHBalance(walletAddress: string): Promise<number> {
  const result = await ethRPC('eth_getBalance', [walletAddress, 'latest']);
  return parseInt(result, 16) / 1e18;
}

async function getLPTokenBalance(lpContract: string, walletAddress: string): Promise<number> {
  return await getERC20Balance(lpContract, walletAddress);
}

async function getLPTokenDetails(lpContract: any, walletAddress: string) {
  console.log(`Fetching LP details for ${lpContract.name} at ${lpContract.address}`);
  
  // Get LP token balance
  const lpBalance = await getLPTokenBalance(lpContract.address, walletAddress);
  console.log(`LP Balance for ${lpContract.name}: ${lpBalance}`);
  
  if (lpBalance === 0) {
    return null;
  }

  // Get total supply
  const totalSupplyData = `0x18160ddd`;
  const totalSupplyResult = await ethRPC('eth_call', [{
    to: lpContract.address,
    data: totalSupplyData
  }, 'latest']);
  const totalSupply = parseInt(totalSupplyResult, 16) / 1e18;

  // Get reserves
  const reservesData = `0x0902f1ac`;
  const reservesResult = await ethRPC('eth_call', [{
    to: lpContract.address,
    data: reservesData
  }, 'latest']);
  
  // Parse reserves (first two uint112 values)
  const reservesHex = reservesResult.slice(2).padStart(192, '0');
  const reserve0 = parseInt(reservesHex.slice(0, 64), 16) / 1e18; // WETH reserve
  const reserve1 = parseInt(reservesHex.slice(64, 128), 16) / 1e18; // CULT reserve

  // Calculate user share
  const userShare = totalSupply > 0 ? lpBalance / totalSupply : 0;
  
  // Calculate underlying amounts - user's portion of each token
  const userWethAmount = reserve0 * userShare;  // WETH (token0)
  const userCultAmount = reserve1 * userShare;  // CULT (token1)
  
  // Get token prices
  const wethPrice = TOKEN_PRICES['WETH'] || 0;
  const cultPrice = TOKEN_PRICES['CULT'] || 0;
  
  // Calculate USD values
  const wethUsdValue = userWethAmount * wethPrice;
  const cultUsdValue = userCultAmount * cultPrice;
  const totalUsdValue = wethUsdValue + cultUsdValue;

  console.log(`LP Details for ${lpContract.name}:
    - LP Balance: ${lpBalance}
    - Total Supply: ${totalSupply}
    - User Share: ${userShare}
    - Reserve0 (WETH): ${reserve0}
    - Reserve1 (CULT): ${reserve1}
    - User WETH: ${userWethAmount} (Price: $${wethPrice})
    - User CULT: ${userCultAmount} (Price: $${cultPrice})
    - WETH USD Value: $${wethUsdValue}
    - CULT USD Value: $${cultUsdValue}
    - Total USD Value: $${totalUsdValue}`);

  return {
    lpBalance,
    totalSupply,
    userShare,
    token1: {
      symbol: "WETH",
      amount: userWethAmount,
      usdValue: wethUsdValue
    },
    token2: {
      symbol: "CULT", 
      amount: userCultAmount,
      usdValue: cultUsdValue
    },
    priceRange: { min: 0, max: 0 },
    totalUsdValue,
    poolAddress: lpContract.address
  };
}

export async function getEthereumWalletBalances(address: string): Promise<EthereumBalance[]> {
  const balances: EthereumBalance[] = [];
  
  console.log(`Fetching Ethereum balances for: ${address}`);

  try {
    // Get ETH balance
    const ethBalance = await getETHBalance(address);
    if (ethBalance > 0) {
      const ethPrice = TOKEN_PRICES['ETH'];
      balances.push({
        symbol: 'ETH',
        name: 'Ethereum',
        balance: ethBalance,
        usdValue: ethBalance * ethPrice,
        isLpToken: false,
        platform: 'native'
      });
    }

    // Get CULT token balance
    const cultBalance = await getERC20Balance('0xf0f9d895aca5c8678f706fb8216fa22957685a13', address);
    if (cultBalance > 0) {
      const cultPrice = TOKEN_PRICES['CULT'];
      balances.push({
        symbol: 'CULT',
        name: 'Cult DAO',
        balance: cultBalance,
        usdValue: cultBalance * cultPrice,
        tokenAddress: '0xf0f9d895aca5c8678f706fb8216fa22957685a13',
        isLpToken: false,
        platform: 'erc20'
      });
    }

    // Check for LP tokens
    for (const lpContract of ETHEREUM_LP_CONTRACTS) {
      try {
        console.log(`Checking LP token: ${lpContract.name} at ${lpContract.address}`);
        const lpDetails = await getLPTokenDetails(lpContract, address);
        
        if (lpDetails && lpDetails.lpBalance > 0) {
          balances.push({
            symbol: `${lpContract.name}`,
            name: `${lpContract.name} Token`,
            balance: lpDetails.lpBalance,
            usdValue: lpDetails.totalUsdValue,
            tokenAddress: lpContract.address,
            isLpToken: true,
            platform: 'UniswapV2',
            lpDetails: lpDetails
          });
          
          console.log(`Added LP token: ${lpContract.name} with balance ${lpDetails.lpBalance} and USD value $${lpDetails.totalUsdValue}`);
        } else {
          console.log(`No balance found for LP token: ${lpContract.name}`);
        }
      } catch (error) {
        console.error(`Error processing LP token ${lpContract.name}:`, error);
      }
    }

  } catch (error) {
    console.error(`Error fetching Ethereum balances for ${address}:`, error);
  }

  console.log(`Final Ethereum balances for ${address}:`, balances.map(b => ({
    symbol: b.symbol,
    balance: b.balance,
    usdValue: b.usdValue,
    isLP: b.isLpToken
  })));

  return balances;
}
