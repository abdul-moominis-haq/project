'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ChatbotTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testChatbot = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error: ' + error,
        apiKeyStatus: 'Network Failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🤖 Chatbot API Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Test the new OpenRouter API key to see if the chatbot is working.
            </p>

            <Button 
              onClick={testChatbot} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing API...
                </>
              ) : (
                'Test Chatbot API'
              )}
            </Button>

            {result && (
              <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  )}
                  <div className="space-y-2">
                    <AlertDescription>
                      <strong>Status:</strong> {result.apiKeyStatus}
                    </AlertDescription>
                    
                    {result.success ? (
                      <div className="space-y-1">
                        <p><strong>✅ Success!</strong> Chatbot is working correctly.</p>
                        <p><strong>Response:</strong> &ldquo;{result.message}&rdquo;</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p><strong>❌ Error:</strong> {result.error}</p>
                        {result.errorType && (
                          <p><strong>Error Type:</strong> {result.errorType}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            )}

            <div className="mt-6 p-4 bg-muted rounded-lg text-sm">
              <h3 className="font-medium mb-2">API Configuration:</h3>
              <ul className="space-y-1">
                <li>• <strong>Model:</strong> openai/gpt-4o</li>
                <li>• <strong>Base URL:</strong> https://openrouter.ai/api/v1</li>
                <li>• <strong>API Key:</strong> sk-or-v1-c25c1afe... (updated)</li>
                <li>• <strong>Referer:</strong> http://localhost:3000</li>
                <li>• <strong>Title:</strong> SmartAgri</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
