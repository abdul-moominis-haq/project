'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Database } from 'lucide-react';

export default function TestSupabasePage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-supabase');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-600" />
              Supabase Connection Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                onClick={testConnection} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Database className="w-4 h-4" />
                )}
                Test Connection
              </Button>
            </div>

            {testResult && (
              <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-start gap-2">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="space-y-2">
                    <AlertDescription>
                      <strong>Status:</strong> {testResult.success ? 'Connected Successfully' : 'Connection Failed'}
                    </AlertDescription>
                    
                    {testResult.success ? (
                      <div className="space-y-2 text-sm">
                        <p><strong>✅ Supabase URL:</strong> {testResult.details.url}</p>
                        <p><strong>✅ Anonymous Key:</strong> {testResult.details.hasAnonKey ? 'Present' : 'Missing'}</p>
                        <p><strong>✅ Auth Service:</strong> {testResult.details.authWorking ? 'Working' : 'Error'}</p>
                        <p><strong>✅ Database:</strong> {testResult.details.databaseWorking ? 'Connected' : 'Error'}</p>
                        <p><strong>✅ Profiles Table:</strong> {testResult.details.profilesTableExists ? 'Exists' : 'Missing'}</p>
                        <p><strong>Current User:</strong> {testResult.details.currentUser}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <p><strong>❌ Error:</strong> {testResult.error}</p>
                        <p><strong>Details:</strong> {JSON.stringify(testResult.details, null, 2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            )}

            <div className="mt-6 p-4 bg-muted rounded-lg text-sm">
              <h3 className="font-medium mb-2">Environment Configuration:</h3>
              <ul className="space-y-1">
                <li>• <strong>Supabase URL:</strong> https://vwfusaojwaoiukbbbnkl.supabase.co</li>
                <li>• <strong>Project Ref:</strong> vwfusaojwaoiukbbbnkl</li>
                <li>• <strong>Anon Key:</strong> Configured ✓</li>
                <li>• <strong>Service Role Key:</strong> {process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured ✓' : 'Missing ❌'}</li>
              </ul>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
              <h3 className="font-medium mb-2 text-blue-800">Next Steps:</h3>
              <ol className="space-y-1 text-blue-700">
                <li>1. If connection fails, check your Supabase project is active</li>
                <li>2. Verify the database schema is set up (run the SQL from database/schema.sql)</li>
                <li>3. Get your service role key from Supabase Dashboard → Settings → API</li>
                <li>4. Test authentication by signing up/logging in</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}