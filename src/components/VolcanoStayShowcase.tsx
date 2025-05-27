
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mountain, Leaf, Droplets, MapPin, Vote, Calendar, Users, ExternalLink } from 'lucide-react';

const VolcanoStayShowcase = () => {
  const features = [
    {
      icon: Mountain,
      title: 'Volcano Views',
      description: 'Our site sits at the edge of the legendary Miravalles Volcano, offering jaw-dropping panoramic views of one of Costa Rica\'s most active volcanic landscapes.'
    },
    {
      icon: Leaf,
      title: 'Wild Rainforest',
      description: 'Nestled in a region teeming with biodiversity, you\'ll find yourself surrounded by untouched rainforest, vibrant wildlife, and lush greenery.'
    },
    {
      icon: Droplets,
      title: 'Thermal Wonders',
      description: 'Just minutes away are natural hot springs, bubbling mud pools, and steaming fumaroles created by the volcano\'s hidden power.'
    },
    {
      icon: MapPin,
      title: 'Cultural Roots',
      description: 'Guayabo is home to rich history and ancient secrets, including the nearby Guayabo National Monument—Costa Rica\'s most significant archaeological site.'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section with Image Grid */}
      <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl">
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="relative h-80 md:h-96">
              <img 
                src="/lovable-uploads/a255d40f-c62a-4fb5-bd7d-a579b9db697c.png" 
                alt="Modern eco-lodge with infinity pool at sunset"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div className="relative h-80 md:h-96">
              <img 
                src="/lovable-uploads/92c94a3e-0eca-4fc7-a258-d89786068d3b.png" 
                alt="Treehouse eco-lodges in misty forest"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
          <div className="absolute top-6 left-6">
            <Badge className="bg-green-600 text-white shadow-lg font-urbanist">First AURA Stay</Badge>
          </div>
          <div className="absolute top-6 right-6">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm shadow-lg font-urbanist">Under Construction</Badge>
          </div>
        </div>
        
        <CardHeader className="pb-8">
          <CardTitle className="text-4xl font-bold text-black mb-4 font-urbanist">The Volcano Stay</CardTitle>
          <CardDescription className="text-xl text-gray-600 font-urbanist">
            Guayabo, Costa Rica - At the edge of Miravalles Volcano
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed font-urbanist">
              Carved into the lush wilds of Guayabo, Costa Rica, our first $Aura eco-stay isn't just a destination—it's a front-row seat to the primal energy of Miravalles Volcano. Imagine waking up surrounded by rainforest, floor-to-ceiling windows framing the volcano's living, geothermal heartbeat.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed font-urbanist">
              This is where the future of travel gets built—literally. Every decision, from architecture to amenities, is voted on live by our community. We're building, filming, and sharing every step on X, letting $Aura holders direct the action and watch real funding flow in.
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-3 mb-3">
              <Vote className="h-6 w-6 text-yellow-600" />
              <span className="font-bold text-yellow-800 text-lg font-urbanist">Community-Driven Build</span>
            </div>
            <p className="text-yellow-700 font-urbanist">
              Every architectural decision, amenity choice, and design element is voted on by $AURA holders. This is true community ownership in action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800 font-urbanist">Modern Residence</span>
              </div>
              <p className="text-green-700 font-urbanist">Sustainable bamboo construction with luxury amenities</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Mountain className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800 font-urbanist">Green Fields</span>
              </div>
              <p className="text-blue-700 font-urbanist">Surrounded by pristine volcanic landscape</p>
            </div>
          </div>

          <div className="grid gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex gap-4 p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 text-gray-900 font-urbanist text-lg">{feature.title}</h4>
                    <p className="text-gray-700 font-urbanist leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Future Visions Section */}
      <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900 font-urbanist">Future AURA Destinations</CardTitle>
          <CardDescription className="text-lg text-gray-600 font-urbanist">
            A glimpse into the expanding decentralized travel network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
              <img 
                src="/lovable-uploads/594e9422-b8a8-48a4-bd2f-1d9eddf53b09.png" 
                alt="Safari lodge with giraffes under starry sky"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-bold text-lg font-urbanist">African Safari Lodge</h3>
                <p className="text-sm opacity-90 font-urbanist">Coming 2025</p>
              </div>
            </div>
            
            <div className="relative rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
              <img 
                src="/lovable-uploads/e24f2c1d-4e65-44d4-9912-da910507cf41.png" 
                alt="Hot air balloon lodge at sunrise"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-bold text-lg font-urbanist">Desert Balloon Experience</h3>
                <p className="text-sm opacity-90 font-urbanist">Concept Phase</p>
              </div>
            </div>
            
            <div className="relative rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
              <img 
                src="/lovable-uploads/ad88302f-34e0-425d-b8c5-9aa94aa15afd.png" 
                alt="Futuristic pod accommodations among cherry blossoms"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-bold text-lg font-urbanist">Japanese Tree Pods</h3>
                <p className="text-sm opacity-90 font-urbanist">Community Vote</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2 font-urbanist">Ready to Join the Build?</h3>
              <p className="text-green-100 font-urbanist">
                Follow our construction progress and vote on key decisions
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="secondary" 
                className="bg-white text-green-700 hover:bg-gray-100 font-urbanist font-semibold"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Build Timeline
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 font-urbanist font-semibold"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Follow on X
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VolcanoStayShowcase;
