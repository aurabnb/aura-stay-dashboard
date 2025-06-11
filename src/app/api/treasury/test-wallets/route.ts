import { NextResponse } from 'next/server';
import { getRealTreasuryData } from '@/lib/services/realTreasuryService';

export async function GET() {
  try {
    console.log('Testing treasury wallet data fetch...');
    
    const treasuryData = await getRealTreasuryData();
    
    console.log(`Successfully fetched data for ${treasuryData.wallets.length} wallets`);
    
    // Log each wallet summary
    treasuryData.wallets.forEach((wallet, index) => {
      console.log(`Wallet ${index + 1}: ${wallet.name} (${wallet.blockchain})`);
      console.log(`  Address: ${wallet.address}`);
      console.log(`  Balances: ${wallet.balances.length} tokens`);
      console.log(`  Total USD Value: $${wallet.totalUsdValue.toFixed(2)}`);
      
      wallet.balances.forEach(balance => {
        console.log(`    ${balance.token_symbol}: ${balance.balance} (~$${balance.usd_value.toFixed(2)})`);
      });
    });
    
    return NextResponse.json({
      success: true,
      message: 'Treasury data fetched successfully',
      summary: {
        totalWallets: treasuryData.wallets.length,
        totalValue: treasuryData.treasury.totalMarketCap,
        volatileAssets: treasuryData.treasury.volatileAssets,
        hardAssets: treasuryData.treasury.hardAssets,
        lastUpdated: treasuryData.treasury.lastUpdated,
        solPrice: treasuryData.solPrice
      },
      wallets: treasuryData.wallets.map(wallet => ({
        name: wallet.name,
        blockchain: wallet.blockchain,
        address: wallet.address,
        totalValue: wallet.totalUsdValue,
        tokenCount: wallet.balances.length,
        tokens: wallet.balances.map(balance => ({
          symbol: balance.token_symbol,
          balance: balance.balance,
          usdValue: balance.usd_value
        }))
      }))
    });
  } catch (error) {
    console.error('Error testing treasury wallets:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to fetch treasury data'
    }, { status: 500 });
  }
} 