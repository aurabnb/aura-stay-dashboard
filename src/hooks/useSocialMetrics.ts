'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchTwitterFollowers, fetchTelegramMembers, fetchLinkedInFollowers } from '@/lib/api/socialService';
import type { SocialMetrics, UseSocialMetricsReturn } from '@/types/social';

export const useSocialMetrics = (): UseSocialMetricsReturn => {
  const [metrics, setMetrics] = useState<SocialMetrics>({
    twitter: { followers: 0, isLoading: true, error: null },
    telegram: { members: 0, isLoading: true, error: null },
    linkedin: { followers: 0, isLoading: true, error: null },
    lastUpdated: null,
  });

  const { toast } = useToast();

  const fetchTwitterData = async () => {
    try {
      setMetrics((prev) => ({
        ...prev,
        twitter: { ...prev.twitter, isLoading: true, error: null },
      }));

      const data = await fetchTwitterFollowers();

      setMetrics((prev) => ({
        ...prev,
        twitter: {
          followers: data.followers || 0,
          isLoading: false,
          error: null,
        },
      }));
    } catch (error) {
      console.error('Error fetching Twitter followers:', error);
      setMetrics((prev) => ({
        ...prev,
        twitter: {
          followers: 0,
          isLoading: false,
          error: 'Unable to fetch',
        },
      }));
    }
  };

  const fetchTelegramData = async () => {
    try {
      setMetrics((prev) => ({
        ...prev,
        telegram: { ...prev.telegram, isLoading: true, error: null },
      }));

      const data = await fetchTelegramMembers();

      setMetrics((prev) => ({
        ...prev,
        telegram: {
          members: data.members || 0,
          isLoading: false,
          error: null,
        },
      }));
    } catch (error) {
      console.error('Error fetching Telegram members:', error);
      setMetrics((prev) => ({
        ...prev,
        telegram: {
          members: 0,
          isLoading: false,
          error: 'Unable to fetch',
        },
      }));
    }
  };

  const fetchLinkedInData = async () => {
    try {
      setMetrics((prev) => ({
        ...prev,
        linkedin: { ...prev.linkedin, isLoading: true, error: null },
      }));

      const data = await fetchLinkedInFollowers();

      setMetrics((prev) => ({
        ...prev,
        linkedin: {
          followers: data.followers || 0,
          isLoading: false,
          error: null,
        },
      }));
    } catch (error) {
      console.error('Error fetching LinkedIn followers:', error);
      setMetrics((prev) => ({
        ...prev,
        linkedin: {
          followers: 0,
          isLoading: false,
          error: 'Unable to fetch',
        },
      }));
    }
  };

  const fetchAllMetrics = async () => {
    try {
      await Promise.all([
        fetchTwitterData(),
        fetchTelegramData(),
        fetchLinkedInData(),
      ]);

      setMetrics((prev) => ({
        ...prev,
        lastUpdated: new Date(),
      }));

      toast({
        title: 'Social Metrics Updated',
        description: 'Successfully fetched latest follower counts',
      });
    } catch (error) {
      console.error('Error fetching social metrics:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not fetch social media metrics',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchAllMetrics();

    // Update every 10 minutes
    const interval = setInterval(fetchAllMetrics, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const isLoading = metrics.twitter.isLoading || metrics.telegram.isLoading || metrics.linkedin.isLoading;

  return {
    metrics,
    refreshMetrics: fetchAllMetrics,
    isLoading,
  };
}; 