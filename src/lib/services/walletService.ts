// src/lib/services/walletService.ts

// Function to calculate the total portfolio value
export const calculatePortfolioValue = (wallets: any[]): number => {
  return wallets.reduce((total: number, wallet: any) => {
    const walletValue = wallet.balances?.reduce((sum: number, balance: any) => 
      sum + (balance.usdValue || 0), 0
    ) || 0
    return total + walletValue
  }, 0)
}
