// User Types
export interface User {
  id: string;
  publicKey: string;
  role: 'admin' | 'member' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

// Treasury Types
export interface Treasury {
  id: string;
  name: string;
  totalValue: number;
  totalStaked: number;
  totalBurned: number;
  totalRedistributed: number;
  apr: number;
  participants: number;
  status: 'active' | 'paused' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Types
export interface Transaction {
  id: string;
  signature: string;
  type: 'stake' | 'unstake' | 'burn' | 'redistribute' | 'vote';
  amount: number;
  fromAddress: string;
  toAddress?: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockTime: Date;
  slot: number;
}

// Governance Types
export interface Proposal {
  id: string;
  title: string;
  description: string;
  type: 'treasury' | 'protocol' | 'community';
  status: 'draft' | 'active' | 'passed' | 'rejected' | 'executed';
  votesFor: number;
  votesAgainst: number;
  quorum: number;
  startTime: Date;
  endTime: Date;
  createdBy: string;
  executedAt?: Date;
}

export interface Vote {
  id: string;
  proposalId: string;
  voterAddress: string;
  support: boolean;
  weight: number;
  timestamp: Date;
}

// Property Types (for AuraBNB)
export interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  type: 'aura' | 'samsara' | 'airscape';
  status: 'active' | 'maintenance' | 'coming-soon';
  pricePerNight: number;
  amenities: string[];
  sustainability: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  hostId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface AnalyticsData {
  date: string;
  value: number;
  change?: number;
  changePercent?: number;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  description?: string;
} 