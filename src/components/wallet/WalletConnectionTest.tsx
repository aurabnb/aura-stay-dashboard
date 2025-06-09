'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Wallet, Link } from 'lucide-react';

export const WalletConnectionTest: React.FC = () => {
  const { 
    connected, 
    connecting, 
    publicKey, 
    wallet, 
    disconnect,
    wallets 
  } = useWallet();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Adapter Test
        </CardTitle>
        <CardDescription>
          Verify that the Solana wallet adapter is working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="font-medium">Connection Status</span>
          <Badge variant={connected ? "default" : "secondary"} className="flex items-center gap-1">
            {connected ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {connecting ? "Connecting..." : connected ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        {/* Wallet Info */}
        {connected && wallet && publicKey && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="font-medium text-green-800">Connected Wallet</p>
                <p className="text-sm text-green-600">{wallet.adapter.name}</p>
              </div>
              <img 
                src={wallet.adapter.icon} 
                alt={wallet.adapter.name}
                className="w-8 h-8"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-blue-800 mb-2">Public Key</p>
              <p className="text-sm font-mono text-blue-600 break-all">
                {publicKey.toString()}
              </p>
            </div>

            <Button 
              onClick={disconnect} 
              variant="outline" 
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          </div>
        )}

        {/* Available Wallets */}
        <div className="space-y-2">
          <h4 className="font-medium">Available Wallets ({wallets.length})</h4>
          <div className="grid grid-cols-2 gap-2">
            {wallets.slice(0, 4).map((wallet) => (
              <div 
                key={wallet.adapter.name}
                className="flex items-center gap-2 p-2 border border-gray-200 rounded text-sm"
              >
                <img 
                  src={wallet.adapter.icon} 
                  alt={wallet.adapter.name}
                  className="w-5 h-5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="truncate">{wallet.adapter.name}</span>
                <Badge variant="outline" className="text-xs">
                  {wallet.readyState}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Helper Links */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium mb-2">Quick Links</h4>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <a 
                href="https://phantom.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <Link className="h-3 w-3" />
                Phantom
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a 
                href="https://solflare.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <Link className="h-3 w-3" />
                Solflare
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};