"use client"

import { useEffect } from 'react'

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export function GoogleAnalytics() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !GA_TRACKING_ID) return;
    
    // Initialize Google Analytics if not already done
    if (!window.gtag) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;

      gtag('js', new Date());
      gtag('config', GA_TRACKING_ID, {
        page_title: typeof document !== 'undefined' ? document.title : '',
        page_location: typeof window !== 'undefined' ? window.location.href : '',
        custom_map: { metric1: 'wallet_connections' }
      });
    }
  }, []);

  return null; // This component doesn't render anything
} 