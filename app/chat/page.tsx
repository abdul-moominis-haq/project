'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Send, Sprout, Cloud, Calendar, HelpCircle, Bug, Droplets, DollarSign, Leaf, MessageSquare, Bot } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  label: string;
  type: string;
  icon: React.ReactNode;
  params?: any;
  description: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello ${user?.name || 'there'}! 🌱 I'm your SmartAgri agricultural assistant. I'm here to help you with all aspects of farming - from crop management and pest control to weather planning and market insights. 

Note: I'm currently running in offline mode with basic responses. What would you like to know about today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions: QuickAction[] = [
    {
      label: 'Weather Planning',
      type: 'weather-advice',
      icon: <Cloud className="w-5 h-5" />,
      description: 'Get weather-based farming recommendations',
      params: { weatherCondition: 'current weather', crops: ['general'], location: user?.location || 'my area' }
    },
    {
      label: 'Crop Health',
      type: 'crop-advice',
      icon: <Sprout className="w-5 h-5" />,
      description: 'Diagnose and treat crop issues',
      params: { cropName: 'my crops', issue: 'general health assessment' }
    },
    {
      label: 'Seasonal Guide',
      type: 'seasonal-advice',
      icon: <Calendar className="w-5 h-5" />,
      description: 'Seasonal farming activities and planning',
      params: { season: 'current season', location: user?.location || 'my area' }
    },
    {
      label: 'Pest Control',
      type: 'quick-advice',
      icon: <Bug className="w-5 h-5" />,
      description: 'Identify and manage pests and diseases',
      params: { query: 'What are the most common pests this season and how can I prevent them?' }
    },
    {
      label: 'Irrigation Tips',
      type: 'quick-advice',
      icon: <Droplets className="w-5 h-5" />,
      description: 'Water management and irrigation advice',
      params: { query: 'What are the best irrigation practices for water conservation?' }
    },
    {
      label: 'Market Insights',
      type: 'quick-advice',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Crop pricing and market trends',
      params: { query: 'What crops are currently in high demand and profitable to grow?' }
    },
    {
      label: 'Soil Health',
      type: 'quick-advice',
      icon: <Leaf className="w-5 h-5" />,
      description: 'Soil management and fertilization',
      params: { query: 'How can I improve my soil health and what nutrients should I focus on?' }
    },
    {
      label: 'General Help',
      type: 'quick-advice',
      icon: <HelpCircle className="w-5 h-5" />,
      description: 'General farming questions and advice',
      params: { query: 'What general farming advice do you have for improving productivity?' }
    }
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Check connection status
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/chat/test');
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data.connection?.success ? 'online' : 'offline');
      } else {
        setConnectionStatus('offline');
      }
    } catch (error) {
      setConnectionStatus('offline');
    }
  };

  const sendMessage = async (content: string, type: string = 'default', params: any = {}) => {
    if (!content.trim() && type === 'default') return;

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          type,
          ...params
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.label, action.type, action.params);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bot className="w-8 h-8 text-green-600" />
              AI Assistant
            </h1>
            <p className="text-gray-600 mt-2">
              Get intelligent farming advice powered by AI. Ask about crops, weather, pests, and more.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-green-700 border-green-200">
              <MessageSquare className="w-4 h-4 mr-1" />
              AI Powered
            </Badge>
            <Badge 
              variant={connectionStatus === 'online' ? 'default' : 'secondary'}
              className={connectionStatus === 'online' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${
                connectionStatus === 'online' ? 'bg-green-500' : 
                connectionStatus === 'offline' ? 'bg-yellow-500' : 'bg-gray-500'
              }`} />
              {connectionStatus === 'online' ? 'Online' : 
               connectionStatus === 'offline' ? 'Offline Mode' : 'Connecting...'}
            </Badge>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {/* Quick Actions Panel */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-green-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-4 hover:bg-green-50"
                    onClick={() => handleQuickAction(action)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-green-600">
                        {action.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{action.label}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sprout className="w-6 h-6 text-green-600" />
                SmartAgri Agricultural Assistant
              </CardTitle>
              <p className="text-sm text-gray-600">
                Get expert farming advice powered by AI
              </p>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <LoadingSpinner size="sm" />
                        <p className="text-sm text-gray-600 mt-2">
                          Analyzing your question...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-6 border-t bg-gray-50">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about crops, weather, pests, soil, market prices..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Be specific about your crops, location, and farming conditions for better advice
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </Layout>
  );
}
