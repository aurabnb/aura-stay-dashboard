import { Connection, PublicKey } from '@solana/web3.js'

// Define a type for transaction history
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

export async function getTransactionHistory(walletAddress: string): Promise<Transaction[]> {
  try {
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || '',
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
            transactionType = tx.meta.preBalances[0] > tx.meta.postBalances[0] ? 'send' : 'receive'
          }

          return {
            signature: sig.signature,
            timestamp: sig.blockTime || Date.now() / 1000,
            type: transactionType,
            amount: Math.abs((tx.meta?.preBalances?.[0] || 0) - (tx.meta?.postBalances?.[0] || 0)) / 1e9,
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
