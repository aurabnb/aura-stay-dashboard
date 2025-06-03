import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AlertTriangle
} from 'lucide-react';
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
}

interface MultisigWallet {
  address: string;
  owners: string[];
  threshold: number;
  balance: number;
  transactions: MultisigTransaction[];
}

const MultisigDashboard: React.FC = () => {
  const [walletData, setWalletData] = useState<MultisigWallet | null>(null);
  const [loading, setLoading] = useState(true);
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
          description: 'Volcano Stay construction funding - Phase 1'
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
          description: 'Q1 marketing campaign budget'
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
          description: 'Legal and compliance expenses'
        }
      ]
    };

    setTimeout(() => {
      setWalletData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateTransaction = () => {
    if (!newTransaction.amount || !newTransaction.destination || !newTransaction.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // In real implementation, this would call the smart contract
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
  };

  const handleApproveTransaction = (transactionId: string) => {
    // In real implementation, this would call the smart contract
    toast({
      title: "Transaction Approved",
      description: `Your approval has been recorded for transaction ${transactionId}`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Address copied successfully",
    });
  };

  const getCategoryColor = (category: MultisigTransaction['category']) => {
    switch (category) {
      case 'Operations': return 'bg-blue-100 text-blue-800';
      case 'BusinessCosts': return 'bg-purple-100 text-purple-800';
      case 'Marketing': return 'bg-green-100 text-green-800';
      case 'ProjectFunding': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: MultisigTransaction['category']) => {
    switch (category) {
      case 'Operations': return <Shield className="h-4 w-4" />;
      case 'BusinessCosts': return <Building className="h-4 w-4" />;
      case 'Marketing': return <TrendingUp className="h-4 w-4" />;
      case 'ProjectFunding': return <DollarSign className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
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
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Multisig Data</h3>
          <p className="text-gray-600">Unable to connect to the multisig wallet. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Wallet Balance</p>
                <p className="text-2xl font-bold">${walletData.balance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Signers</p>
                <p className="text-2xl font-bold">{walletData.threshold}/{walletData.owners.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">
                  {walletData.transactions.filter(tx => !tx.executed).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Executed</p>
                <p className="text-2xl font-bold">
                  {walletData.transactions.filter(tx => tx.executed).length}
                </p>
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
            Multisig Wallet Information
          </CardTitle>
          <CardDescription>
            3-of-5 signature wallet for foundation funding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Wallet Address</p>
              <p className="font-mono text-sm">{walletData.address}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(walletData.address)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`https://explorer.solana.com/address/${walletData.address}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {walletData.owners.map((owner, index) => (
              <div key={index} className="p-2 bg-blue-50 rounded text-center">
                <p className="text-xs text-blue-600">Signer {index + 1}</p>
                <p className="font-mono text-xs">{formatAddress(owner)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="create">Create Transaction</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="space-y-4">
            {walletData.transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(transaction.category)}>
                          {getCategoryIcon(transaction.category)}
                          {transaction.category}
                        </Badge>
                        {transaction.executed ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Executed
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold">{transaction.description}</h3>
                      <p className="text-sm text-gray-600">
                        To: {formatAddress(transaction.destination)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold">${transaction.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Approvals</span>
                      <span>
                        {transaction.approvals.filter(a => a).length} / {transaction.requiredApprovals}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      {transaction.approvals.map((approved, index) => (
                        <div
                          key={index}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                            approved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {approved ? <CheckCircle className="h-4 w-4" /> : index + 1}
                        </div>
                      ))}
                    </div>

                    {!transaction.executed && (
                      <Button
                        onClick={() => handleApproveTransaction(transaction.id)}
                        className="w-full"
                        disabled={transaction.approvals.filter(a => a).length >= transaction.requiredApprovals}
                      >
                        {transaction.approvals.filter(a => a).length >= transaction.requiredApprovals 
                          ? 'Ready to Execute' 
                          : 'Approve Transaction'}
                      </Button>
                    )}

                    {transaction.executed && transaction.transactionHash && (
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm text-green-800">
                          Executed: {transaction.executedAt && formatDate(transaction.executedAt)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://explorer.solana.com/tx/${transaction.transactionHash}`, '_blank')}
                        >
                          View TX <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Create Transaction Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Transaction</CardTitle>
              <CardDescription>
                Propose a new transaction that requires {walletData.threshold} signatures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="15000"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value as MultisigTransaction['category'] }))}
                  >
                    <option value="Operations">Operations</option>
                    <option value="BusinessCosts">Business Costs</option>
                    <option value="Marketing">Marketing</option>
                    <option value="ProjectFunding">Project Funding</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination Address</Label>
                <Input
                  id="destination"
                  placeholder="Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg"
                  value={newTransaction.destination}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, destination: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Volcano Stay construction funding - Phase 2"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <Button onClick={handleCreateTransaction} className="w-full">
                Create Transaction
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultisigDashboard; 