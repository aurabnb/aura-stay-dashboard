export interface SocialPlatformMetrics {
  followers?: number;
  members?: number;
  isLoading: boolean;
  error: string | null;
}

export interface SocialMetrics {
  twitter: SocialPlatformMetrics & { followers: number };
  telegram: SocialPlatformMetrics & { members: number };
  linkedin: SocialPlatformMetrics & { followers: number };
  lastUpdated: Date | null;
}

export interface UseSocialMetricsReturn {
  metrics: SocialMetrics;
  refreshMetrics: () => Promise<void>;
  isLoading: boolean;
} 