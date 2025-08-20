'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Send, Sprout, Cloud, Calendar, HelpCircle, Bug, Droplets, DollarSign, Leaf, MessageSquare, Bot, MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService } from '@/services/local-storage';

// Component to handle timestamp rendering safely
function TimeStamp({ timestamp }: { timestamp: Date }) {
  const [timeString, setTimeString] = useState('');
  
  useEffect(() => {
    setTimeString(timestamp.toLocaleTimeString());
  }, [timestamp]);
  
  return <span>{timeString}</span>;
}

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved chat history on component mount
  useEffect(() => {
    if (user?.id) {
      localStorageService.recordNavigation(user.id, 'chat');
      const savedHistory = localStorageService.getChatHistory(user.id);
      if (savedHistory && savedHistory.length > 0) {
        setMessages(savedHistory.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    }
  }, [user]);

  // Save message to local storage
  const saveMessage = (message: ChatMessage) => {
    if (user?.id) {
      localStorageService.saveChatMessage(user.id, message);
    }
  };

  // Quick actions for instant assistance
  const quickActions: QuickAction[] = [
    {
      label: 'Weather Planning',
      type: 'weather-advice',
      icon: <Cloud className="w-4 h-4 sm:w-5 sm:h-5" />,
      description: 'Get weather-based farming recommendations',
      params: { weatherCondition: 'current weather', crops: ['general'], location: user?.location || 'my area' }
    },
    {
      label: 'Crop Health',
      type: 'crop-advice',
      icon: <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />,
      description: 'Diagnose and treat crop issues',
      params: { cropName: 'my crops', issue: 'general health assessment' }
    },
    {
      label: 'Seasonal Guide',
      type: 'seasonal-advice',
      icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />,
      description: 'Seasonal farming activities and planning',
      params: { season: 'current season', location: user?.location || 'my area' }
    },
    {
      label: 'Pest Control',
      type: 'quick-advice',
      icon: <Bug className="w-4 h-4 sm:w-5 sm:h-5" />,
      description: 'Identify and manage pests and diseases',
      params: { query: 'What are the most common pests this season and how can I prevent them?' }
    },
    {
      label: 'Irrigation Tips',
      type: 'quick-advice',
      icon: <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />,
      description: 'Water management and irrigation advice',
      params: { query: 'What are the best irrigation practices for water conservation?' }
    },
    {
      label: 'Market Insights',
      type: 'quick-advice',
      icon: <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />,
      description: 'Crop pricing and market trends',
      params: { query: 'What crops are currently in high demand and profitable to grow?' }
    },
    {
      label: 'Soil Health',
      type: 'quick-advice',
      icon: <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />,
      description: 'Soil management and fertilization',
      params: { query: 'How can I improve my soil health and what nutrients should I focus on?' }
    },
    {
      label: 'General Help',
      type: 'quick-advice',
      icon: <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
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
    saveMessage(userMessage); // Save user message
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
          params
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message || 'Sorry, I couldn\'t process your request at this time.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      saveMessage(assistantMessage); // Save assistant message
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m experiencing some technical difficulties. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      saveMessage(errorMessage); // Save error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    let message = '';
    switch (action.type) {
      case 'weather-advice':
        message = `Please provide weather-based farming advice for ${action.params.weatherCondition} in ${action.params.location}. I'm growing ${action.params.crops.join(', ')}.`;
        break;
      case 'crop-advice':
        message = `I need help with ${action.params.cropName}. The issue I'm experiencing is: ${action.params.issue}. What should I do?`;
        break;
      case 'seasonal-advice':
        message = `What are the key farming activities I should focus on during ${action.params.season} in ${action.params.location}?`;
        break;
      case 'quick-advice':
        message = action.params.query;
        break;
      default:
        message = action.label;
    }
    sendMessage(message, action.type, action.params);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Enhanced Page Header - Fully Responsive */}
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border border-green-100 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                  AI Farming Assistant
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base lg:text-lg">
                  Your personal agricultural expert, available 24/7 🌱
                </p>
                <p className="text-green-600 text-xs sm:text-sm font-medium mt-1">
                  Ask me anything about farming, crops, weather, and more!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Badge className="text-green-700 border-green-300 bg-green-50 border px-2 sm:px-3 py-1">
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">AI Powered</span>
              </Badge>
              <Badge 
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm ${connectionStatus === 'online' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}
              >
                <div className={`w-2 h-2 rounded-full mr-1 sm:mr-2 ${
                  connectionStatus === 'online' ? 'bg-green-500 animate-pulse' : 
                  connectionStatus === 'offline' ? 'bg-yellow-500' : 'bg-gray-500'
                }`}></div>
                {connectionStatus === 'online' ? 'Connected' : 
                 connectionStatus === 'offline' ? 'Offline' : 'Connecting...'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Chat Interface - Responsive Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6 h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)]">
          
          {/* Quick Actions Panel - Mobile/Tablet responsive */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="h-64 lg:h-full border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-br from-gray-50 to-green-50 border-b border-green-100 p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2 text-gray-800">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                    <Sprout className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                  <span className="hidden sm:inline">Quick Actions</span>
                  <span className="sm:hidden">Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-3 lg:p-4">
                <ScrollArea className="h-48 lg:h-full">
                  <div className="space-y-1 sm:space-y-2">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        className="w-full justify-start h-auto p-2 sm:p-3 lg:p-4 border border-gray-200 bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-200 transition-all duration-200 group"
                        onClick={() => handleQuickAction(action)}
                      >
                        <div className="flex items-start gap-2 sm:gap-3 w-full">
                          <div className="text-green-600 group-hover:text-green-700 transition-colors duration-200 flex-shrink-0">
                            {action.icon}
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-medium text-gray-800 group-hover:text-gray-900 text-xs sm:text-sm">
                              {action.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 leading-relaxed hidden sm:block">
                              {action.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Chat Panel - Responsive */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Card className="h-96 sm:h-[500px] lg:h-full flex flex-col border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800">
                        🤖 Smart Chat
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-green-600 font-medium">
                        Powered by AI • Ready to help
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">Online</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0 bg-gradient-to-b from-white to-gray-50">
                <ScrollArea className="flex-1 p-3 sm:p-4 lg:p-6" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                          <Sprout className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                          Welcome to Your AI Farming Assistant! 🌱
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 max-w-md">
                          I&apos;m here to help you with all your farming questions. Ask me about crops, weather, soil, pests, or use the quick actions on the side!
                        </p>
                      </div>
                    )}
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-2 sm:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                        style={{animationDelay: `${index * 100}ms`}}
                      >
                        {/* Avatar for assistant */}
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                            <Sprout className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] group ${
                            message.role === 'user' ? 'order-1' : ''
                          }`}
                        >
                          {/* Message bubble */}
                          <div
                            className={`relative p-3 sm:p-4 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                              message.role === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-auto'
                                : 'bg-white border border-gray-100 text-gray-800'
                            }`}
                          >
                            {/* Message content with improved typography and rich formatting */}
                            <div 
                              className={`prose prose-sm max-w-none ${
                                message.role === 'user' 
                                  ? 'prose-invert text-white' 
                                  : 'prose-gray'
                              }`}
                            >
                              <div className={`whitespace-pre-wrap leading-relaxed ${
                                message.role === 'user' ? 'text-white' : 'text-gray-800'
                              } text-sm sm:text-base`}>
                                {message.content}
                              </div>
                            </div>
                            
                            {/* Timestamp */}
                            <div className={`text-xs mt-2 ${
                              message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <TimeStamp timestamp={message.timestamp} />
                            </div>
                          </div>
                        </div>

                        {/* Avatar for user */}
                        {message.role === 'user' && (
                          <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md order-2">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Loading indicator */}
                    {isLoading && (
                      <div className="flex items-start gap-2 sm:gap-3 justify-start animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                          <Sprout className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 shadow-sm">
                          <div className="flex items-center gap-2">
                            <LoadingSpinner size="sm" />
                            <span className="text-sm text-gray-600">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {/* Enhanced Input Area - Responsive */}
                <div className="border-t bg-white p-3 sm:p-4">
                  <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything about farming..."
                      className="flex-1 rounded-full border-gray-200 focus:border-green-300 focus:ring-green-200 text-sm sm:text-base"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-3 sm:px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Ask about crops, weather, soil, pests, irrigation, or use quick actions above
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
