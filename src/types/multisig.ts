export interface MultisigTransaction {
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

export interface MultisigWallet {
  address: string;
  owners: string[];
  threshold: number;
  balance: number;
  transactions: MultisigTransaction[];
}

export interface NewTransactionData {
  amount: string;
  destination: string;
  category: MultisigTransaction['category'];
  description: string;
} 