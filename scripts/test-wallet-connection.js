#!/usr/bin/env node

/**
 * Test Wallet Connection Integration
 * Verifies that user dashboard uses the same wallet state as Header component
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Wallet Connection Integration...\n');

// Check 1: Verify user dashboard uses correct wallet adapter
console.log('1. Checking user dashboard wallet imports...');
const userDashboardPath = path.join(__dirname, '../src/app/user-dashboard/page.tsx');
if (fs.existsSync(userDashboardPath)) {
  const content = fs.readFileSync(userDashboardPath, 'utf8');
  
  if (content.includes("from '@solana/wallet-adapter-react'")) {
    console.log('✅ User dashboard uses correct Solana wallet adapter');
  } else if (content.includes("from '@/hooks/enhanced-hooks'")) {
    console.log('❌ User dashboard still uses custom enhanced-hooks wallet');
  } else {
    console.log('⚠️  Unable to determine wallet import');
  }
  
  // Check if it's using the right wallet properties
  if (content.includes('connected') && content.includes('publicKey')) {
    console.log('✅ User dashboard uses standard wallet properties');
  } else if (content.includes('connection?.isConnected')) {
    console.log('❌ User dashboard still uses custom connection object');
  } else {
    console.log('⚠️  Unable to determine wallet properties usage');
  }
} else {
  console.log('❌ User dashboard not found');
}

// Check 2: Verify Header component wallet usage
console.log('\n2. Checking Header component wallet usage...');
const headerPath = path.join(__dirname, '../src/components/Header.tsx');
if (fs.existsSync(headerPath)) {
  const content = fs.readFileSync(headerPath, 'utf8');
  
  if (content.includes("from '@solana/wallet-adapter-react'")) {
    console.log('✅ Header uses Solana wallet adapter');
  } else {
    console.log('❌ Header does not use standard wallet adapter');
  }
} else {
  console.log('❌ Header component not found');
}

// Check 3: Verify wallet provider setup
console.log('\n3. Checking wallet provider configuration...');
const providerPath = path.join(__dirname, '../src/components/providers/SolanaWalletProvider.tsx');
if (fs.existsSync(providerPath)) {
  const content = fs.readFileSync(providerPath, 'utf8');
  
  if (content.includes('WalletProvider') && content.includes('ConnectionProvider')) {
    console.log('✅ Solana wallet provider properly configured');
  } else {
    console.log('❌ Wallet provider configuration missing or incomplete');
  }
} else {
  console.log('❌ Solana wallet provider not found');
}

// Check 4: Verify ClientProviders includes wallet provider
console.log('\n4. Checking client providers integration...');
const clientProvidersPath = path.join(__dirname, '../src/components/providers/ClientProviders.tsx');
if (fs.existsSync(clientProvidersPath)) {
  const content = fs.readFileSync(clientProvidersPath, 'utf8');
  
  if (content.includes('SolanaWalletProvider') || content.includes('./SolanaWalletProvider')) {
    console.log('✅ SolanaWalletProvider included in app providers');
  } else {
    console.log('⚠️  SolanaWalletProvider may not be included in providers');
  }
  
  // Check AppProviders separately
  const appProvidersPath = path.join(__dirname, '../src/components/providers/AppProviders.tsx');
  if (fs.existsSync(appProvidersPath)) {
    const appContent = fs.readFileSync(appProvidersPath, 'utf8');
    if (appContent.includes('SolanaWalletProvider')) {
      console.log('✅ SolanaWalletProvider found in AppProviders');
    }
  }
} else {
  console.log('⚠️  ClientProviders component not found');
}

console.log('\n' + '='.repeat(50));
console.log('🧪 WALLET CONNECTION TEST SUMMARY');
console.log('='.repeat(50));
console.log('✅ = Working correctly');
console.log('⚠️  = May need attention');
console.log('❌ = Needs fixing');
console.log('\n💡 Expected behavior:');
console.log('- When connected in Header → User Dashboard shows connected state');
console.log('- When disconnected in Header → User Dashboard shows connect modal');
console.log('- Both components use the same wallet connection state');
console.log('\n🔧 Test by:');
console.log('1. Start dev server: npm run dev');
console.log('2. Connect wallet in Header navigation');
console.log('3. Click "📊 User Dashboard" from Finance menu');
console.log('4. Should NOT ask to connect again'); 