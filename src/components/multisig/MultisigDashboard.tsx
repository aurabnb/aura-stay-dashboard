'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowUpRight,
  Copy,
  ExternalLink,
  DollarSign,
  Building,
  TrendingUp,
  AlertTriangle,
  Wallet,
  Send,
  Loader2
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';

interface MultisigTransaction {
  id: string;
  amount: number;
  destination: string;
  category: 'Operations' | 'BusinessCosts' | 'Marketing' | 'ProjectFunding';
  executed: boolean;
  approvals: boolean[];
  requiredApprovals: number;
  createdAt: string;
  executedAt?: string;
  transactionHash?: string;
  description: string;
  proposer: string;
}

interface MultisigWallet {
  address: string;
  owners: string[];
  threshold: number;
  balance: number;
  transactions: MultisigTransaction[];
  name: string;
}

const categories = [
  { value: 'Operations', label: 'Operations', icon: Shield, color: 'bg-blue-100 text-blue-800' },
  { value: 'BusinessCosts', label: 'Business Costs', icon: Building, color: 'bg-purple-100 text-purple-800' },
  { value: 'Marketing', label: 'Marketing', icon: TrendingUp, color: 'bg-green-100 text-green-800' },
  { value: 'ProjectFunding', label: 'Project Funding', icon: DollarSign, color: 'bg-orange-100 text-orange-800' },
];

