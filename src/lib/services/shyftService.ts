
import { supabase } from '@/integrations/supabase/client'

export interface ShyftWalletData {
  wallet_id: string
  address: string
  name: string
  blockchain: string
  totalUsdValue: number
  balances: ShyftTokenBalance[]
}

export interface ShyftTokenBalance {
  token_symbol: string
  token_name: string
  token_address: string
  balance: number
  usd_value: number
  is_lp_token: boolean
  platform: string
  lp_details: any
}

export class ShyftService {
  // Trigger wallet sync via edge function
  static async syncWallets(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('sync-shyft-wallets')
      
      if (error) {
        throw new Error(error.message)
      }

      return { success: true, message: 'Wallets synced successfully' }
    } catch (error) {
      console.error('Error syncing wallets:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Get cached wallet data from Supabase
  static async getMonitoredWallets(): Promise<{ wallets: ShyftWalletData[]; error?: string }> {
    try {
      const { data: walletsData, error: walletsError } = await supabase
        .from('shyft_wallet_cache')
        .select('*')
        .order('total_usd_value', { ascending: false })

      if (walletsError) {
        throw new Error(walletsError.message)
      }

      const wallets: ShyftWalletData[] = []

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

        const formattedBalances: ShyftTokenBalance[] = (balances || []).map((balance: any) => ({
          token_symbol: balance.token_symbol || 'UNKNOWN',
          token_name: balance.token_name || 'Unknown Token',
          token_address: balance.token_address || '',
          balance: Number(balance.ui_amount) || 0,
          usd_value: Number(balance.usd_value) || 0,
          is_lp_token: false, // Shyft doesn't provide LP token info directly
          platform: balance.is_native ? 'native' : 'spl-token',
          lp_details: null,
        }))

        wallets.push({
          wallet_id: wallet.id,
          address: wallet.wallet_address,
          name: wallet.wallet_name || 'Unknown Wallet',
          blockchain: 'solana',
          totalUsdValue: Number(wallet.total_usd_value) || 0,
          balances: formattedBalances,
        })
      }

      return { wallets }
    } catch (error) {
      console.error('Error fetching monitored wallets:', error)
      return { 
        wallets: [], 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Get the last sync time
  static async getLastSyncTime(): Promise<Date | null> {
    try {
      const { data, error } = await supabase
        .from('shyft_wallet_cache')
        .select('last_updated')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        return null
      }

      return new Date(data.last_updated)
    } catch (error) {
      console.error('Error getting last sync time:', error)
      return null
    }
  }
}
