import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Wallet, 
  Coins, 
  Vote, 
  TrendingUp, 
  Home, 
  Gift,
  CheckCircle,
  PlayCircle,
  BookOpen,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  content: React.ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  completable: boolean;
}

interface OnboardingFlowProps {
  onComplete: () => void;
  onClose: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(true);
  const { toast } = useToast();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to AuraBNB',
      description: 'The decentralized future of hospitality',
      icon: Home,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Welcome to the Future of Travel</h3>
            <p className="text-gray-600">
              AuraBNB is building a decentralized ecosystem where travelers become stakeholders 
              and every stay contributes to sustainable tourism.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Coins className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">2% Burn Mechanism</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Staking Rewards</p>
            </div>
          </div>
        </div>
      ),
      completable: true
    },
    {
      id: 'wallet',
      title: 'Connect Your Wallet',
      description: 'Start your journey by connecting a Solana wallet',
      icon: Wallet,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Connect Your Solana Wallet</h3>
            <p className="text-gray-600">
              Connect a Solana wallet to interact with AuraBNB's ecosystem, stake tokens, 
              and participate in governance.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center p-3 border rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <img src="/phantom-icon.png" alt="Phantom" className="w-6 h-6" onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }} />
              </div>
              <div className="flex-1">
                <p className="font-medium">Phantom Wallet</p>
                <p className="text-sm text-gray-600">Most popular Solana wallet</p>
              </div>
            </div>
            <div className="flex items-center p-3 border rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <img src="/solflare-icon.png" alt="Solflare" className="w-6 h-6" onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }} />
              </div>
              <div className="flex-1">
                <p className="font-medium">Solflare</p>
                <p className="text-sm text-gray-600">Feature-rich Solana wallet</p>
              </div>
            </div>
          </div>
        </div>
      ),
      action: {
        label: 'Connect Wallet',
        href: '/wallet-hub'
      },
      completable: false
    },
    {
      id: 'aura-token',
      title: 'Get AURA Tokens',
      description: 'Acquire AURA tokens to participate in the ecosystem',
      icon: Coins,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Coins className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Acquire AURA Tokens</h3>
            <p className="text-gray-600">
              AURA tokens are the foundation of our ecosystem. Use them for staking, 
              governance, and accessing exclusive benefits.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Buy with Fiat</h4>
              <p className="text-sm text-gray-600 mb-3">Purchase directly with credit card</p>
              <Button size="sm" variant="outline" className="w-full">
                Buy Now
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Trade on DEX</h4>
              <p className="text-sm text-gray-600 mb-3">Swap SOL for AURA on Meteora</p>
              <Button size="sm" variant="outline" className="w-full">
                Trade
              </Button>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">Token Benefits</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Earn 2% from all ecosystem transactions</li>
              <li>• Vote on governance proposals</li>
              <li>• Access to exclusive property investments</li>
              <li>• Discounts on AuraBNB stays</li>
            </ul>
          </div>
        </div>
      ),
      action: {
        label: 'Get AURA Tokens',
        href: '/buy-fiat'
      },
      completable: false
    },
    {
      id: 'staking',
      title: 'Stake to Earn',
      description: 'Stake your AURA tokens to earn passive rewards',
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <TrendingUp className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Stake Your AURA Tokens</h3>
            <p className="text-gray-600">
              Stake your AURA tokens to earn passive rewards from the 2% burn mechanism 
              and participate in governance decisions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">12.5%</p>
              <p className="text-sm text-green-700">Current APY</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">4x</p>
              <p className="text-sm text-blue-700">Daily Rewards</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm">Minimum Stake</span>
              <span className="font-medium">100 AURA</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm">Reward Distribution</span>
              <span className="font-medium">Every 6 hours</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm">Voting Power</span>
              <span className="font-medium">1:1 ratio</span>
            </div>
          </div>
        </div>
      ),
      action: {
        label: 'Start Staking',
        href: '/stake-to-earn'
      },
      completable: false
    },
    {
      id: 'governance',
      title: 'Participate in Governance',
      description: 'Vote on proposals that shape the future of AuraBNB',
      icon: Vote,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Vote className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Shape the Future</h3>
            <p className="text-gray-600">
              As a staked AURA holder, you have voting power to influence key decisions 
              about property acquisitions, community initiatives, and protocol upgrades.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">Costa Rica Beachfront Property</h4>
                <Badge variant="secondary">Active</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Proposal to acquire 5-acre beachfront property in Guanacaste Province
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600">78% Yes</span>
                <Button size="sm" variant="outline">View Details</Button>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">Solar School in Bali</h4>
                <Badge variant="secondary">Active</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Fund construction of solar-powered school in rural Bali
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600">88% Yes</span>
                <Button size="sm" variant="outline">View Details</Button>
              </div>
            </div>
          </div>
        </div>
      ),
      action: {
        label: 'View Governance',
        href: '/governance'
      },
      completable: false
    },
    {
      id: 'community',
      title: 'Join the Community',
      description: 'Connect with fellow travelers and investors',
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Users className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Join Our Thriving Community</h3>
            <p className="text-gray-600">
              Connect with like-minded travelers, investors, and builders who are 
              shaping the future of decentralized hospitality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="https://t.me/aurabnb" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg mr-3"></div>
                <h4 className="font-semibold">Telegram</h4>
              </div>
              <p className="text-sm text-gray-600">Real-time discussions and updates</p>
            </a>
            
            <a 
              href="https://discord.gg/aurabnb" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-lg mr-3"></div>
                <h4 className="font-semibold">Discord</h4>
              </div>
              <p className="text-sm text-gray-600">Community chat and support</p>
            </a>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-800 mb-2">Community Benefits</h4>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• Early access to new property investments</li>
              <li>• Exclusive community events and meetups</li>
              <li>• Direct access to the founding team</li>
              <li>• Beta access to new features</li>
            </ul>
          </div>
        </div>
      ),
      action: {
        label: 'Join Community',
        href: '/community-board'
      },
      completable: true
    }
  ];

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    toast({
      title: "Onboarding Complete!",
      description: "Welcome to the AuraBNB ecosystem. Start exploring!",
    });
    onComplete();
  };

  const handleSkip = () => {
    onClose();
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="outline">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip Tutorial
            </Button>
          </div>
          
          <Progress value={progress} className="mb-4" />
          
          <CardTitle className="flex items-center justify-center gap-2">
            <currentStepData.icon className="h-6 w-6" />
            {currentStepData.title}
          </CardTitle>
          <CardDescription>
            {currentStepData.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStepData.content}

          <div className="flex justify-between items-center pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStepData.action && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (currentStepData.action?.href) {
                      window.open(currentStepData.action.href, '_blank');
                    }
                    if (currentStepData.action?.onClick) {
                      currentStepData.action.onClick();
                    }
                    if (currentStepData.completable) {
                      markStepComplete(currentStepData.id);
                    }
                  }}
                >
                  {currentStepData.action.label}
                </Button>
              )}
              
              <Button onClick={nextStep}>
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow; 