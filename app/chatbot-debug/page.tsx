'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ChatbotTestPage() {
  const [testMessage, setTestMessage] = useState('Hello, can you help me with farming?');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);

  const testChatbot = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log('Testing chatbot with message:', testMessage);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: testMessage }
          ]
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        setResult({ 
          success: false, 
          error: `HTTP ${response.status}: ${data.error || 'Unknown error'}` 
        });
      } else {
        setResult({ success: true, data });
      }
    } catch (error) {
      console.error('Test error:', error);
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testAPIKey = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Test OpenRouter API directly
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || 'NO_KEY'}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SmartAgri Test',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'user', content: 'Say hello' }
          ],
          temperature: 0.7,
          max_tokens: 100,
        }),
      });

      const data = await response.json();
      console.log('Direct API test:', data);

      if (!response.ok) {
        setResult({ 
          success: false, 
          error: `Direct API error: ${data.error?.message || 'Unknown error'}` 
        });
      } else {
        setResult({ success: true, data: { directAPI: true, ...data } });
      }
    } catch (error) {
      console.error('Direct API test error:', error);
      setResult({ 
        success: false, 
        error: `Direct API test failed: ${error}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🤖 Chatbot Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Environment Check */}
          <div className="space-y-2">
            <h3 className="font-medium">Environment Variables</h3>
            <div className="text-sm space-y-1">
              <div>API Key: {process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ? '✅ Set' : '❌ Missing'}</div>
              <div>App URL: {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}</div>
            </div>
          </div>

          {/* Test Input */}
          <div className="space-y-2">
            <label className="font-medium">Test Message:</label>
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter a test message..."
            />
          </div>

          {/* Test Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={testChatbot} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Test via API Route
            </Button>
            
            <Button 
              onClick={testAPIKey} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Test Direct API
            </Button>
          </div>

          {/* Results */}
          {result && (
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription>
                  {result.success ? (
                    <div>
                      <div className="font-medium text-green-800 mb-2">✅ Success!</div>
                      <div className="text-sm text-green-700">
                        <strong>Response:</strong> {result.data?.message || JSON.stringify(result.data, null, 2)}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-red-800 mb-2">❌ Error</div>
                      <div className="text-sm text-red-700">{result.error}</div>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Debug Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Server URL: {typeof window !== 'undefined' ? window.location.origin : 'Unknown'}</div>
            <div>Current time: {new Date().toISOString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
