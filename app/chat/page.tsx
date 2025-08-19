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
      const savedMessages = localStorageService.getChatHistory(user.id);
      if (savedMessages.length > 0) {
        // Convert saved messages back to proper format
        const formattedMessages = savedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp || msg.savedAt)
        }));
        setMessages(formattedMessages);
      } else {
        // Set welcome message if no saved history
    const welcomeMessage = {
  role: 'assistant' as const,
  content: `# Welcome to SmartAgri Assistant

Hello ${user?.name || 'there'}! I'm your personal AI farming companion, built to support you with practical agricultural knowledge and real-time data.

## How I can help you today:

- Crop Management: Guidance on planting, growing, and harvesting  
- Weather Insights: Recommendations based on local conditions  
- Pest & Disease Control: Help identifying and managing crop issues  
- Irrigation Planning: Strategies for effective water use  
- Market Intelligence: Updates on crop prices and demand trends  
- Soil Health: Testing methods and improvement tips  

Ask me anything related to your crops, location, or farming challenges. I’m here to help you make better decisions and improve productivity on your farm.  

What would you like to explore first?`,
  timestamp: new Date()
};
        setMessages([welcomeMessage]);
        localStorageService.saveChatMessage(user.id, welcomeMessage);
      }
      
      // Record navigation
      localStorageService.recordNavigation(user.id, 'chat');
    }
  }, [user]);

  // Save messages to local storage whenever messages change
  const saveMessage = (message: ChatMessage) => {
    if (user?.id) {
      localStorageService.saveChatMessage(user.id, message);
    }
  };

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
      saveMessage(assistantMessage); // Save assistant message
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      saveMessage(errorMessage); // Save error message
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
        {/* Enhanced Page Header */}
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-2xl p-8 border border-green-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                  AI Farming Assistant
                </h1>
                <p className="text-gray-600 mt-1 text-lg">
                  Your personal agricultural expert, available 24/7 🌱
                </p>
                <p className="text-green-600 text-sm font-medium mt-1">
                  Ask me anything about farming, crops, weather, and more!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 px-3 py-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Powered
              </Badge>
              <Badge 
                variant={connectionStatus === 'online' ? 'default' : 'secondary'}
                className={`px-3 py-1 ${connectionStatus === 'online' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  connectionStatus === 'online' ? 'bg-green-500 animate-pulse' : 
                  connectionStatus === 'offline' ? 'bg-yellow-500' : 'bg-gray-500'
                }`}></div>
                {connectionStatus === 'online' ? 'Connected' : 
                 connectionStatus === 'offline' ? 'Offline' : 'Connecting...'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {/* Enhanced Quick Actions Panel */}
          <div className="lg:col-span-1">
            <Card className="h-full border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-br from-gray-50 to-green-50 border-b border-green-100">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                    <Sprout className="w-4 h-4 text-white" />
                  </div>
                  Quick Actions
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Get instant advice with one click
                </p>
              </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-200 transition-all duration-200 group border-gray-200"
                    onClick={() => handleQuickAction(action)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="text-green-600 group-hover:text-green-700 transition-colors duration-200 flex-shrink-0">
                        {action.icon}
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-gray-800 group-hover:text-gray-900">
                          {action.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 leading-relaxed">
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

        {/* Enhanced Chat Panel */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                    <Sprout className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-800 font-bold">
                      SmartAgri Assistant
                    </CardTitle>
                    <p className="text-sm text-green-600 font-medium">
                      🤖 Powered by AI • Ready to help
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
              <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                      style={{animationDelay: `${index * 100}ms`}}
                    >
                      {/* Avatar for assistant */}
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                          <Sprout className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[75%] group ${
                          message.role === 'user' ? 'order-1' : ''
                        }`}
                      >
                        {/* Message bubble */}
                        <div
                          className={`relative p-4 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
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
                              message.role === 'user' 
                                ? 'font-medium text-white' 
                                : 'font-normal text-gray-700'
                            }`}>
                              {/* Enhanced message formatting */}
                              {message.content.split('\n').map((line, index) => {
                                // Check if line is a header (starts with #)
                                if (line.startsWith('# ')) {
                                  return (
                                    <h3 key={index} className={`font-bold text-lg mb-2 mt-3 ${
                                      message.role === 'user' ? 'text-white' : 'text-gray-800'
                                    }`}>
                                      {line.substring(2)}
                                    </h3>
                                  );
                                }
                                // Check if line is a subheader (starts with ##)
                                if (line.startsWith('## ')) {
                                  return (
                                    <h4 key={index} className={`font-semibold text-base mb-2 mt-2 ${
                                      message.role === 'user' ? 'text-blue-100' : 'text-gray-700'
                                    }`}>
                                      {line.substring(3)}
                                    </h4>
                                  );
                                }
                                // Check if line is a bullet point (starts with -)
                                if (line.startsWith('- ')) {
                                  return (
                                    <div key={index} className={`flex items-start gap-2 mb-1 ${
                                      message.role === 'user' ? 'text-blue-50' : 'text-gray-600'
                                    }`}>
                                      <span className={`inline-block w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                                        message.role === 'user' ? 'bg-blue-200' : 'bg-green-500'
                                      }`}></span>
                                      <span>{line.substring(2)}</span>
                                    </div>
                                  );
                                }
                                // Check if line is a numbered list (starts with number.)
                                const numberMatch = line.match(/^(\d+)\.\s(.+)/);
                                if (numberMatch) {
                                  return (
                                    <div key={index} className={`flex items-start gap-2 mb-1 ${
                                      message.role === 'user' ? 'text-blue-50' : 'text-gray-600'
                                    }`}>
                                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium flex-shrink-0 ${
                                        message.role === 'user' ? 'bg-blue-200 text-blue-800' : 'bg-green-100 text-green-700'
                                      }`}>
                                        {numberMatch[1]}
                                      </span>
                                      <span>{numberMatch[2]}</span>
                                    </div>
                                  );
                                }
                                // Check for bold text (**text**)
                                const boldText = line.replace(/\*\*(.*?)\*\*/g, `<strong class="${
                                  message.role === 'user' ? 'text-white font-bold' : 'text-gray-800 font-bold'
                                }">$1</strong>`);
                                
                                // Regular paragraph
                                return line.trim() ? (
                                  <p key={index} className="mb-2" dangerouslySetInnerHTML={{__html: boldText}} />
                                ) : (
                                  <br key={index} />
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Timestamp */}
                          <div 
                            className={`text-xs mt-2 transition-opacity duration-200 ${
                              message.role === 'user'
                                ? 'text-blue-100 opacity-80'
                                : 'text-gray-400 opacity-70'
                            } group-hover:opacity-100`}
                          >
                            <TimeStamp timestamp={message.timestamp} />
                          </div>
                          
                          {/* Message tail */}
                          <div 
                            className={`absolute w-3 h-3 transform rotate-45 ${
                              message.role === 'user'
                                ? 'bg-blue-500 -right-1.5 bottom-4'
                                : 'bg-white border-l border-b border-gray-100 -left-1.5 bottom-4'
                            }`}
                          />
                        </div>
                      </div>
                      
                      {/* Avatar for user */}
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md order-2">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Loading indicator with better styling */}
                  {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                        <Sprout className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          <p className="text-sm text-gray-600 font-medium animate-pulse">
                            Thinking...
                          </p>
                        </div>
                        <div className="flex gap-1 mt-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Enhanced input area */}
              <div className="p-6 border-t bg-gradient-to-r from-gray-50 to-white">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything about farming... 🌱"
                        disabled={isLoading}
                        className="pr-12 py-3 text-base rounded-xl border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all duration-200 placeholder:text-gray-400"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading || !input.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Enhanced tip section */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="text-green-500">💡</span>
                      <span className="font-medium">Pro tip:</span>
                    </div>
                    <span>Be specific about your crops, location, and farming conditions for personalized advice</span>
                  </div>
                  
                  {/* Quick suggestions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {[
                      "What's the best time to plant tomatoes?",
                      "How to prevent crop diseases?",
                      "Soil preparation tips",
                      "Weather impact on crops"
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setInput(suggestion)}
                        className="px-3 py-1.5 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded-full border border-green-200 transition-colors duration-200 hover:border-green-300"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </Layout>
  );
}
