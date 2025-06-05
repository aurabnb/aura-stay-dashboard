// ============================================================================
// ENHANCED TYPE DEFINITIONS FOR AURA STAY DASHBOARD
// ============================================================================

import { ReactNode } from 'react'

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type Required<T, K extends keyof T> = T & {
  [P in K]-?: T[P]
}

export type NonEmptyArray<T> = [T, ...T[]]

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

// ============================================================================
// COMMON TYPES
// ============================================================================

export type Status = 'idle' | 'loading' | 'success' | 'error'
export type LoadingState = 'loading' | 'complete' | 'error'
export type NetworkStatus = 'online' | 'offline' | 'slow'

export interface Timestamps {
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasNext?: boolean
    hasPrev?: boolean
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
    perPage: number
  }
}

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export interface User {
  id: string
  wallet?: string
  email?: string
  username?: string
  avatar?: string
  role: UserRole
  preferences: UserPreferences
  metadata?: Record<string, any>
  isEmailVerified: boolean
  isWalletVerified: boolean
  lastLoginAt?: string
} & Timestamps

export type UserRole = 'user' | 'admin' | 'moderator' | 'premium'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  currency: string
  notifications: NotificationSettings
  privacy: PrivacySettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  trading: boolean
  staking: boolean
  governance: boolean
  marketing: boolean
}

export interface PrivacySettings {
  showPortfolio: boolean
  showActivity: boolean
  allowAnalytics: boolean
}

export interface AuthSession {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: string
  permissions: Permission[]
}

export interface Permission {
  resource: string
  actions: string[]
}

// ============================================================================
// WALLET & BLOCKCHAIN TYPES
// ============================================================================

export interface WalletConnection {
  address: string
  isConnected: boolean
  walletType: WalletType
  network: SolanaNetwork
  balance?: TokenBalance[]
  metadata?: WalletMetadata
}

export type WalletType = 'phantom' | 'solflare' | 'backpack' | 'coin98' | 'metamask' | 'unknown'
export type SolanaNetwork = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet'

export interface WalletMetadata {
  name: string
  icon?: string
  version?: string
  features?: WalletFeature[]
}

export type WalletFeature = 'signTransaction' | 'signMessage' | 'connect' | 'disconnect' | 'switchNetwork'

export interface TokenBalance {
  mint: string
  symbol: string
  name: string
  amount: string
  decimals: number
  uiAmount: number
  logo?: string
  price?: number
  value?: number
  change24h?: number
}

export interface Transaction {
  signature: string
  blockTime?: number
  slot?: number
  status: TransactionStatus
  type: TransactionType
  fee: number
  instructions: TransactionInstruction[]
  metadata?: TransactionMetadata
}

export type TransactionStatus = 'pending' | 'confirmed' | 'finalized' | 'failed'
export type TransactionType = 'transfer' | 'stake' | 'unstake' | 'swap' | 'burn' | 'mint' | 'vote' | 'unknown'

export interface TransactionInstruction {
  programId: string
  accounts: string[]
  data: string
}

export interface TransactionMetadata {
  amount?: string
  symbol?: string
  fromAddress?: string
  toAddress?: string
  description?: string
}

// ============================================================================
// TRADING & MARKET TYPES
// ============================================================================

export interface TradingPair {
  symbol: string
  baseToken: Token
  quoteToken: Token
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  marketCap?: number
  liquidity?: number
  isActive: boolean
}

export interface Token {
  mint: string
  symbol: string
  name: string
  decimals: number
  logo?: string
  description?: string
  website?: string
  twitter?: string
  coingeckoId?: string
  tags?: string[]
  verified: boolean
}

export interface SwapQuote {
  inputMint: string
  outputMint: string
  inputAmount: string
  outputAmount: string
  priceImpact: number
  slippage: number
  route: SwapRoute[]
  fees: SwapFee[]
  estimatedGas: number
  validUntil: number
}

export interface SwapRoute {
  ammId: string
  ammName: string
  inputMint: string
  outputMint: string
  inputAmount: string
  outputAmount: string
  fee: number
}

export interface SwapFee {
  type: 'trading' | 'platform' | 'network'
  amount: string
  mint: string
  percentage: number
}

export interface PriceData {
  price: number
  timestamp: number
  source: string
  confidence?: number
}

