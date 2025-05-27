
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mountain, Leaf, Droplets, MapPin, Camera, Users, Vote, Calendar } from 'lucide-react';

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
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="relative">
          <div className="bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 h-64 md:h-80 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <Camera className="h-16 w-16 mx-auto mb-4 opacity-80" />
              <p className="text-lg font-medium">Volcano Stay Renderings & Photos</p>
              <p className="text-sm opacity-90">Coming Soon - Watch us build live on X</p>
            </div>
          </div>
          <div className="absolute top-4 left-4">
            <Badge className="bg-green-600 text-white">First AURA Stay</Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-white/90">Under Construction</Badge>
          </div>
        </div>
        
        <CardHeader>
          <CardTitle className="text-3xl font-bold">The Volcano Stay</CardTitle>
          <CardDescription className="text-lg">
            Guayabo, Costa Rica - At the edge of Miravalles Volcano
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              Carved into the lush wilds of Guayabo, Costa Rica, our first $Aura eco-stay isn't just a destination—it's a front-row seat to the primal energy of Miravalles Volcano. Imagine waking up surrounded by rainforest, floor-to-ceiling windows framing the volcano's living, geothermal heartbeat.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This is where the future of travel gets built—literally. Every decision, from architecture to amenities, is voted on live by our community. We're building, filming, and sharing every step on X, letting $Aura holders direct the action and watch real funding flow in.
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Vote className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Community-Driven Build</span>
            </div>
            <p className="text-yellow-700 text-sm">
              Every architectural decision, amenity choice, and design element is voted on by $AURA holders. This is true community ownership in action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Modern Residence</span>
              </div>
              <p className="text-green-700 text-sm">Sustainable bamboo construction with luxury amenities</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mountain className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Green Fields</span>
              </div>
              <p className="text-blue-700 text-sm">Surrounded by pristine volcanic landscape</p>
            </div>
          </div>

          <div className="grid gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{feature.title}</h4>
                    <p className="text-gray-700 text-sm">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                <Calendar className="h-4 w-4 mr-2" />
                Join the Build Process
              </Button>
              <Button variant="outline" className="flex-1">
                <Mountain className="h-4 w-4 mr-2" />
                View Build Updates on X
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VolcanoStayShowcase;
