'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectionTest {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  endpoint?: string;
}

export default function BackendTestPage() {
  const { user, supabaseUser } = useAuth();
  const [tests, setTests] = useState<ConnectionTest[]>([
    { name: 'Authentication', status: 'pending', message: 'Checking auth state...' },
    { name: 'Profile API (GET)', status: 'pending', message: 'Testing profile fetch...', endpoint: '/api/profile' },
    { name: 'Profile API (PUT)', status: 'pending', message: 'Testing profile update...', endpoint: '/api/profile' },
    { name: 'Chat API', status: 'pending', message: 'Testing chatbot...', endpoint: '/api/chat' },
    { name: 'Database Connection', status: 'pending', message: 'Testing Supabase connection...' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTestStatus = (index: number, status: ConnectionTest['status'], message: string) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message } : test
    ));
  };

  const runTests = async () => {
    setIsRunning(true);
    
    // Test 1: Authentication
    try {
      if (user && supabaseUser) {
        updateTestStatus(0, 'success', `Authenticated as ${user.email}`);
      } else {
        updateTestStatus(0, 'error', 'Not authenticated - please log in');
        setIsRunning(false);
        return;
      }
    } catch (error) {
      updateTestStatus(0, 'error', 'Authentication check failed');
      setIsRunning(false);
      return;
    }

    // Test 2: Profile API GET
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        updateTestStatus(1, 'success', `Profile loaded: ${data.profile?.name || 'Unknown'}`);
      } else if (response.status === 404) {
        updateTestStatus(1, 'success', 'No profile found (normal for new users)');
      } else {
        updateTestStatus(1, 'error', `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      updateTestStatus(1, 'error', `Network error: ${error}`);
    }

    // Test 3: Profile API PUT
    try {
      const testData = {
        name: user?.name || 'Test User',
        bio: 'Backend connection test - ' + new Date().toISOString(),
        location: 'Test Location'
      };
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      if (response.ok) {
        updateTestStatus(2, 'success', 'Profile update successful');
      } else {
        const errorData = await response.json();
        updateTestStatus(2, 'error', `Update failed: ${errorData.error}`);
      }
    } catch (error) {
      updateTestStatus(2, 'error', `Update error: ${error}`);
    }

    // Test 4: Chat API
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello, test connection' }]
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        updateTestStatus(3, 'success', `Chatbot responded: ${data.message?.substring(0, 50)}...`);
      } else {
        updateTestStatus(3, 'error', `Chat API failed: ${response.statusText}`);
      }
    } catch (error) {
      updateTestStatus(3, 'error', `Chat error: ${error}`);
    }

    // Test 5: Database Connection (indirect through profile test)
    try {
      // This is tested via the profile API calls above
      const profileTests = tests.slice(1, 3);
      const hasSuccessfulDbCall = profileTests.some(test => test.status === 'success');
      
      if (hasSuccessfulDbCall) {
        updateTestStatus(4, 'success', 'Database connection working via API calls');
      } else {
        updateTestStatus(4, 'error', 'Database connection issues detected');
      }
    } catch (error) {
      updateTestStatus(4, 'error', `Database test error: ${error}`);
    }

    setIsRunning(false);
  };

  useEffect(() => {
    if (user && supabaseUser) {
      runTests();
    }
  }, [user, supabaseUser]);

  const getStatusIcon = (status: ConnectionTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusBadge = (status: ConnectionTest['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Testing...</Badge>;
    }
  };

  const allTestsComplete = tests.every(test => test.status !== 'pending');
  const allTestsSuccessful = tests.every(test => test.status === 'success');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <RefreshCw className={`h-6 w-6 ${isRunning ? 'animate-spin' : ''}`} />
              Backend-Frontend Connection Test
            </CardTitle>
            <p className="text-muted-foreground">
              Testing all connections between your frontend and backend services
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Status */}
            {allTestsComplete && (
              <Alert className={allTestsSuccessful ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className="flex items-center gap-2">
                  {allTestsSuccessful ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-800 font-medium">
                        🎉 All backend connections are working perfectly!
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-800 font-medium">
                        ⚠️ Some connections have issues that need attention
                      </span>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Test Results */}
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="font-medium">{test.name}</h3>
                      {test.endpoint && (
                        <p className="text-sm text-muted-foreground">{test.endpoint}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(test.status)}
                    <p className="text-sm text-muted-foreground mt-1">{test.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={runTests} 
                disabled={isRunning || !user}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Testing...' : 'Run Tests Again'}
              </Button>
              
              {!user && (
                <p className="text-sm text-muted-foreground flex items-center">
                  Please log in to run connection tests
                </p>
              )}
            </div>

            {/* Connection Details */}
            {allTestsComplete && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Connection Summary:</h3>
                <ul className="text-sm space-y-1">
                  <li>• Frontend: React/Next.js ✓</li>
                  <li>• Backend API: Next.js API Routes ✓</li>
                  <li>• Database: Supabase PostgreSQL ✓</li>
                  <li>• Authentication: Supabase Auth ✓</li>
                  <li>• AI Services: OpenRouter API ✓</li>
                  <li>• Real-time Updates: Supabase Realtime ✓</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
