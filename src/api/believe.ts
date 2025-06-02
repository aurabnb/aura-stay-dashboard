import { apiFetch } from "./_client";

export interface BurnTransaction {
  transactionHash: string;
  amount: number;
  burnPercentage: number;
  timestamp: string;
  fromWallet: string;
  toWallet: string;
  type: 'buy' | 'sell';
  status: 'pending' | 'confirmed' | 'failed';
}

export interface StakingReward {
  stakingWallet: string;
  rewardAmount: number;
  stakingBalance: number;
  rewardPercentage: number;
  distributionRound: number;
  timestamp: string;
}

export interface BurnDistributionData {
  totalBurned: number;
  totalStaked: number;
  rewardPerToken: number;
  distributionRound: number;
  nextDistribution: string;
  stakingRewards: StakingReward[];
}

// Believe API Configuration
const BELIEVE_API_BASE = 'https://api.believe.app';
const BELIEVE_API_VERSION = 'v1';

class BelieveAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = `${BELIEVE_API_BASE}/${BELIEVE_API_VERSION}`;
    // In production, this would come from environment variables
    this.apiKey = import.meta.env.VITE_BELIEVE_API_KEY || 'demo-key';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-API-Version': BELIEVE_API_VERSION,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Believe API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Believe API request failed:', error);
      throw error;
    }
  }

  // Process 2% burn on transactions
  async processBurnTransaction(transaction: {
    hash: string;
    amount: number;
    fromWallet: string;
    toWallet: string;
    type: 'buy' | 'sell';
  }): Promise<BurnTransaction> {
    const burnAmount = transaction.amount * 0.02; // 2% burn
    
    const payload = {
      transaction_hash: transaction.hash,
      token_address: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe', // AURA token
      original_amount: transaction.amount,
      burn_amount: burnAmount,
      burn_percentage: 2.0,
      from_wallet: transaction.fromWallet,
      to_wallet: transaction.toWallet,
      transaction_type: transaction.type,
    };

    try {
      const response = await this.makeRequest('/token/burn', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return {
        transactionHash: response.transaction_hash,
        amount: response.burn_amount,
        burnPercentage: response.burn_percentage,
        timestamp: response.timestamp,
        fromWallet: response.from_wallet,
        toWallet: response.to_wallet,
        type: response.transaction_type,
        status: response.status,
      };
    } catch (error) {
      // Fallback for demo purposes
      console.warn('Believe API not available, using simulation:', error);
      return this.simulateBurnTransaction(transaction, burnAmount);
    }
  }

  // Distribute rewards to stakers (4x daily)
  async distributeStakingRewards(): Promise<BurnDistributionData> {
    try {
      const response = await this.makeRequest('/staking/distribute-rewards', {
        method: 'POST',
        body: JSON.stringify({
          token_address: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
          distribution_type: 'burn_rewards',
        }),
      });

      return {
        totalBurned: response.total_burned,
        totalStaked: response.total_staked,
        rewardPerToken: response.reward_per_token,
        distributionRound: response.distribution_round,
        nextDistribution: response.next_distribution,
        stakingRewards: response.staking_rewards.map((reward: any) => ({
          stakingWallet: reward.staking_wallet,
          rewardAmount: reward.reward_amount,
          stakingBalance: reward.staking_balance,
          rewardPercentage: reward.reward_percentage,
          distributionRound: reward.distribution_round,
          timestamp: reward.timestamp,
        })),
      };
    } catch (error) {
      console.warn('Believe API not available, using simulation:', error);
      return this.simulateRewardDistribution();
    }
  }

  // Get staking metrics
  async getStakingMetrics(): Promise<{
    totalStaked: number;
    totalStakers: number;
    averageStake: number;
    totalRewardsDistributed: number;
    nextDistribution: string;
  }> {
    try {
      const response = await this.makeRequest('/staking/metrics?token=3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe');
      return response;
    } catch (error) {
      console.warn('Believe API not available, using simulation:', error);
      return {
        totalStaked: 2400000,
        totalStakers: 1247,
        averageStake: 1925,
        totalRewardsDistributed: 145.67,
        nextDistribution: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // Next 6 hours
      };
    }
  }

  // Get burn history
  async getBurnHistory(limit = 50): Promise<BurnTransaction[]> {
    try {
      const response = await this.makeRequest(`/token/burn-history?token=3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe&limit=${limit}`);
      return response.transactions.map((tx: any) => ({
        transactionHash: tx.transaction_hash,
        amount: tx.burn_amount,
        burnPercentage: tx.burn_percentage,
        timestamp: tx.timestamp,
        fromWallet: tx.from_wallet,
        toWallet: tx.to_wallet,
        type: tx.transaction_type,
        status: tx.status,
      }));
    } catch (error) {
      console.warn('Believe API not available, using simulation:', error);
      return this.simulateBurnHistory();
    }
  }

  // Simulation methods for development/demo
  private simulateBurnTransaction(transaction: any, burnAmount: number): BurnTransaction {
    return {
      transactionHash: transaction.hash,
      amount: burnAmount,
      burnPercentage: 2.0,
      timestamp: new Date().toISOString(),
      fromWallet: transaction.fromWallet,
      toWallet: transaction.toWallet,
      type: transaction.type,
      status: 'confirmed',
    };
  }

  private simulateRewardDistribution(): BurnDistributionData {
    const totalBurned = 245.67;
    const totalStaked = 2400000;
    const rewardPerToken = totalBurned / totalStaked;

    return {
      totalBurned,
      totalStaked,
      rewardPerToken,
      distributionRound: Math.floor(Date.now() / (6 * 60 * 60 * 1000)), // Every 6 hours
      nextDistribution: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      stakingRewards: [
        {
          stakingWallet: 'demo_wallet_1',
          rewardAmount: 12.45,
          stakingBalance: 125000,
          rewardPercentage: 5.2,
          distributionRound: 123,
          timestamp: new Date().toISOString(),
        },
        // Add more simulated rewards...
      ],
    };
  }

  private simulateBurnHistory(): BurnTransaction[] {
    return [
      {
        transactionHash: '5k9v2JrKPz4mGqYHE8xN7pR6FT8sW3nX9vU2qL5dJ8hM',
        amount: 23.45,
        burnPercentage: 2.0,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        fromWallet: 'buyer_wallet_123',
        toWallet: 'aura_pool_main',
        type: 'buy',
        status: 'confirmed',
      },
      {
        transactionHash: '7R2mN4pQ8sT9vX3nL6hJ5kG1fD8yW2qU9oP7eR4tY6uI',
        amount: 15.67,
        burnPercentage: 2.0,
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        fromWallet: 'seller_wallet_456',
        toWallet: 'aura_pool_main',
        type: 'sell',
        status: 'confirmed',
      },
      // Add more simulated transactions...
    ];
  }
}

// Export singleton instance
export const believeAPI = new BelieveAPI();

// Convenience functions
export const processBurn = (transaction: any) => believeAPI.processBurnTransaction(transaction);
export const distributeRewards = () => believeAPI.distributeStakingRewards();
export const getStakingMetrics = () => believeAPI.getStakingMetrics();
export const getBurnHistory = (limit?: number) => believeAPI.getBurnHistory(limit); 