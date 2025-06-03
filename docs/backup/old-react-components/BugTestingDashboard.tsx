
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bug, CheckCircle, AlertTriangle, XCircle, RefreshCw, Play, Pause, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestCase {
  id: string;
  name: string;
  category: 'ui' | 'api' | 'navigation' | 'data' | 'performance';
  status: 'passing' | 'failing' | 'warning' | 'pending';
  description: string;
  lastRun?: Date;
  duration?: number;
  error?: string;
}

interface BugReport {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'fixed' | 'investigating';
  component: string;
  description: string;
  reproductionSteps: string[];
  reportedAt: Date;
}

const BugTestingDashboard = () => {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const { toast } = useToast();

  // Initialize test cases
  useEffect(() => {
    const initialTestCases: TestCase[] = [
      {
        id: 'ui-001',
        name: 'Token List Rendering',
        category: 'ui',
        status: 'passing',
        description: 'Verify token list displays correctly with all required information',
        lastRun: new Date(),
        duration: 250
      },
      {
        id: 'ui-002',
        name: 'Trading Dashboard Layout',
        category: 'ui',
        status: 'passing',
        description: 'Check responsive layout on different screen sizes',
        lastRun: new Date(),
        duration: 180
      },
      {
        id: 'api-001',
        name: 'Treasury Data Fetch',
        category: 'api',
        status: 'passing',
        description: 'Validate treasury data API responses and error handling',
        lastRun: new Date(),
        duration: 420
      },
      {
        id: 'api-002',
        name: 'Jupiter Price API',
        category: 'api',
        status: 'warning',
        description: 'Test Jupiter price API integration and fallback mechanisms',
        lastRun: new Date(),
        duration: 380,
        error: 'Intermittent timeout issues detected'
      },
      {
        id: 'nav-001',
        name: 'Route Navigation',
        category: 'navigation',
        status: 'passing',
        description: 'Test all route transitions and parameter handling',
        lastRun: new Date(),
        duration: 150
      },
      {
        id: 'nav-002',
        name: 'Header Links',
        category: 'navigation',
        status: 'failing',
        description: 'Verify header navigation links work correctly',
        lastRun: new Date(),
        duration: 90,
        error: 'Mobile menu not closing properly on link click'
      },
      {
        id: 'data-001',
        name: 'Wallet Balance Display',
        category: 'data',
        status: 'passing',
        description: 'Test wallet balance calculations and formatting',
        lastRun: new Date(),
        duration: 320
      },
      {
        id: 'data-002',
        name: 'Portfolio Analytics',
        category: 'data',
        status: 'warning',
        description: 'Validate portfolio metrics and historical data',
        lastRun: new Date(),
        duration: 540,
        error: 'Historical data gaps for some time periods'
      },
      {
        id: 'perf-001',
        name: 'Page Load Performance',
        category: 'performance',
        status: 'passing',
        description: 'Monitor page load times and bundle sizes',
        lastRun: new Date(),
        duration: 1200
      },
      {
        id: 'perf-002',
        name: 'Chart Rendering Speed',
        category: 'performance',
        status: 'warning',
        description: 'Test chart rendering performance with large datasets',
        lastRun: new Date(),
        duration: 850,
        error: 'Slow rendering with >1000 data points'
      }
    ];

    setTestCases(initialTestCases);

    // Initialize bug reports
    const initialBugs: BugReport[] = [
      {
        id: 'bug-001',
        title: 'Mobile menu not closing on navigation',
        severity: 'medium',
        status: 'investigating',
        component: 'Header.tsx',
        description: 'Mobile navigation menu remains open after clicking a link',
        reproductionSteps: [
          'Open mobile view',
          'Click hamburger menu',
          'Click any navigation link',
          'Observe menu stays open'
        ],
        reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'bug-002',
        title: 'Chart rendering performance degradation',
        severity: 'low',
        status: 'open',
        component: 'PriceChart.tsx',
        description: 'Charts become slow to render with large datasets',
        reproductionSteps: [
          'Navigate to price chart',
          'Select long time period (1 month+)',
          'Observe slow rendering'
        ],
        reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'bug-003',
        title: 'Intermittent API timeout errors',
        severity: 'high',
        status: 'investigating',
        component: 'JupiterPriceAPI.tsx',
        description: 'Jupiter price API occasionally times out causing data loading failures',
        reproductionSteps: [
          'Navigate to trading dashboard',
          'Wait for automatic refresh cycles',
          'Observe occasional timeout errors'
        ],
        reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    setBugs(initialBugs);
  }, []);

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestProgress(0);

    // Simulate running tests
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setTestProgress(i);
    }

    // Update test results
    const updatedTests = testCases.map(test => ({
      ...test,
      lastRun: new Date(),
      status: Math.random() > 0.8 ? 'failing' : Math.random() > 0.9 ? 'warning' : 'passing' as any,
      duration: Math.floor(Math.random() * 1000) + 100
    }));

    setTestCases(updatedTests);
    setIsRunningTests(false);

    const failingTests = updatedTests.filter(t => t.status === 'failing').length;
    const warningTests = updatedTests.filter(t => t.status === 'warning').length;

    toast({
      title: "Test Suite Complete",
      description: `${updatedTests.length} tests run. ${failingTests} failing, ${warningTests} warnings.`,
      variant: failingTests > 0 ? "destructive" : "default"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passing': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failing': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <RefreshCw className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passing': return 'bg-green-100 text-green-800 border-green-200';
      case 'failing': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const passingTests = testCases.filter(t => t.status === 'passing').length;
  const failingTests = testCases.filter(t => t.status === 'failing').length;
  const warningTests = testCases.filter(t => t.status === 'warning').length;
  const testSuccessRate = (passingTests / testCases.length) * 100;

  return (
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-black font-urbanist flex items-center gap-2">
              <Bug className="h-6 w-6 text-red-600" />
              Bug Testing Dashboard
            </CardTitle>
            <CardDescription className="text-gray-600 font-urbanist mt-2">
              Comprehensive testing and bug tracking for enhanced features
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${
              testSuccessRate > 80 ? 'bg-green-50 text-green-700 border-green-200' :
              testSuccessRate > 60 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
              'bg-red-50 text-red-700 border-red-200'
            } font-urbanist`}>
              {testSuccessRate.toFixed(0)}% Success Rate
            </Badge>
            <Button
              onClick={runAllTests}
              disabled={isRunningTests}
              className="bg-blue-600 hover:bg-blue-700 text-white font-urbanist"
            >
              {isRunningTests ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </div>
        </div>

        {isRunningTests && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Running test suite...</span>
              <span>{testProgress}%</span>
            </div>
            <Progress value={testProgress} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tests">Test Cases</TabsTrigger>
            <TabsTrigger value="bugs">Bug Reports</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Test Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{passingTests}</div>
                  <p className="text-sm text-green-700 font-medium">Passing Tests</p>
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 mb-1">{failingTests}</div>
                  <p className="text-sm text-red-700 font-medium">Failing Tests</p>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{warningTests}</div>
                  <p className="text-sm text-yellow-700 font-medium">Warnings</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{bugs.filter(b => b.status === 'open').length}</div>
                  <p className="text-sm text-blue-700 font-medium">Open Bugs</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bugs.slice(0, 3).map(bug => (
                    <Alert key={bug.id}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{bug.title}</span>
                            <span className="text-sm text-gray-600 ml-2">in {bug.component}</span>
                          </div>
                          <Badge variant="outline" className={getSeverityColor(bug.severity)}>
                            {bug.severity}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="space-y-6 mt-6">
            <div className="space-y-4">
              {['ui', 'api', 'navigation', 'data', 'performance'].map(category => {
                const categoryTests = testCases.filter(t => t.category === category);
                
                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="text-lg capitalize">{category} Tests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {categoryTests.map(test => (
                          <div key={test.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(test.status)}
                              <div>
                                <h4 className="font-medium">{test.name}</h4>
                                <p className="text-sm text-gray-600">{test.description}</p>
                                {test.error && (
                                  <p className="text-sm text-red-600 mt-1">{test.error}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className={getStatusColor(test.status)}>
                                {test.status}
                              </Badge>
                              {test.duration && (
                                <p className="text-xs text-gray-500 mt-1">{test.duration}ms</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="bugs" className="space-y-6 mt-6">
            <div className="space-y-4">
              {bugs.map(bug => (
                <Card key={bug.id} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{bug.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">Component: {bug.component}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={getSeverityColor(bug.severity)}>
                          {bug.severity}
                        </Badge>
                        <Badge variant="outline">
                          {bug.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{bug.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Reproduction Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                        {bug.reproductionSteps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Reported: {bug.reportedAt.toLocaleDateString()}</span>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Coverage by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['ui', 'api', 'navigation', 'data', 'performance'].map(category => {
                      const total = testCases.filter(t => t.category === category).length;
                      const passing = testCases.filter(t => t.category === category && t.status === 'passing').length;
                      const coverage = (passing / total) * 100;
                      
                      return (
                        <div key={category}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm capitalize">{category}</span>
                            <span className="text-sm">{coverage.toFixed(0)}%</span>
                          </div>
                          <Progress value={coverage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bug Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['open', 'investigating', 'fixed'].map(status => {
                      const count = bugs.filter(b => b.status === status).length;
                      const percentage = bugs.length > 0 ? (count / bugs.length) * 100 : 0;
                      
                      return (
                        <div key={status}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm capitalize">{status}</span>
                            <span className="text-sm">{count} ({percentage.toFixed(0)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">2.3s</div>
                    <p className="text-sm text-gray-600">Avg Load Time</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">98%</div>
                    <p className="text-sm text-gray-600">Uptime</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">450ms</div>
                    <p className="text-sm text-gray-600">API Response</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">95</div>
                    <p className="text-sm text-gray-600">Lighthouse Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BugTestingDashboard;
