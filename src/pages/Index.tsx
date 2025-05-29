import React from "react"
import { Link } from "react-router-dom"

import Header from "@/components/Header"
import TreasuryProgress from "@/components/TreasuryProgress"
import TreasuryProgressSkeleton from "@/components/TreasuryProgressSkeleton"
import FundingBreakdown from "@/components/FundingBreakdown"
import VolcanoStayShowcase from "@/components/VolcanoStayShowcase"
import AuraRoadmapTracker from "@/components/AuraRoadmapTracker"
import AuraStats from "@/components/AuraStats"

import { useTreasuryData } from "@/hooks/useTreasuryData"

/* -------------------------------------------------------------------------- */
/*                                  Page                                      */
/* -------------------------------------------------------------------------- */
const Index: React.FC = () => {
  const { data, loading, error } = useTreasuryData()

  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 pt-20">
        <div className="space-y-20">
          {/* ----------------------------- Hero ----------------------------- */}
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
              <button
                type="button"
                className="bg-black hover:bg-gray-800 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 shadow-lg"
              >
                Join the Movement
              </button>
              <button
                type="button"
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-10 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105"
              >
                Explore the Vision
              </button>
            </div>
          </section>

          {/* ----------------------- Mission Statement ---------------------- */}
          <section className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Redefining Hospitality Through Blockchain
            </h2>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              AURA isn't just about accommodation—it’s about creating a new
              paradigm where travelers become stakeholders, communities benefit
              directly, and every stay contributes to a sustainable future.
              We're building more than properties; we're building a movement.
            </p>
          </section>

          {/* --------------------------- Key Stats -------------------------- */}
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

          {/* ---------------------- Treasury Progress ----------------------- */}
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

            {loading ? (
              <TreasuryProgressSkeleton />
            ) : error ? (
              <p className="text-red-600 text-center">
                Failed to load treasury data.
              </p>
            ) : (
              <TreasuryProgress treasury={data} />
            )}
          </section>

          {/* -------------------- Volcano Stay Showcase --------------------- */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Meet Your First Investment
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                An eco-luxury experience at the edge of Costa Rica’s Miravalles
                Volcano
              </p>
            </div>
            <VolcanoStayShowcase />
          </section>

          {/* ---------------------- How it Works steps ---------------------- */}
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
                    className={`w-16 h-16 ${step.bg} rounded-full flex items-center justify-center mx-auto mb-6`}
                  >
                    <span className="text-white font-bold text-xl">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-gray-700">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* --------------------- AURA Roadmap tracker --------------------- */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our Journey Forward
              </h2>
              <p className="text-lg text-gray-600">
                Tracking progress through our pilot phase
              </p>
            </div>
            <AuraRoadmapTracker />
          </section>

          {/* --------------------- Funding Transparency --------------------- */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Complete Financial Transparency
              </h2>
              <p className="text-lg text-gray-600">
                See exactly how funds flow in and out
              </p>
            </div>
            <FundingBreakdown />
          </section>

          {/* ------------------- Two big CTA Tiles section ------------------ */}
          <section className="grid md:grid-cols-2 gap-8">
            <CtaTile
              to="/value-indicator"
              bg="black"
              title="Treasury Monitor"
              text="Real-time tracking of funding progress, wallet balances, and financial transparency for the Volcano Stay project"
              button="Monitor Treasury"
            />
            <CtaTile
              to="/community-board"
              bg="gray-700"
              title="Community Hub"
              text="Share ideas, vote on decisions, and connect with fellow AURA community members building the future"
              button="Join Community"
            />
          </section>

          {/* -------------------------- Final CTA --------------------------- */}
          <section className="bg-gradient-to-r from-black to-gray-900 rounded-3xl p-16 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Ready to Shape Travel's Future?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join the AURA community and help build the world's first
              decentralized unique stay network. Every token holder becomes a
              co-owner in this revolutionary hospitality ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                type="button"
                className="bg-white hover:bg-gray-100 text-black px-10 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105"
              >
                Buy $AURA Token
              </button>
              <button
                type="button"
                className="border-2 border-white hover:bg-white hover:text-black text-white px-10 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105"
              >
                Read Whitepaper
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Helper component                              */
/* -------------------------------------------------------------------------- */
interface CtaTileProps {
  to: string
  bg: string // Tailwind color name, e.g. "black" or "gray-700"
  title: string
  text: string
  button: string
}

const CtaTile: React.FC<CtaTileProps> = ({ to, bg, title, text, button }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 text-center border border-gray-200 hover:shadow-lg transition-shadow">
    <div
      className={`w-20 h-20 bg-${bg} rounded-full flex items-center justify-center mx-auto mb-8`}
    >
      {/* placeholder icon */}
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
    <h3 className="text-2xl font-bold mb-6">{title}</h3>
    <p className="text-gray-700 mb-8 text-lg leading-relaxed">{text}</p>
    <Link
      to={to}
      className={`inline-block bg-${bg} text-white px-8 py-4 rounded-full font-semibold hover:bg-opacity-90 transition-colors text-lg`}
    >
      {button}
    </Link>
  </div>
)

export default Index