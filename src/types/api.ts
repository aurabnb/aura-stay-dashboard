// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Treasury API Types
export interface TreasuryStats {
  totalValue: number;
  totalStaked: number;
  totalBurned: number;
  totalRedistributed: number;
  apr: number;
  participants: number;
}

// Wallet API Types
export interface WalletConnectRequest {
  publicKey: string;
  signature: string;
}

export interface WalletConnectResponse {
  token: string;
  user: {
    id: string;
    publicKey: string;
    role: string;
  };
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
} 