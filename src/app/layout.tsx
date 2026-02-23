import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: "--font-poppins",
  display: 'swap',
  preload: true
});

export const metadata: Metadata = {
  title: {
    default: "Airscape (AURA) - Decentralized Hospitality Platform",
    template: "%s | Airscape (AURA)",
  },
  description: "Decentralized hospitality platform on Solana. Book unique accommodations with crypto rewards and enhanced Web3 experiences.",
  keywords: [
    "Solana", 
    "Web3", 
    "Hospitality", 
    "Crypto", 
    "Accommodations", 
    "Decentralized", 
    "AURA", 
    "Staking", 
    "DeFi"
  ],
  authors: [{ name: "Airscape Team" }],
  creator: "Airscape",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "Airscape (AURA) - Decentralized Hospitality Platform",
    description: 'Decentralized hospitality platform on Solana. Book unique accommodations with crypto rewards and enhanced Web3 experiences.',
    siteName: "Airscape (AURA)",
  },
  twitter: {
    card: "summary_large_image",
    title: "Airscape (AURA) - Decentralized Hospitality Platform",
    description: 'Decentralized hospitality platform on Solana. Book unique accommodations with crypto rewards and enhanced Web3 experiences.',
    creator: "@AirscapeTeam",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${inter.className} antialiased overflow-x-hidden`}>
        <ErrorBoundary>
          <ClientProviders>
            <GoogleAnalytics />
            {children}
          </ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  )
}
