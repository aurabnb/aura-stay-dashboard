
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Users, TrendingUp, ExternalLink, Globe, Heart } from 'lucide-react';

const AuraEcosystemShowcase = () => {
  const ecosystemStats = [
    { label: 'Of Profits To Holders', value: '75%', description: 'Direct rewards to $AURA holders' },
    { label: 'Of LP Funds New Stays', value: '80%', description: 'Growing the travel network' },
    { label: 'Transparently Built', value: '100%', description: 'Every allocation tracked on-chain' }
  ];

  const platformLinks = [
    { name: 'DexScreener', icon: '🔍' },
    { name: 'Believe', icon: '💎' },
    { name: 'Telegram', icon: '💬' },
    { name: 'DexTools', icon: '🛠️' },
    { name: 'Solscan', icon: '🔍' },
    { name: 'CoinGecko', icon: '🦎' }
  ];

  const fundingBreakdown = [
    { category: 'Operations', percentage: 5, description: 'For upkeep and administrative tasks' },
    { category: 'Business Costs', percentage: 5, description: 'Infrastructure and Organizational Maintenance' },
    { category: 'Marketing', percentage: 10, description: 'Growth initiatives & community building' }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 shadow-2xl overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20" />
          <CardHeader className="relative z-10 pb-8">
            <Badge className="bg-green-500 text-white w-fit mb-4 font-urbanist">Transparency First</Badge>
            <CardTitle className="text-4xl font-bold mb-4 font-urbanist">
              No Team Token Dumps. No Black Boxes.
            </CardTitle>
            <CardDescription className="text-xl text-gray-300 font-urbanist max-w-3xl">
              AURA is funded strictly by liquidity provider (LP) rewards—a first principles approach. 
              The team never sells tokens. All project funding flows transparently via dedicated Solana addresses. 
              See every allocation as it happens.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {ecosystemStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-5xl font-bold text-green-400 mb-2 font-urbanist">{stat.value}</div>
                  <div className="text-lg font-semibold text-white mb-1 font-urbanist">{stat.label}</div>
                  <div className="text-sm text-gray-400 font-urbanist">{stat.description}</div>
                </div>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="text-xl font-bold mb-4 text-center font-urbanist">Find Us On</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {platformLinks.map((platform, index) => (
                  <div key={index} className="flex flex-col items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="text-2xl mb-2">{platform.icon}</div>
                    <span className="text-sm font-medium font-urbanist">{platform.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Community Ownership Section */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="relative h-80 md:h-96">
          <img 
            src="/lovable-uploads/793247ad-c6dd-4862-bd9b-51240fcd9e2e.png" 
            alt="Aurora borealis over modern eco-lodges"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-8 left-8 max-w-md">
            <Badge className="bg-black text-white mb-4 font-urbanist">Community</Badge>
            <h2 className="text-3xl font-bold text-white mb-2 font-urbanist">
              AURA is a first-of-its-kind experiment in real-world, community-owned hospitality.
            </h2>
            <p className="text-gray-200 font-urbanist">
              Community-owned. You hold the tokens. You make the decisions.
            </p>
          </div>
        </div>
      </Card>

      {/* LP Funds Breakdown */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900 font-urbanist">LP Funds Breakdown</CardTitle>
          <CardDescription className="text-lg text-gray-600 font-urbanist">
            We fuel every project with LP rewards from trading—no team token sales, no dilution, and no hidden moves.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed font-urbanist">
              Liquidity providers earn fees, and those rewards are streamed straight into project funding: 
              building new properties, powering operations, marketing, and covering all costs. This first-principles 
              approach means $Aura grows organically while holders retain ownership—letting our community benefit 
              and expand, without ever selling tokens.
            </p>
          </div>

          <div className="grid gap-6">
            {fundingBreakdown.map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 font-urbanist">{item.percentage}% {item.category}</h3>
                  <p className="text-gray-700 font-urbanist">{item.description}</p>
                  <Button variant="link" className="p-0 h-auto text-blue-600 font-urbanist">
                    Monitor It Here <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="h-6 w-6 text-green-600" />
              <span className="font-bold text-green-800 text-lg font-urbanist">About Us</span>
            </div>
            <p className="text-green-700 font-urbanist">
              Learn more about our mission to revolutionize travel through decentralized ownership and community governance.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reward Distribution Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="relative h-64">
            <img 
              src="/lovable-uploads/a9343841-15d5-4dd0-95fb-6dba8bf2fadf.png" 
              alt="Underwater eco-lodge with marine life"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <div className="text-3xl font-bold mb-1 font-urbanist">75%</div>
              <div className="text-lg font-semibold font-urbanist">to $Aura Holders</div>
            </div>
          </div>
          <CardContent className="p-6">
            <p className="text-gray-700 font-urbanist">
              The majority of returns go directly back to $Aura holders as real, on-chain rewards. 
              Share in the profits from every unique stay—your tokens mean real ownership. 
              The more you hold, the bigger your piece of the adventure.
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="relative h-64">
            <img 
              src="/lovable-uploads/a9343841-15d5-4dd0-95fb-6dba8bf2fadf.png" 
              alt="Desert eco-lodges with pools"
              className="w-full h-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <div className="text-3xl font-bold mb-1 font-urbanist">10%</div>
              <div className="text-lg font-semibold font-urbanist">for Maintenance and Taxes</div>
            </div>
          </div>
          <CardContent className="p-6">
            <p className="text-gray-700 font-urbanist">
              We keep each property pristine by setting aside funds for maintenance and cleaning. 
              Taxes and regulatory costs are covered transparently, with no surprises. 
              This ensures hassle-free experiences for both guests and investors.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuraEcosystemShowcase;
