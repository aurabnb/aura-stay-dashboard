import { Connection, PublicKey } from '@solana/web3.js'
import { prisma } from '@/lib/prisma'

export interface TokenBalance {
  symbol: string
  name: string
  balance: number
  usdValue: number
  tokenAddress?: string
  isLpToken: boolean
  platform: string
  lpDetails?: any
}

export interface WalletData {
  id: string
  name: string
  address: string
  blockchain: string
  balances: TokenBalance[]
  totalUsdValue: number
}

// Token configurations from the original system
export const KNOWN_TOKENS: Record<string, { symbol: string; name: string; decimals: number }> = {
  'So11111111111111111111111111111111111111112': {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9
  },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6
  },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6
  },
  '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe': {
    symbol: 'AURA',
    name: 'Aurora Ventures',
    decimals: 9
  },
  '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8
  },
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 8
  }
}

export const FIXED_PRICES: Record<string, number> = {
  '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe': 0.0002700, // AURA - updated to correct price
  '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': 105000, // WBTC
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': 3500, // ETH
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1, // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 1, // USDT
  '0xf0f9d895aca5c8678f706fb8216fa22957685a13': 0.00001 // CULT on Ethereum
}

class WalletService {
  private connection: Connection

  constructor() {
    this.connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
  }

  // Fetch wallet balances from blockchain and update database
  async fetchAndUpdateWalletBalances(walletId: string): Promise<TokenBalance[]> {
    try {
      // Get wallet from database
      const wallet = await prisma.wallet.findUnique({
        where: { id: walletId }
      })

      if (!wallet) {
        throw new Error(`Wallet not found: ${walletId}`)
      }

      // Fetch live balances based on blockchain
      let balances: TokenBalance[] = []
      
      if (wallet.blockchain === 'Solana') {
        balances = await this.fetchSolanaBalances(wallet.address)
      } else if (wallet.blockchain === 'Ethereum') {
        balances = await this.fetchEthereumBalances(wallet.address)
      }

      // Update database with new balances
      await this.updateWalletBalancesInDb(walletId, balances)

      return balances
    } catch (error) {
      console.error(`Error fetching balances for wallet ${walletId}:`, error)
      return []
    }
  }

  // Fetch Solana wallet balances
  private async fetchSolanaBalances(address: string): Promise<TokenBalance[]> {
    const balances: TokenBalance[] = []

    try {
      const publicKey = new PublicKey(address)

      // Fetch SOL balance
      const solBalance = await this.connection.getBalance(publicKey)
      const solBalanceNum = solBalance / 1e9
      const solPrice = await this.getSolPrice()

      balances.push({
        symbol: 'SOL',
        name: 'Solana',
        balance: solBalanceNum,
        usdValue: solBalanceNum * solPrice,
        isLpToken: false,
        platform: 'native'
      })

      // Fetch SPL token balances
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      )

      for (const account of tokenAccounts.value) {
        const tokenInfo = account.account.data.parsed.info
        const mint = tokenInfo.mint
        const balance = parseFloat(tokenInfo.tokenAmount.uiAmount || '0')

        if (balance > 0 && KNOWN_TOKENS[mint]) {
          const tokenMeta = KNOWN_TOKENS[mint]
          const tokenPrice = FIXED_PRICES[mint] || 0

          balances.push({
            symbol: tokenMeta.symbol,
            name: tokenMeta.name,
            balance: balance,
            usdValue: balance * tokenPrice,
            tokenAddress: mint,
            isLpToken: false,
            platform: 'spl-token'
          })
        }
      }
    } catch (error) {
      console.error('Error fetching Solana balances:', error)
    }

    return balances
  }

  // Fetch Ethereum wallet balances (simplified)
  private async fetchEthereumBalances(address: string): Promise<TokenBalance[]> {
    const balances: TokenBalance[] = []

    try {
      // This would require Ethereum RPC calls
      // For now, return empty array or implement with Infura/Alchemy
      console.log(`Ethereum balance fetching not implemented for ${address}`)
    } catch (error) {
      console.error('Error fetching Ethereum balances:', error)
    }

    return balances
  }

  // Update wallet balances in database
  private async updateWalletBalancesInDb(walletId: string, balances: TokenBalance[]) {
    try {
      // Delete existing balances
      await prisma.walletBalance.deleteMany({
        where: { walletId }
      })

      // Insert new balances
      const balanceRecords = balances.map(balance => ({
        walletId,
        tokenSymbol: balance.symbol,
        tokenName: balance.name,
        tokenAddress: balance.tokenAddress,
        balance: balance.balance,
        usdValue: balance.usdValue,
        isLpToken: balance.isLpToken,
        platform: balance.platform,
        lpDetails: balance.lpDetails,
        lastUpdated: new Date()
      }))

      await prisma.walletBalance.createMany({
        data: balanceRecords
      })
    } catch (error) {
      console.error('Error updating wallet balances in database:', error)
      throw error
    }
  }

  // Get all wallets with their balances from database
  async getAllWalletsWithBalances(): Promise<WalletData[]> {
    try {
      const wallets = await prisma.wallet.findMany({
        include: {
          balances: true
        }
      })

      return wallets.map(wallet => ({
        id: wallet.id,
        name: wallet.name,
        address: wallet.address,
        blockchain: wallet.blockchain,
        balances: wallet.balances.map(balance => ({
          symbol: balance.tokenSymbol,
          name: balance.tokenName || '',
          balance: balance.balance,
          usdValue: balance.usdValue || 0,
          tokenAddress: balance.tokenAddress || undefined,
          isLpToken: balance.isLpToken || false,
          platform: balance.platform || '',
          lpDetails: balance.lpDetails
        })),
        totalUsdValue: wallet.balances.reduce((sum, balance) => sum + (balance.usdValue || 0), 0)
      }))
    } catch (error) {
      console.error('Error fetching wallets with balances:', error)
      return []
    }
  }

  // Get SOL price from our API route
  private async getSolPrice(): Promise<number> {
    try {
      const response = await fetch('/api/sol-price')
      const data = await response.json()
      return data.price || 0
    } catch (error) {
      console.error('Error fetching SOL price:', error)
      return 0
    }
  }

  // Seed database with initial wallet configurations
  async seedWallets() {
    const walletConfigs = [
      {
        name: 'Operations',
        address: 'fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh',
        blockchain: 'Solana',
        walletType: 'treasury',
        explorerUrl: 'https://solscan.io/account/fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh'
      },
      {
        name: 'Business Costs',
        address: 'Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg',
        blockchain: 'Solana',
        walletType: 'treasury',
        explorerUrl: 'https://solscan.io/account/Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg'
      },
      {
        name: 'Marketing',
        address: '7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2',
        blockchain: 'Solana',
        walletType: 'treasury',
        explorerUrl: 'https://solscan.io/account/7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2'
      },
      {
        name: 'Project Funding - Solana',
        address: 'Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i',
        blockchain: 'Solana',
        walletType: 'treasury',
        explorerUrl: 'https://solscan.io/account/Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i'
      },
      {
        name: 'Project Funding - Ethereum',
        address: '0xf05fc9a3c6011c76eb6fe4cbb956eeac8750306d',
        blockchain: 'Ethereum',
        walletType: 'treasury',
        explorerUrl: 'https://etherscan.io/address/0xf05fc9a3c6011c76eb6fe4cbb956eeac8750306d'
      }
    ]

    for (const config of walletConfigs) {
      await prisma.wallet.upsert({
        where: { address: config.address },
        update: config,
        create: config
      })
    }
  }
}

export const walletService = new WalletService() 