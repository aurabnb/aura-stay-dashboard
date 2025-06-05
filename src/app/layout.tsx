import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  preload: true
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: 'swap',
  preload: true
});

export const metadata: Metadata = {
  title: {
    default: "AuraBNB - Decentralized Hospitality Network",
    template: "%s | AuraBNB"
  },
  description: "Building the world's first community-owned hospitality network. Stake, earn, and participate in democratically governed unique stays.",
  keywords: ["DeFi", "Hospitality", "Solana", "Decentralized", "Travel", "DAO", "Staking", "Treasury", "Governance", "Real Estate"],
  authors: [{ name: "AuraBNB Team" }],
  creator: "AuraBNB Community",
  publisher: "AuraBNB Community",
  metadataBase: new URL('https://aurabnb.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "AuraBNB - Decentralized Hospitality Network",
    description: "Community-owned unique stays powered by blockchain",
    type: "website",
    locale: "en_US",
    url: 'https://aurabnb.com',
    siteName: "AuraBNB",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AuraBNB Dashboard',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraBNB - Decentralized Hospitality Network",
    description: "Community-owned unique stays powered by blockchain",
    images: ['/og-image.png'],
    creator: '@aurabnb',
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
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://api.coingecko.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//api.coingecko.com" />
        
        {/* Icons and manifest */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* PWA meta tags */}
        <meta name="application-name" content="AuraBNB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AuraBNB" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans antialiased" suppressHydrationWarning>
        <ErrorBoundary
          onError={(error, errorInfo) => {
            // Log error to monitoring service
            console.error('Application error:', error, errorInfo)
            
            // In production, send to error reporting service
            if (process.env.NODE_ENV === 'production') {
              // Send to Sentry, LogRocket, etc.
            }
          }}
        >
          <ClientProviders>
            <div className="relative min-h-screen">
              {/* Background Effects */}
              <div className="fixed inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 pointer-events-none" />
              <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/10 via-transparent to-transparent pointer-events-none" />
              
              {/* Main Content */}
              <main className="relative">
                {children}
              </main>
            </div>
          </ClientProviders>
        </ErrorBoundary>
        
        {/* Analytics Scripts */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            {process.env.NEXT_PUBLIC_GA_ID && (
              <>
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                        page_title: document.title,
                        page_location: window.location.href,
                      });
                    `,
                  }}
                />
              </>
            )}
          </>
        )}
      </body>
    </html>
  );
}
