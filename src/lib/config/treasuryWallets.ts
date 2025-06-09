// Treasury wallet configuration utility
// This replaces the NEXT_PUBLIC_TREASURY_WALLETS JSON array for Vercel compatibility

interface TreasuryWallet {
  name: string;
  address: string;
  blockchain: string;
}

// Function to build treasury wallets from individual environment variables
// This is more Vercel-friendly than JSON arrays in env vars
export function getTreasuryWallets(): TreasuryWallet[] {
  const wallets: TreasuryWallet[] = [];
  
  // Check for numbered wallet environment variables
  for (let i = 1; i <= 10; i++) {
    const name = process.env[`TREASURY_WALLET_${i}_NAME`];
    const address = process.env[`TREASURY_WALLET_${i}_ADDRESS`];
    const blockchain = process.env[`TREASURY_WALLET_${i}_BLOCKCHAIN`];
    
    if (name && address && blockchain) {
      wallets.push({ name, address, blockchain });
    }
  }
  
  // Fallback to hardcoded wallets if no env vars found (for development)
  if (wallets.length === 0) {
    return [
      {
        name: "Operations",
        address: "fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh",
        blockchain: "Solana"
      },
      {
        name: "Business Costs", 
        address: "Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg",
        blockchain: "Solana"
      },
      {
        name: "Marketing",
        address: "7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2", 
        blockchain: "Solana"
      },
      {
        name: "Project Funding - Solana",
        address: "Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i",
        blockchain: "Solana"
      },
      {
        name: "Project Funding - Ethereum", 
        address: "0xf05fc9a3c6011c76eb6fe4cbb956eeac8750306d",
        blockchain: "Ethereum"
      }
    ];
  }
  
  return wallets;
}

// Export individual treasury wallets for easy access
export const TREASURY_WALLETS = getTreasuryWallets(); 