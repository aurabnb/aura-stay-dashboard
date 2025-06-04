import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "AuraBNB - Decentralized Hospitality Network",
  description: "Building the world's first community-owned hospitality network. Stake, earn, and participate in democratically governed unique stays.",
  keywords: ["DeFi", "Hospitality", "Solana", "Decentralized", "Travel", "DAO", "Staking"],
  authors: [{ name: "AuraBNB Team" }],
  openGraph: {
    title: "AuraBNB - Decentralized Hospitality Network",
    description: "Community-owned unique stays powered by blockchain",
    type: "website",
    locale: "en_US",
    siteName: "AuraBNB",
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraBNB - Decentralized Hospitality Network",
    description: "Community-owned unique stays powered by blockchain",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans antialiased" suppressHydrationWarning>
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
      </body>
    </html>
  );
}