export interface MarketData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  circulatingSupply: number
  totalSupply: number
  high24h: number
  low24h: number
  ath: number
  atl: number
  priceHistory: PriceHistoryPoint[]
  lastUpdated: string
}

export interface PriceHistoryPoint {
  timestamp: number
  price: number
  volume?: number
}

// ============================================================================
// STAKING & REWARDS TYPES
// ============================================================================

export interface StakingPool {
  id: string
  name: string
  token: Token
  apy: number
  tvl: number
  minStake: string
  maxStake?: string
  lockPeriod?: number
  unstakePeriod?: number
  taxRates: StakingTaxRates
  isActive: boolean
  metadata: StakingPoolMetadata
}

export interface StakingTaxRates {
  stake: number
  unstake: number
  rewards: number
}

export interface StakingPoolMetadata {
  description: string
  riskLevel: 'low' | 'medium' | 'high'
  features: string[]
  restrictions?: string[]
}

export interface StakingPosition {
  id: string
  poolId: string
  userAddress: string
  stakedAmount: string
  earnedRewards: string
  stakingDate: string
  lastClaimedAt?: string
  status: StakingStatus
  lockExpiresAt?: string
  canUnstake: boolean
}

export type StakingStatus = 'active' | 'unstaking' | 'withdrawn' | 'locked'

export interface RewardCalculation {
  baseApy: number
  taxBonus: number
  effectiveApy: number
  estimatedRewards: string
  nextDistribution?: string
}

// ============================================================================
// TREASURY & FINANCIAL TYPES
// ============================================================================

export interface TreasuryData {
  totalValue: number
  volatileAssets: number
  stableAssets: number
  breakdown: AssetBreakdown[]
  performance: TreasuryPerformance
  allocations: AllocationTarget[]
  lastUpdated: string
}

export interface AssetBreakdown {
  type: AssetType
  symbol: string
  amount: string
  value: number
  percentage: number
  change24h: number
  allocation: 'volatile' | 'stable' | 'liquidity' | 'staking'
}

export type AssetType = 'token' | 'lp' | 'staked' | 'nft' | 'real_estate' | 'cash'

export interface TreasuryPerformance {
  totalReturn: number
  annualizedReturn: number
  sharpeRatio: number
  maxDrawdown: number
  volatility: number
  performanceHistory: PerformancePoint[]
}

export interface PerformancePoint {
  date: string
  value: number
  return: number
}

export interface AllocationTarget {
  category: string
  targetPercentage: number
  currentPercentage: number
  rebalanceNeeded: boolean
}

export interface Expense {
  id: string
  category: ExpenseCategory
  description: string
  amount: number
  currency: string
  solPrice: number
  usdValue: number
  recipient?: string
  status: ExpenseStatus
  approvedBy?: string
  metadata?: Record<string, any>
} & Timestamps

export type ExpenseCategory = 'development' | 'marketing' | 'operations' | 'legal' | 'infrastructure' | 'other'
export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'paid'

// ============================================================================
// GOVERNANCE & DAO TYPES
// ============================================================================

export interface Proposal {
  id: string
  title: string
  description: string
  proposer: string
  status: ProposalStatus
  type: ProposalType
  votingPower: VotingPower
  votes: Vote[]
  execution?: ProposalExecution
  timeline: ProposalTimeline
  metadata?: Record<string, any>
} & Timestamps

export type ProposalStatus = 'draft' | 'active' | 'passed' | 'rejected' | 'executed' | 'cancelled'
export type ProposalType = 'parameter' | 'treasury' | 'upgrade' | 'grant' | 'custom'

export interface VotingPower {
  totalSupply: string
  quorumRequired: string
  threshold: number
  currentQuorum: string
  votingEndsAt: string
}

export interface Vote {
  voter: string
  choice: VoteChoice
  power: string
  timestamp: string
  reason?: string
}

export type VoteChoice = 'yes' | 'no' | 'abstain'

export interface ProposalExecution {
  transactionId?: string
  executedAt?: string
  executedBy?: string
  gasUsed?: number
  status: 'pending' | 'executed' | 'failed'
}

export interface ProposalTimeline {
  createdAt: string
  votingStartsAt: string
  votingEndsAt: string
  executionDelay: number
  maxExecutionTime: string
}

// ============================================================================
// ANALYTICS & METRICS TYPES
// ============================================================================

