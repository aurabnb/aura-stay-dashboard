
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Users } from 'lucide-react';

interface Suggestion {
  id: string;
  submittedBy: string;
  date: string;
  content: string;
  userTokenBalance: string;
  status: 'Implemented' | 'Pending Review' | 'Approved';
}

const CommunityBoard = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isSignedUp, setIsSignedUp] = useState(false);

  const suggestions: Suggestion[] = [
    {
      id: '1',
      submittedBy: 'new.user@example.com',
      date: 'May 25, 2025, 11:23:55 PM',
      content: 'Improve documentation for new users.',
      userTokenBalance: '50 AURA',
      status: 'Implemented'
    },
    {
      id: '2',
      submittedBy: 'investor.aura@example.com',
      date: 'May 24, 2025, 11:23:55 PM',
      content: 'Increase marketing spend in Asia-Pacific region.',
      userTokenBalance: '10,000 AURA',
      status: 'Pending Review'
    },
    {
      id: '3',
      submittedBy: 'community.member1@example.com',
      date: 'May 22, 2025, 11:23:55 PM',
      content: 'Host a hackathon to encourage development on Aura.',
      userTokenBalance: '1,500 AURA',
      status: 'Approved'
    }
  ];

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsSignedUp(true);
    }
  };

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestion.trim()) {
      // In real implementation, this would submit to the blockchain
      console.log('Submitting suggestion:', suggestion);
      setSuggestion('');
      alert('Suggestion submitted successfully!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Implemented': return 'text-green-600 bg-green-50 border-green-200';
      case 'Approved': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Pending Review': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Community Board
        </CardTitle>
        <CardDescription>
          Engage with the Aura Foundation community, share ideas, and view proposals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left side - Join and Submit */}
          <div className="space-y-6">
            {!isSignedUp ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Join the Community
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Sign up to submit suggestions and view your token balance.
                </p>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Sign Up
                  </Button>
                </form>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  💡 Submit a Suggestion
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Share your ideas to improve the Aura Foundation.
                </p>
                <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Suggestion
                    </label>
                    <Textarea
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      placeholder="Enter your suggestion here..."
                      rows={4}
                      required
                    />
                  </div>
                  <p className="text-red-500 text-sm">
                    Sign up to submit suggestions.
                  </p>
                  <Button type="submit" className="w-full" disabled>
                    Submit Suggestion
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Right side - Suggestions Feed */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Suggestions Feed
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {suggestions.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Submitted by:</span> {item.submittedBy}
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    📅 {item.date}
                  </div>
                  <p className="text-gray-900 mb-3">{item.content}</p>
                  <div className="text-sm text-gray-600">
                    💰 User token balance at submission: {item.userTokenBalance}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500 text-center">
              A list of recent foundation transactions.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityBoard;