export function MultisigDashboard() {
  const { connected, publicKey } = useWallet();
  const [walletData, setWalletData] = useState<MultisigWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    destination: '',
    category: 'Operations' as MultisigTransaction['category'],
    description: ''
  });

  const { toast } = useToast();

  // Mock data - replace with actual smart contract calls
  useEffect(() => {
    const mockData: MultisigWallet = {
      name: 'Main Treasury Wallet',
      address: 'fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh',
      owners: [
        'Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg',
        '7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2',
        'Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i',
        '9Wd2xPc6KmF6qmqbsQSbhemAmRpVfgVBFUPeLpYw7',
        '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe'
      ],
      threshold: 3,
      balance: 125000, // USD
      transactions: [
        {
          id: '1',
          amount: 15000,
          destination: 'Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg',
          category: 'ProjectFunding',
          executed: true,
          approvals: [true, true, true, false, false],
          requiredApprovals: 3,
          createdAt: '2025-01-15T10:30:00Z',
          executedAt: '2025-01-15T14:45:00Z',
          transactionHash: 'abc123def456',
          description: 'Volcano Stay construction funding - Phase 1',
          proposer: 'Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg'
        },
        {
          id: '2',
          amount: 5000,
          destination: '7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2',
          category: 'Marketing',
          executed: false,
          approvals: [true, true, false, false, false],
          requiredApprovals: 3,
          createdAt: '2025-01-16T09:15:00Z',
          description: 'Q1 marketing campaign budget',
          proposer: '7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2'
        },
        {
          id: '3',
          amount: 2500,
          destination: 'Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i',
          category: 'BusinessCosts',
          executed: false,
          approvals: [true, false, false, false, false],
          requiredApprovals: 3,
          createdAt: '2025-01-16T15:20:00Z',
          description: 'Legal and compliance expenses',
          proposer: 'Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i'
        }
      ]
    };

    setTimeout(() => {
      setWalletData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateTransaction = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Validation Error",
        description: "Please connect your wallet to create transactions",
        variant: "destructive"
      });
      return;
    }

    if (!newTransaction.amount || !newTransaction.destination || !newTransaction.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(newTransaction.amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Mock transaction creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Transaction Created",
        description: `Created transaction for $${newTransaction.amount} - awaiting approvals`,
      });

      setNewTransaction({
        amount: '',
        destination: '',
        category: 'Operations',
        description: ''
      });
      
    } catch (error) {
      console.error('Transaction creation error:', error);
      toast({
        title: "Transaction Error",
        description: "Failed to create transaction",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveTransaction = async (transactionId: string) => {
    if (!connected || !publicKey) {
      toast({
        title: "Validation Error",
        description: "Please connect your wallet to approve transactions",
        variant: "destructive"
      });
      return;
    }

    try {
      setApproving(transactionId);
      
      // Mock approval transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Transaction Approved",
        description: `Your approval has been recorded for transaction ${transactionId}`,
      });
      
    } catch (error) {
      console.error('Approval error:', error);
      toast({
        title: "Transaction Error",
        description: "Failed to approve transaction",
        variant: "destructive"
      });
    } finally {
      setApproving(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Address copied successfully",
    });
  };

  const getCategoryData = (category: MultisigTransaction['category']) => {
    return categories.find(cat => cat.value === category) || categories[0];
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwner = publicKey && walletData?.owners.includes(publicKey.toString());
  const currentApprovals = (transaction: MultisigTransaction) => 
    transaction.approvals.filter(Boolean).length;

  if (!connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multisig Dashboard</h1>
          <p className="text-muted-foreground">
            Manage multi-signature wallet operations and transactions
          </p>
        </div>
        
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wallet className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Connect your Solana wallet to access multisig wallet management features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multisig Dashboard</h1>
          <p className="text-muted-foreground">Loading wallet information...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multisig Dashboard</h1>
          <p className="text-muted-foreground text-red-600">
            Failed to load wallet data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Multisig Dashboard</h1>
        <p className="text-muted-foreground">
          Manage multi-signature wallet operations and transactions
        </p>
      </div>

      {/* Owner Status */}
      {isOwner ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              You are an authorized owner of this multisig wallet
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm font-medium text-yellow-800">
              You are not an owner of this multisig wallet. You can view transactions but cannot approve or create new ones.
            </p>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Wallet Balance</p>
                <p className="text-2xl font-bold">${walletData.balance.toLocaleString()}</p>
                <p className="text-xs text-gray-500">USD equivalent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Signature Threshold</p>
                <p className="text-2xl font-bold">{walletData.threshold}/{walletData.owners.length}</p>
                <p className="text-xs text-gray-500">Required approvals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Transactions</p>
                <p className="text-2xl font-bold">
                  {walletData.transactions.filter(t => !t.executed).length}
                </p>
                <p className="text-xs text-gray-500">Awaiting approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {walletData.name}
          </CardTitle>
          <CardDescription>Multi-signature wallet details and owner information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
            <Label className="text-sm font-medium">Wallet Address</Label>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{walletData.address}</code>
              <Button
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(walletData.address)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`https://solscan.io/account/${walletData.address}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Owners ({walletData.owners.length})</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
            {walletData.owners.map((owner, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <code className="bg-gray-100 px-2 py-1 rounded">{formatAddress(owner)}</code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(owner)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
              </div>
            ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="create" disabled={!isOwner}>
            Create Transaction {!isOwner && '(Owners Only)'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <div className="space-y-4">
            {walletData.transactions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Clock className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Transactions Yet
                  </h3>
                  <p className="text-gray-600 text-center max-w-md">
                    When transactions are created, they will appear here for review and approval.
                  </p>
                </CardContent>
              </Card>
            ) : (
              walletData.transactions.map((transaction) => {
                const categoryData = getCategoryData(transaction.category);
                const IconComponent = categoryData.icon;
                const approvalCount = currentApprovals(transaction);
                
                return (
                  <Card key={transaction.id} className={`border-l-4 ${transaction.executed ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                          <div>
                            <CardTitle className="text-lg">
                              ${transaction.amount.toLocaleString()} Transfer
                            </CardTitle>
                            <CardDescription>{transaction.description}</CardDescription>
                          </div>
                        </div>
                      <div className="flex items-center gap-2">
                          <Badge className={categoryData.color}>
                            {categoryData.label}
                        </Badge>
                        {transaction.executed ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Executed
                          </Badge>
                        ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                              Pending ({approvalCount}/{transaction.requiredApprovals})
                          </Badge>
                        )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Destination</p>
                          <p className="font-mono">{formatAddress(transaction.destination)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Proposed By</p>
                          <p className="font-mono">{formatAddress(transaction.proposer)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Created</p>
                          <p>{formatDate(transaction.createdAt)}</p>
                        </div>
                        {transaction.executedAt && (
                          <div>
                            <p className="text-gray-600">Executed</p>
                            <p>{formatDate(transaction.executedAt)}</p>
                          </div>
                        )}
                    </div>
                    
                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="font-medium">Approvals: </span>
                            <span className={approvalCount >= transaction.requiredApprovals ? 'text-green-600' : 'text-yellow-600'}>
                              {approvalCount}/{transaction.requiredApprovals}
                      </span>
                    </div>
                          <div className="flex gap-1">
                      {transaction.approvals.map((approved, index) => (
                        <div
                          key={index}
                                className={`w-3 h-3 rounded-full ${
                                  approved ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                                title={`Owner ${index + 1}: ${approved ? 'Approved' : 'Pending'}`}
                              />
                            ))}
                        </div>
                    </div>

                        {!transaction.executed && isOwner && (
                      <Button
                        onClick={() => handleApproveTransaction(transaction.id)}
                            disabled={approving === transaction.id}
                            size="sm"
                      >
                            {approving === transaction.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </>
                            )}
                      </Button>
                    )}
                      </div>

                      {transaction.transactionHash && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Transaction Hash:</span>
                            <Button variant="outline" size="sm" asChild>
                              <a 
                                href={`https://solscan.io/tx/${transaction.transactionHash}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                        >
                                View on Solscan
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                        </Button>
                          </div>
                          <code className="text-xs text-gray-600 mt-1 block">{transaction.transactionHash}</code>
                      </div>
                    )}
                </CardContent>
              </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Create New Transaction
              </CardTitle>
              <CardDescription>
                Propose a new transaction that requires {walletData.threshold} approvals to execute
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({
                      ...prev,
                      amount: e.target.value
                    }))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction(prev => ({
                      ...prev,
                      category: e.target.value as MultisigTransaction['category']
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="destination">Destination Address</Label>
                <Input
                  id="destination"
                  placeholder="Enter Solana wallet address"
                  value={newTransaction.destination}
                  onChange={(e) => setNewTransaction(prev => ({
                    ...prev,
                    destination: e.target.value
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose of this transaction..."
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  rows={3}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Transaction Requirements:</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• Requires {walletData.threshold} out of {walletData.owners.length} owner approvals</li>
                      <li>• Transaction will be executed automatically once threshold is met</li>
                      <li>• All transactions are recorded on the Solana blockchain</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCreateTransaction}
                disabled={submitting || !newTransaction.amount || !newTransaction.destination || !newTransaction.description}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Transaction...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                Create Transaction
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 