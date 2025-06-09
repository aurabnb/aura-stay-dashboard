'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, MapPin, Users, Building, Coins } from 'lucide-react';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  progress: number;
  quarter: string;
  icon: React.ReactNode;
  details: string[];
}

export function AuraRoadmapTracker() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const roadmapItems: RoadmapItem[] = [
    {
      id: '1',
      title: 'Token Launch & Community Building',
      description: 'Initial AURA token launch and building the foundation community',
      status: 'completed',
      progress: 100,
      quarter: 'Q4 2024',
      icon: <Coins className="h-5 w-5" />,
      details: [
        'AURA token successfully launched on Solana',
        'Community channels established (Telegram, Twitter)',
        'Initial whitepaper published',
        'Core team assembled'
      ]
    },
    {
      id: '2',
      title: 'Treasury Development',
      description: 'Build automated funding mechanisms through LP rewards',
      status: 'completed',
      progress: 100,
      quarter: 'Q1 2025',
      icon: <Building className="h-5 w-5" />,
      details: [
        'Automated treasury funding system implemented',
        'LP reward distribution mechanism active',
        'Multi-signature wallet security established',
        'Transparent funding tracking dashboard'
      ]
    },
    {
      id: '3',
      title: 'First Property: Volcano Stay',
      description: 'Fund and develop the Costa Rica eco-stay property',
      status: 'in-progress',
      progress: 67,
      quarter: 'Q2 2025',
      icon: <MapPin className="h-5 w-5" />,
      details: [
        'Land acquisition in Guayabo, Costa Rica ✓',
        'Construction permits obtained ✓',
        'Community architectural voting ✓',
        'Construction phase - Currently in progress',
        'Expected opening: July 2025'
      ]
    },
    {
      id: '4',
      title: 'Booking Platform Launch',
      description: 'Community-owned booking system for AURA properties',
      status: 'upcoming',
      progress: 25,
      quarter: 'Q3 2025',
      icon: <Users className="h-5 w-5" />,
      details: [
        'Platform design and architecture planning',
        'Smart contract integration for revenue sharing',
        'Token holder exclusive booking benefits',
        'Integration with major travel platforms'
      ]
    },
    {
      id: '5',
      title: 'Property Portfolio Expansion',
      description: 'Scale to 5-10 unique properties across different countries',
      status: 'upcoming',
      progress: 10,
      quarter: 'Q4 2025',
      icon: <Building className="h-5 w-5" />,
      details: [
        'Community voting on next property locations',
        'Partnerships with local communities',
        'Sustainable development standards',
        'Revenue optimization and distribution'
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'upcoming': return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">AURA Development Roadmap</CardTitle>
        <CardDescription>
          Track our progress from token launch to global property network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {roadmapItems.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Timeline Line */}
              {index < roadmapItems.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
              )}
              
              <div 
                className="flex gap-4 cursor-pointer group"
                onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
              >
                {/* Timeline Dot */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                  item.status === 'completed' 
                    ? 'bg-green-100 border-green-300' 
                    : item.status === 'in-progress'
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-gray-100 border-gray-300'
                }`}>
                  {item.icon}
                </div>

                {/* Content */}
                <div className="flex-1 group-hover:bg-gray-50 rounded-lg p-4 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1 capitalize">{item.status.replace('-', ' ')}</span>
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{item.quarter}</span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{item.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>

                  {/* Expanded Details */}
                  {selectedItem === item.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium mb-2">Details & Milestones</h4>
                      <ul className="space-y-1">
                        {item.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {roadmapItems.filter(item => item.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {roadmapItems.filter(item => item.status === 'in-progress').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {roadmapItems.filter(item => item.status === 'upcoming').length}
              </div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 