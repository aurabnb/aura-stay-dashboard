'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { Footer } from '@/components/Footer'

// Direct imports for better reliability
import { AuraStats } from '@/components/stats/AuraStats'
import { CommunityGrowthMetrics } from '@/components/stats/CommunityGrowthMetrics'
import LiveBurnMetrics from '@/components/analytics/LiveBurnMetrics'
import { VolcanoStayShowcase } from '@/components/property/VolcanoStayShowcase'
import { PropertyShowcase } from '@/components/home/PropertyShowcase'
import { FundingBreakdown } from '@/components/financial/FundingBreakdown'

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Check if user is new (first visit)
    const hasSeenOnboarding = localStorage.getItem('aura_onboarding_completed')
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem('aura_onboarding_completed', 'true')
    setShowOnboarding(false)
  }

  const handleOnboardingClose = () => {
    setShowOnboarding(false)
  }

  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 pt-20">
        <div className="space-y-20">
          {/* Hero Section - Load immediately */}
          <section className="text-center py-16">
            <h1 className="text-5xl md:text-7xl font-bold text-black mb-8 leading-tight">
              Building the World's First
              <br />
              <span className="text-gray-800">
                Decentralized Unique Stay Network
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-5xl mx-auto leading-relaxed mb-16">
              Starting with boutique eco-stays, scaling to resort communities.
              Every property owned by the community, every decision voted
              on-chain.
            </p>

            <img
              loading="lazy"
              src="/lovable-uploads/2c54a081-ee21-40e5-8639-04f3b307ca0b.png"
              alt="Render of the planned Volcano Stay eco-lodge"
              className="w-full max-w-6xl mx-auto rounded-3xl shadow-2xl mb-16"
            />

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="https://t.me/aurabnb"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black hover:bg-gray-800 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 shadow-lg inline-block text-center"
              >
                Join the Movement
              </a>
              <Link
                href="/roadmap"
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-10 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 inline-block text-center"
              >
                View Roadmap
              </Link>
            </div>
          </section>

          {/* Mission Statement - Load immediately */}
          <section className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Redefining Hospitality Through Blockchain
            </h2>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              AURA isn't just about accommodation—it's about creating a new
              paradigm where travelers become stakeholders, communities benefit
              directly, and every stay contributes to a sustainable future.
              We're building more than properties; we're building a movement.
            </p>
          </section>

          {/* Key Stats */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The Numbers Behind Our Vision
              </h2>
              <p className="text-lg text-gray-600">
                Real progress, transparent metrics
              </p>
            </div>
            <AuraStats />
          </section>

          {/* Community Growth */}
          <section className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12">
            <CommunityGrowthMetrics />
          </section>

          {/* 0.8% Burn System */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Token Economics
              </h2>
              <p className="text-lg text-gray-600">
                Automated 0.8% burn and redistribution system powering sustainable growth (through internal app)
              </p>
            </div>
            <LiveBurnMetrics />
          </section>

          {/* Treasury Progress */}
          <section className="bg-gray-50 rounded-3xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Funding Our First Stay
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Watch community-driven funding in real time as we build the
                Volcano Stay in Costa Rica
              </p>
            </div>
            <FundingBreakdown />
          </section>

          {/* Volcano Stay Showcase */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Meet Your First Investment
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                An eco-luxury experience at the edge of Costa Rica's Miravalles
                Volcano
              </p>
            </div>
            <VolcanoStayShowcase />
          </section>

          {/* How it Works steps - Load immediately (lightweight) */}
          <section className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How AURA Works
              </h2>
              <p className="text-lg text-gray-600">
                Simple, transparent, community-driven
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  num: "1",
                  title: "Community Funding",
                  desc: "LP rewards from $AURA trading automatically fund property acquisitions and development",
                  bg: "bg-black",
                },
                {
                  num: "2",
                  title: "Democratic Decisions",
                  desc: "Every aspect of each property is voted on by $AURA holders—from design to amenities",
                  bg: "bg-gray-700",
                },
                {
                  num: "3",
                  title: "Shared Returns",
                  desc: "Revenue flows back to token holders transparently, creating real ownership value",
                  bg: "bg-gray-800",
                },
              ].map((step) => (
                <div key={step.num} className="text-center">
                  <div
                    className={`${step.bg} text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6`}
                  >
                    {step.num}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Property Showcase */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The Experience
              </h2>
              <p className="text-lg text-gray-600">
                A preview of what awaits our community
              </p>
            </div>
            <PropertyShowcase />
          </section>

          {/* CTA Section - Load immediately (lightweight) */}
          <section className="bg-black text-white rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Shape the Future of Hospitality?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Join thousands of forward-thinking individuals building a
              decentralized hospitality empire
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <CtaTile
                href="https://t.me/aurabnb"
                bg="bg-gray-800"
                title="Join Community"
                text="Connect with fellow visionaries"
                button="Join Telegram"
              />
              <CtaTile
                href="/dashboard"
                bg="bg-gray-700"
                title="Track Progress"
                text="Monitor real-time funding"
                button="View Dashboard"
              />
              <CtaTile
                href="/roadmap"
                bg="bg-gray-600"
                title="See the Plan"
                text="Our transparent roadmap"
                button="View Roadmap"
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onClose={handleOnboardingClose}
        />
      )}
    </div>
  )
}



// Lightweight CTA component
interface CtaTileProps {
  href: string
  bg: string
  title: string
  text: string
  button: string
}

const CtaTile: React.FC<CtaTileProps> = ({ href, bg, title, text, button }) => (
  <Link
    href={href}
    className={`${bg} hover:opacity-90 transition-all p-8 rounded-2xl text-left block group hover:scale-105`}
  >
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-300 mb-6">{text}</p>
    <span className="inline-block bg-white text-black px-6 py-3 rounded-full font-semibold group-hover:bg-gray-100 transition-colors">
      {button}
    </span>
  </Link>
)
