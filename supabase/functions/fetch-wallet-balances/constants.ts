
import { TokenInfo } from './types.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const KNOWN_TOKENS: Record<string, TokenInfo> = {
  'So11111111111111111111111111111111111111112': {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9
  },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6
  },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6
  },
  '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe': {
    symbol: 'AURA',
    name: 'Aurora Ventures',
    decimals: 9
  },
  '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8
  },
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 8
  },
  '0xf0f9d895aca5c8678f706fb8216fa22957685a13': {
    symbol: 'CULT',
    name: 'Cult DAO',
    decimals: 18
  }
};

export const METEORA_LP_TOKENS = new Map([
  ['FVtpMFtDtskHt5MmLExkjKrCkXQi8ebVZHuFhRnQL6W5', {
    token1: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
    token2: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
    name: 'AURA-WBTC',
    poolUrl: 'https://www.meteora.ag/pools/FVtpMFtDtskHt5MmLExkjKrCkXQi8ebVZHuFhRnQL6W5'
  }],
  ['8trgRQFSHKSiUUY19Qba5MrcRoq6ALnbmaocvfti3ZjP', {
    token1: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
    token2: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
    name: 'AURA-WBTC',
    poolUrl: 'https://www.meteora.ag/pools/8trgRQFSHKSiUUY19Qba5MrcRoq6ALnbmaocvfti3ZjP'
  }],
  ['GyQ4VWSERBxvLRJmRatxk3DMdF6GeMk4hsBo4h7jcpfX', {
    token1: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    token2: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
    name: 'ETH-AURA',
    poolUrl: 'https://www.meteora.ag/pools/GyQ4VWSERBxvLRJmRatxk3DMdF6GeMk4hsBo4h7jcpfX'
  }],
  ['GTMY5eBd4cXaihz2ZB69g3WkVmvhudamf1kQn3E9preW', {
    token1: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
    token2: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    name: 'AURA-ETH',
    poolUrl: 'https://www.meteora.ag/pools/GTMY5eBd4cXaihz2ZB69g3WkVmvhudamf1kQn3E9preW'
  }]
]);

export const FIXED_PRICES: Record<string, number> = {
  '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe': 0.00011566, // AURA
  '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': 105000, // WBTC
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': 3500, // ETH
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1, // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 1, // USDT
  '0xf0f9d895aca5c8678f706fb8216fa22957685a13': 0.000005 // CULT on Ethereum
};

export const WALLETS_CONFIG = [
  {
    wallet_id: '69fe7f1c-bf6a-4981-9d2e-93f25b3ae6be',
    name: 'Operations',
    address: 'fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh',
    blockchain: 'Solana'
  },
  {
    wallet_id: 'dfa84c3c-8cf0-4a03-a209-c2ad09f5016d',
    name: 'Business Costs',
    address: 'Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg',
    blockchain: 'Solana'
  },
  {
    wallet_id: '5635149e-2095-4777-afeb-316c273cf2ec',
    name: 'Marketing',
    address: '7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2',
    blockchain: 'Solana'
  },
  {
    wallet_id: '296a8349-e4bd-4480-a4ac-e6039726d6fa',
    name: 'Project Funding - Solana',
    address: 'Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i',
    blockchain: 'Solana'
  },
  {
    wallet_id: '746a0a15-e232-4706-a156-c2e1d901dcdf',
    name: 'Project Funding - Ethereum',
    address: '0xf05fc9a3c6011c76eb6fe4cbb956eeac8750306d',
    blockchain: 'Ethereum'
  }
];
