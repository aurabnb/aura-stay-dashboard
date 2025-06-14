
import { Connection, PublicKey } from '@solana/web3.js'

// Define types for the wallet service
export type WalletOverview = {
  totalValueUSD: number
  solBalance: number
  auraBalance: number
  tokenCount: number
  isActive: boolean
}

export type WalletBalance = {
  symbol: string
  name: string
  uiAmount: number
  valueUSD: number
  logo?: string
}

export type WalletTransaction = {
  signature: string
  type: 'stake' | 'unstake' | 'swap' | 'send' | 'other' | 'receive'
  amount: number
  token: string
  blockTime: number
  fee: number
  status: 'success' | 'failed'
}

export type TokenMetrics = {
  price: number
  priceChange24h: number
  marketCap: number
  volume24h: number
  holders: number
}

export type Transaction = {
  signature: string
  timestamp: number
  type: 'stake' | 'unstake' | 'swap' | 'send' | 'other' | 'receive'
  amount: number
  token: string
  from: string
  to: string
  fee: number
  status: 'success' | 'failed'
}

export const calculatePortfolioValue = (wallets: any[]): number => {
  return wallets.reduce((total: number, wallet: any) => {
    const walletValue = wallet.balances?.reduce((sum: number, balance: any) => 
      sum + (balance.usdValue || 0), 0
    ) || 0
    return total + walletValue
  }, 0)
}

// Mock wallet service functions for demo purposes
export async function getWalletOverview(walletAddress: string): Promise<WalletOverview> {
  // Mock data - replace with Shyft API later
  return {
    totalValueUSD: 12750.50,
    solBalance: 45.2341,
    auraBalance: 15000,
    tokenCount: 8,
    isActive: true
  }
}

export async function getWalletBalances(walletAddress: string): Promise<WalletBalance[]> {
  // Mock data - replace with Shyft API later
  return [
    {
      symbol: 'SOL',
      name: 'Solana',
      uiAmount: 45.2341,
      valueUSD: 9500.25,
      logo: '/logos/sol.png'
    },
    {
      symbol: 'AURA',
      name: 'Aura Token',
      uiAmount: 15000,
      valueUSD: 3250.25,
      logo: '/logos/aura.png'
    }
  ]
}

export async function getWalletTransactions(walletAddress: string, limit: number = 20): Promise<WalletTransaction[]> {
  // Mock data - replace with Shyft API later
  return [
    {
      signature: 'abc123def456',
      type: 'receive',
      amount: 10.5,
      token: 'SOL',
      blockTime: Date.now() / 1000 - 3600,
      fee: 0.00025,
      status: 'success'
    },
    {
      signature: 'def789ghi012',
      type: 'stake',
      amount: 5000,
      token: 'AURA',
      blockTime: Date.now() / 1000 - 7200,
      fee: 0.00015,
      status: 'success'
    }
  ]
}

export async function getTokenMetrics(): Promise<TokenMetrics> {
  // Mock data - replace with Shyft API later
  return {
    price: 0.000245,
    priceChange24h: 5.2,
    marketCap: 2450000,
    volume24h: 125000,
    holders: 1250
  }
}

export async function getTransactionHistory(walletAddress: string): Promise<Transaction[]> {
  try {
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    )
    const publicKey = new PublicKey(walletAddress)
    
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 50 })
    
    const transactions: Transaction[] = await Promise.all(
      signatures.map(async (sig) => {
        try {
          const tx = await connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          })
          
          if (!tx) {
            return {
              signature: sig.signature,
              timestamp: sig.blockTime || Date.now() / 1000,
              type: 'other' as const,
              amount: 0,
              token: 'SOL',
              from: walletAddress,
              to: 'unknown',
              fee: 0,
              status: sig.err ? 'failed' : 'success'
            }
          }

          // Determine transaction type based on instructions
          let transactionType: 'stake' | 'unstake' | 'swap' | 'send' | 'other' | 'receive' = 'other'
          if (tx.meta?.logMessages?.some(log => log.includes('stake'))) {
            transactionType = 'stake'
          } else if (tx.meta?.logMessages?.some(log => log.includes('unstake'))) {
            transactionType = 'unstake'
          } else if (tx.meta?.logMessages?.some(log => log.includes('swap'))) {
            transactionType = 'swap'
          } else if (tx.meta?.preBalances?.[0] !== tx.meta?.postBalances?.[0]) {
            const preBalance = tx.meta?.preBalances?.[0] || 0
            const postBalance = tx.meta?.postBalances?.[0] || 0
            transactionType = preBalance > postBalance ? 'send' : 'receive'
          }

          const preBalance = tx.meta?.preBalances?.[0] || 0
          const postBalance = tx.meta?.postBalances?.[0] || 0

          return {
            signature: sig.signature,
            timestamp: sig.blockTime || Date.now() / 1000,
            type: transactionType,
            amount: Math.abs(preBalance - postBalance) / 1e9,
            token: 'SOL',
            from: walletAddress,
            to: 'unknown',
            fee: (tx.meta?.fee || 0) / 1e9,
            status: sig.err ? 'failed' : 'success'
          }
        } catch (error) {
          console.error('Error processing transaction:', error)
          return {
            signature: sig.signature,
            timestamp: sig.blockTime || Date.now() / 1000,
            type: 'other' as const,
            amount: 0,
            token: 'SOL',
            from: walletAddress,
            to: 'unknown',
            fee: 0,
            status: 'failed'
          }
        }
      })
    )

    return transactions.filter(tx => tx !== null)
  } catch (error) {
    console.error('Error fetching transaction history:', error)
    return []
  }
}
