import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import WalletDashboard from '../components/WalletDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, Zap, TrendingUp } from 'lucide-react';

const WalletHubPage = () => {
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing wallet connection
    const phantom = (window as any).phantom?.solana;
    if (phantom?.isConnected && phantom?.publicKey) {
      setConnectedWallet(phantom.publicKey.toString());
    }
  }, []);

  const connectWallet = async (type: 'phantom' | 'solflare') => {
    const provider = type === 'phantom' 
      ? (window as any).phantom?.solana 
      : (window as any).solflare;

    if (!provider) {
      window.open(
        type === 'phantom' ? 'https://phantom.app/' : 'https://solflare.com/',
        '_blank'
      );
      return;
    }

    try {
      const { publicKey } = await provider.connect();
      setConnectedWallet(publicKey.toString());
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const disconnectWallet = async () => {
    setConnectedWallet(null);
    try {
      const phantom = (window as any).phantom?.solana;
      if (phantom?.disconnect) {
        await phantom.disconnect();
      }
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Advanced Wallet Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect your Solana wallet to view real balances, transaction history, 
            and live market data with advanced portfolio analytics.
          </p>
        </div>

        {!connectedWallet ? (
          <div className="space-y-8">
            {/* Features Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="mb-2">Real-Time Data</CardTitle>
                  <CardDescription>
                    Live wallet balances, token prices, and market metrics 
                    updated every 30 seconds
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="mb-2">Secure Connection</CardTitle>
                  <CardDescription>
                    Direct blockchain integration with no data stored on our servers. 
                    Your keys, your control.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="mb-2">Advanced Analytics</CardTitle>
                  <CardDescription>
                    Portfolio tracking, transaction history, and AURA-specific 
                    burn redistribution metrics
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Connection Options */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Wallet className="h-6 w-6" />
                  Connect Your Wallet
                </CardTitle>
                <CardDescription>
                  Choose your preferred Solana wallet to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => connectWallet('phantom')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">P</span>
                    </div>
                    Connect with Phantom
                  </div>
                </Button>

                <Button
                  onClick={() => connectWallet('solflare')}
                  variant="outline"
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 py-6 text-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">S</span>
                    </div>
                    Connect with Solflare
                  </div>
                </Button>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    New to Solana wallets? <br />
                    <a 
                      href="https://docs.solana.com/wallet-guide" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Learn about Solana wallets →
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature Details */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 mt-12">
              <h3 className="text-2xl font-bold text-center mb-8">
                What You'll Get Access To
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Portfolio Overview</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Real-time SOL and AURA balances</li>
                    <li>• Total portfolio value in USD</li>
                    <li>• Token count and activity status</li>
                    <li>• Privacy toggle for sensitive data</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Advanced Features</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Complete transaction history</li>
                    <li>• Live AURA market data & price charts</li>
                    <li>• Direct links to Solscan explorer</li>
                    <li>• One-click staking for AURA tokens</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <WalletDashboard 
            walletAddress={connectedWallet} 
            onDisconnect={disconnectWallet}
          />
        )}
      </main>
    </div>
  );
};

export default WalletHubPage; 