export interface AnalyticsData {
  overview: OverviewMetrics
  trading: TradingMetrics
  treasury: TreasuryMetrics
  community: CommunityMetrics
  staking: StakingMetrics
  period: AnalyticsPeriod
  lastUpdated: string
}

export type AnalyticsPeriod = '24h' | '7d' | '30d' | '90d' | '1y' | 'all'

export interface OverviewMetrics {
  totalUsers: number
  activeUsers: number
  totalTransactions: number
  totalVolume: number
  marketCap: number
  tvl: number
  growth: GrowthMetrics
}

export interface GrowthMetrics {
  users: number
  volume: number
  transactions: number
  tvl: number
}

export interface TradingMetrics {
  totalVolume: number
  trades: number
  uniqueTraders: number
  averageTradeSize: number
  topPairs: TradingPairMetrics[]
  volumeHistory: TimeSeriesPoint[]
}

export interface TradingPairMetrics {
  pair: string
  volume: number
  trades: number
  change24h: number
}

export interface TreasuryMetrics {
  totalValue: number
  performance: number
  allocation: Record<string, number>
  expenses: number
  revenue: number
  runwayMonths: number
}

export interface CommunityMetrics {
  totalMembers: number
  activeMembers: number
  engagement: number
  platforms: PlatformMetrics[]
  growth: number
}

export interface PlatformMetrics {
  platform: string
  followers: number
  growth: number
  engagement: number
}

export interface StakingMetrics {
  totalStaked: number
  stakers: number
  averageStake: number
  apy: number
  rewards: number
  taxCollected: TaxMetrics
}

export interface TaxMetrics {
  stake: number
  unstake: number
  rewards: number
  total: number
}

export interface TimeSeriesPoint {
  timestamp: number
  value: number
  metadata?: Record<string, any>
}

// ============================================================================
// COMPONENT TYPES
// ============================================================================

export interface ComponentProps {
  className?: string
  children?: ReactNode
}

export interface LoadingProps {
  loading?: boolean
  error?: string | null
  retry?: () => void
}

export interface TableColumn<T = any> {
  key: keyof T | string
  title: string
  width?: string | number
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, record: T, index: number) => ReactNode
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  pagination?: {
    current: number
    total: number
    pageSize: number
    onChange: (page: number, pageSize: number) => void
  }
  sorting?: {
    field: string
    direction: 'asc' | 'desc'
    onChange: (field: string, direction: 'asc' | 'desc') => void
  }
  filtering?: {
    filters: Record<string, any>
    onChange: (filters: Record<string, any>) => void
  }
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  maskClosable?: boolean
  children: ReactNode
}

export interface FormFieldProps {
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  help?: string
  className?: string
}

// ============================================================================
// API CLIENT TYPES
// ============================================================================

export interface ApiClientConfig {
  baseURL: string
  timeout: number
  headers?: Record<string, string>
  interceptors?: {
    request?: (config: any) => any
    response?: (response: any) => any
    error?: (error: any) => any
  }
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  params?: Record<string, any>
  data?: any
  headers?: Record<string, string>
  timeout?: number
}

export interface CacheConfig {
  ttl: number
  maxSize: number
  strategy: 'lru' | 'fifo' | 'lfu'
}

// ============================================================================
// FEATURE FLAGS & CONFIGURATION
// ============================================================================

export interface FeatureFlags {
  staking: boolean
  governance: boolean
  advanced_trading: boolean
  analytics: boolean
  mobile_app: boolean
  beta_features: boolean
}

export interface AppConfig {
  api: {
    baseURL: string
    timeout: number
    retries: number
  }
  wallet: {
    networks: SolanaNetwork[]
    defaultNetwork: SolanaNetwork
    autoConnect: boolean
  }
  trading: {
    defaultSlippage: number
    maxSlippage: number
    feeDiscounts: boolean
  }
  features: FeatureFlags
  ui: {
    theme: 'light' | 'dark' | 'system'
    animations: boolean
    sounds: boolean
  }
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
  stack?: string
  context?: Record<string, any>
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface ErrorReport {
  error: AppError
  severity: ErrorSeverity
  userId?: string
  sessionId: string
  userAgent: string
  url: string
  additionalInfo?: Record<string, any>
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export * from './api'
export * from './domain'
export * from './index'
export * from './multisig'
export * from './social'
export * from './treasury'
export * from './wallet' 