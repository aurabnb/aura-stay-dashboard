import React, { useState, useEffect } from 'react';

// --- CONFIG ---
// List your monitored wallet addresses here
// Fill in your real wallet addresses below:
const MONITORED_WALLETS = [
  { name: 'Operations', address: 'fa1ro8lT7gSdZSn7XTz6a3zNquphpGlEh7omB2f6GTh' },
  { name: 'Business Costs', address: 'Hxa3IlrmJq2fEDmc4gETZDdAPhQ6HyWqn2Es3vVKkFg' },
  { name: 'Marketing', address: '7QapFoyM5VPGMuycCCdaYUoe29c8EzadJkJYBDKKFf4DN2' },
  { name: 'Project Funding - Solana', address: 'Aftv2wfPusikfHFwdklFNpsmrFEgrBheHXo6jS4LkM8i' },
];



// --- API ENDPOINTS ---
const SOLSCAN_API = 'https://pro-api.solscan.io/v2.0';
const JUPITER_API = 'https://lite-api.jup.ag/price/v2';
const METEORA_API = 'https://dlmm-api.meteora.ag/pool';

// --- ENV ---
const SOLSCAN_API_KEY = process.env.REACT_APP_SOLSCAN_API_KEY;

// --- COMPONENT ---
const MonitoredWallets: React.FC = () => {
  // --- STATE ---
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- HELPERS ---
  const formatCurrency = (value: number) => {
    if (isNaN(value) || value === null || value === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // --- API HELPERS ---
async function fetchSolscanTokens(address: string) {
  const url = `${SOLSCAN_API}/account/tokens?address=${address}`;
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${SOLSCAN_API_KEY}` },
  });
  if (!resp.ok) throw new Error(`Solscan error: ${resp.status}`);
  return resp.json();
}

async function fetchSolscanSol(address: string) {
  const url = `${SOLSCAN_API}/account/${address}`;
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${SOLSCAN_API_KEY}` },
  });
  if (!resp.ok) throw new Error(`Solscan error: ${resp.status}`);
  return resp.json();
}

async function fetchJupiterPrices(mints: string[]): Promise<Record<string, { price: number }>> {
  if (!mints.length) return {};
  const ids = mints.join(',');
  const url = `${JUPITER_API}?ids=${ids}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Jupiter error: ${resp.status}`);
  const data = await resp.json();
  return data.data || {};
}

async function fetchMeteoraPool(poolAddress: string) {
  const url = `${METEORA_API}/${poolAddress}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Meteora error: ${resp.status}`);
  return resp.json();
}

// --- FETCH LOGIC ---
useEffect(() => {
  const fetchAllWallets = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch balances for each wallet from Solscan
      const walletsData = [];
      let allMints = new Set<string>();
      for (const wallet of MONITORED_WALLETS) {
        // Fetch SOL balance
        const solData = await fetchSolscanSol(wallet.address);
        // Fetch SPL tokens
        const tokensData = await fetchSolscanTokens(wallet.address);
        // Gather all mints
        tokensData.data?.forEach((token: any) => allMints.add(token.tokenAddress));
        // Add SOL mint
        allMints.add('So11111111111111111111111111111111111111112');
        walletsData.push({
          ...wallet,
          sol: solData,
          tokens: tokensData.data || [],
        });
      }
      // 2. Fetch prices from Jupiter
      const prices = await fetchJupiterPrices(Array.from(allMints));
      // 3. Identify LP tokens and fetch pool info from Meteora (to be implemented)
      // 4. Aggregate and set state (to be implemented)
      setWallets(walletsData); // TEMP: set raw data for now
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };
  fetchAllWallets();
}, []);


  // --- RENDER ---
  if (loading) return <div>Loading monitored wallets...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  return (
    <div>
      {wallets.map((wallet, idx) => {
        // Prepare token rows: include SOL and all SPL tokens
        const rows = [];
        // Add SOL
        if (wallet.sol && wallet.sol.lamports !== undefined) {
          const solBalance = wallet.sol.lamports / 1e9;
          rows.push({
            symbol: 'SOL',
            balance: solBalance,
            usd: wallet.sol.price ? solBalance * wallet.sol.price : undefined, // fallback if price is fetched
          });
        }
        // Add SPL tokens
        wallet.tokens.forEach((token: any) => {
          rows.push({
            symbol: token.tokenSymbol || token.tokenName || token.tokenAddress,
            balance: token.tokenAmount.uiAmount,
            usd: undefined, // to be filled in future with Jupiter price
          });
        });
        // Calculate total USD (currently just SOL, will expand with pricing logic)
        const totalUsd = rows.reduce((sum, row) => sum + (row.usd || 0), 0);
        return (
          <div key={wallet.address} style={{ marginBottom: 32, border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 4 }}>{wallet.name} <span style={{ fontSize: 12, background: '#e5e7eb', borderRadius: 6, padding: '2px 8px', marginLeft: 8 }}>Solana</span></div>
            <div style={{ fontSize: 13, color: '#444', marginBottom: 8 }}>{wallet.address}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '8px 4px', fontWeight: 500 }}>Token</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 500 }}>Balance</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 500 }}>USD Value</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.symbol + i}>
                    <td style={{ padding: '8px 4px' }}>{row.symbol}</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{row.balance}</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{row.usd !== undefined ? formatCurrency(row.usd) : '-'}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid #e5e7eb', background: '#f9f9f9' }}>
                  <td style={{ padding: '8px 4px', fontWeight: 700 }}>Total</td>
                  <td></td>
                  <td style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 700 }}>{formatCurrency(totalUsd)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default MonitoredWallets;
      setError(null);
      const { data: responseData, error: fetchError } = await supabase.functions.invoke('fetch-wallet-balances');
