import React from "react"
import Header from "../components/Header"
import TreasuryProgress from "../components/TreasuryProgress"
import FundingBreakdown from "../components/FundingBreakdown"
import VolcanoStayShowcase from "../components/VolcanoStayShowcase"
import AuraRoadmapTracker from "../components/AuraRoadmapTracker"
import AuraStats from "../components/AuraStats"
import LoadingSpinner from "../components/LoadingSpinner"
import { useTreasuryData } from "../hooks/useTreasuryData"

const Index = () => {
  const { data, loading, error, lastRefresh, apiStatus, fetchData } =
    useTreasuryData()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="space-y-20">
          {/* Hero Section */}
          <section className="text-center py-16">
            <h1 className="text-5xl md:text-7xl font-bold text-black mb-8 font-urbanist leading-tight">
              Building the World's First
              <br />
              <span className="text-gray-800">
                Decentralized Unique Stay Network
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-5xl mx-auto font-urbanist leading-relaxed mb-16">
              Starting with boutique eco-stays, scaling to resort communities.
              Every property owned by the community, every decision voted
              on-chain.
            </p>

            {/* Hero Image */}
            <div className="mb-16">
              <img
                src="/lovable-uploads/2c54a081-ee21-40e5-8639-04f3b307ca0b.png"
                alt="Northern lights over a serene landscape"
                className="w-full max-w-6xl mx-auto rounded-3xl shadow-2xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="bg-black hover:bg-gray-800 text-white px-10 py-4 rounded-full font-urbanist font-semibold text-lg transition-all hover:scale-105 shadow-lg">
                Join the Movement
              </button>
              <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-10 py-4 rounded-full font-urbanist font-semibold text-lg transition-all hover:scale-105">
                Explore the Vision
              </button>
            </div>
          </section>

          {/* Mission Statement */}
          <section className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-urbanist">
              Redefining Hospitality Through Blockchain
            </h2>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto font-urbanist leading-relaxed">
              AURA isn't just about accommodation—it's about creating a new
              paradigm where travelers become stakeholders, communities benefit
              directly, and every stay contributes to a sustainable future.
              We're building more than properties; we're building a movement.
            </p>
          </section>

          {/* Key Stats */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-urbanist">
                The Numbers Behind Our Vision
              </h2>
              <p className="text-lg text-gray-600 font-urbanist">
                Real progress, transparent metrics
              </p>
            </div>
            <AuraStats />
          </section>

          {/* Treasury Progress */}
          <section className="bg-gray-50 rounded-3xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-urbanist">
                Funding Our First Stay
              </h2>
              <p className="text-lg text-gray-600 font-urbanist max-w-3xl mx-auto">
                Watch our community-driven funding in real-time as we build the
                Volcano Stay in Costa Rica
              </p>
            </div>
            <TreasuryProgress currentAmount={20000} targetAmount={100000} />
          </section>

          {/* Volcano Stay Showcase */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-urbanist">
                Meet Your First Investment
              </h2>
              <p className="text-lg text-gray-600 font-urbanist max-w-3xl mx-auto">
                An eco-luxury experience at the edge of Costa Rica's Miravalles
                Volcano
              </p>
            </div>
            <VolcanoStayShowcase />
          </section>

          {/* How It Works */}
          <section className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-urbanist">
                How AURA Works
              </h2>
              <p className="text-lg text-gray-600 font-urbanist">
                Simple, transparent, community-driven
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 font-urbanist">
                  Community Funding
                </h3>
                <p className="text-gray-700 font-urbanist">
                  LP rewards from $AURA trading automatically fund property
                  acquisitions and development
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 font-urbanist">
                  Democratic Decisions
                </h3>
                <p className="text-gray-700 font-urbanist">
                  Every aspect of each property is voted on by $AURA
                  holders—from design to amenities
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 font-urbanist">
                  Shared Returns
                </h3>
                <p className="text-gray-700 font-urbanist">
                  Revenue flows back to token holders transparently, creating
                  real ownership value
                </p>
              </div>
            </div>
          </section>

          {/* AURA Roadmap Progress */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-urbanist">
                Our Journey Forward
              </h2>
              <p className="text-lg text-gray-600 font-urbanist">
                Tracking progress through our pilot phase
              </p>
            </div>
            <AuraRoadmapTracker />
          </section>

          {/* Funding Transparency */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-urbanist">
                Complete Financial Transparency
              </h2>
              <p className="text-lg text-gray-600 font-urbanist">
                See exactly how funds flow in and out
              </p>
            </div>
            <FundingBreakdown />
          </section>

          {/* Community Access */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 text-center border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-6 font-urbanist">
                Treasury Monitor
              </h3>
              <p className="text-gray-700 mb-8 font-urbanist text-lg leading-relaxed">
                Real-time tracking of funding progress, wallet balances, and
                financial transparency for the Volcano Stay project
              </p>
              <a
                href="/value-indicator"
                className="inline-block bg-black text-white px-8 py-4 rounded-full font-urbanist font-semibold hover:bg-gray-800 transition-colors text-lg"
              >
                Monitor Treasury
              </a>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 text-center border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-6 font-urbanist">
                Community Hub
              </h3>
              <p className="text-gray-700 mb-8 font-urbanist text-lg leading-relaxed">
                Share ideas, vote on decisions, and connect with fellow AURA
                community members building the future
              </p>
              <a
                href="/community-board"
                className="inline-block bg-gray-700 text-white px-8 py-4 rounded-full font-urbanist font-semibold hover:bg-gray-800 transition-colors text-lg"
              >
                Join Community
              </a>
            </div>
          </section>

          {/* Call to Action */}
          <section className="bg-gradient-to-r from-black to-gray-900 rounded-3xl p-16 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 font-urbanist">
              Ready to Shape Travel's Future?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto font-urbanist leading-relaxed">
              Join the AURA community and help build the world's first
              decentralized unique stay network. Every token holder becomes a
              co-owner in this revolutionary hospitality ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="bg-white hover:bg-gray-100 text-black px-10 py-4 rounded-full font-urbanist font-semibold text-lg transition-all hover:scale-105">
                Buy $AURA Token
              </button>
              <button className="border-2 border-white hover:bg-white hover:text-black text-white px-10 py-4 rounded-full font-urbanist font-semibold text-lg transition-all hover:scale-105">
                Read Whitepaper
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Index
