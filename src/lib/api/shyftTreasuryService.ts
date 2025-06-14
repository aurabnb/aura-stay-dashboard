
import { supabase } from '@/integrations/supabase/client'
import type { ConsolidatedData, WalletData } from '@/types/treasury'

export interface ShyftTreasuryData {
  totalMarketCap: number
  volatileAssets: number
  hardAssets: number
  solPrice: number
  lastUpdated: string
}

export class ShyftTreasuryService {
  // Sync wallets and get live data from Shyft
  static async syncAndGetLiveData(): Promise<{ success: boolean; data?: ShyftTreasuryData; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('sync-shyft-wallets')
      
      if (error) {
        throw new Error(error.message)
      }

      if (data?.summary) {
        return {
          success: true,
          data: {
            totalMarketCap: data.summary.totalUsdValue || 0,
            volatileAssets: data.summary.volatileAssets || 0,
            hardAssets: data.summary.hardAssets || 0,
            solPrice: data.summary.solPrice || 0,
            lastUpdated: data.syncedAt,
          }
        }
      }

      return { success: false, error: 'No summary data received' }
    } catch (error) {
      console.error('Error syncing Shyft data:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Get cached data from Supabase (faster for frequent requests)
  static async getCachedTreasuryData(): Promise<{ success: boolean; data?: ConsolidatedData; error?: string }> {
    try {
      // Get wallet cache data
      const { data: walletsData, error: walletsError } = await supabase
        .from('shyft_wallet_cache')
        .select('*')
        .order('total_usd_value', { ascending: false })

      if (walletsError) {
        throw new Error(walletsError.message)
      }

      const wallets: WalletData[] = []
      let totalMarketCap = 0
      let volatileAssets = 0
      let hardAssets = 0

      for (const wallet of walletsData || []) {
        // Get token balances for this wallet
        const { data: balances, error: balancesError } = await supabase
          .from('shyft_token_balances')
          .select('*')
          .eq('wallet_address', wallet.wallet_address)
          .order('usd_value', { ascending: false })

        if (balancesError) {
          console.error(`Error fetching balances for ${wallet.wallet_address}:`, balancesError)
          continue
        }

        const formattedBalances = (balances || []).map((balance: any) => ({
          token_symbol: balance.token_symbol || 'UNKNOWN',
          token_name: balance.token_name || 'Unknown Token',
          balance: Number(balance.ui_amount) || 0,
          usd_value: Number(balance.usd_value) || 0,
          token_address: balance.token_address || '',
          is_lp_token: false,
          platform: balance.is_native ? 'native' : 'spl-token',
        }))

        // Calculate totals
        const walletValue = Number(wallet.total_usd_value) || 0
        totalMarketCap += walletValue

        // Categorize assets
        for (const balance of balances || []) {
          const value = Number(balance.usd_value) || 0
          if (['USDC', 'USDT'].includes(balance.token_symbol)) {
            hardAssets += value
          } else {
            volatileAssets += value
          }
        }

        wallets.push({
          wallet_id: wallet.id,
          address: wallet.wallet_address,
          name: wallet.wallet_name || 'Unknown Wallet',
          blockchain: 'solana',
          balances: formattedBalances,
          totalUsdValue: walletValue,
        })
      }

      // Get SOL price from most recent sync
      const solPrice = walletsData?.[0]?.raw_data?.result?.native_balance?.ui_amount ? 100 : 100 // Fallback

      return {
        success: true,
        data: {
          treasury: {
            totalMarketCap,
            volatileAssets,
            hardAssets,
            lastUpdated: walletsData?.[0]?.last_updated || new Date().toISOString(),
          },
          wallets,
          solPrice,
        }
      }
    } catch (error) {
      console.error('Error fetching cached treasury data:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}
