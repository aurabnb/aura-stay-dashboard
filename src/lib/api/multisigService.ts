// Multisig wallet service
// Mock data for development - replace with actual smart contract calls when multisig is implemented

import type { MultisigWallet, MultisigTransaction, NewTransactionData } from '@/types/multisig';

// Mock data for a 3-of-5 multisig wallet
const mockMultisigData: MultisigWallet = {
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

export const getMultisigWallet = async (): Promise<MultisigWallet> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In production, this would call the Solana smart contract
  return { ...mockMultisigData };
};

export const createTransaction = async (transactionData: NewTransactionData): Promise<{ success: boolean; transactionId?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In production, this would create a transaction proposal on the smart contract
  console.log('Creating transaction:', transactionData);
  
  return {
    success: true,
    transactionId: `tx_${Date.now()}`
  };
};

export const approveTransaction = async (transactionId: string, signerAddress: string): Promise<{ success: boolean }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // In production, this would submit an approval to the smart contract
  console.log('Approving transaction:', { transactionId, signerAddress });
  
  return { success: true };
};

export const executeTransaction = async (transactionId: string): Promise<{ success: boolean; transactionHash?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In production, this would execute the transaction if enough approvals are collected
  console.log('Executing transaction:', transactionId);
  
  return {
    success: true,
    transactionHash: `${transactionId}_executed_${Date.now()}`
  };
}; 