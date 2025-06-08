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
    default: "AuraBNB - Decentralized Hospitality Network",
    template: "%s | AuraBNB"
  },
  description: "Revolutionary decentralized hospitality platform on Solana. Book unique accommodations with crypto rewards and enhanced Web3 experiences.",
  keywords: ["AuraBNB", "decentralized", "hospitality", "Solana", "crypto", "Web3", "accommodation", "travel"],
  authors: [{ name: "AuraBNB Team" }],
  creator: "AuraBNB",
  metadataBase: new URL('https://aurabnb.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aurabnb.com',
    title: 'AuraBNB - Decentralized Hospitality Network',
    description: 'Revolutionary decentralized hospitality platform on Solana. Book unique accommodations with crypto rewards and enhanced Web3 experiences.',
    siteName: 'AuraBNB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AuraBNB - Decentralized Hospitality Network',
    description: 'Revolutionary decentralized hospitality platform on Solana. Book unique accommodations with crypto rewards and enhanced Web3 experiences.',
    creator: '@AuraBNB',
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
