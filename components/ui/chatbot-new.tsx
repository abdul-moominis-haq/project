'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  MessageSquare, 
  Sprout, 
  User,
  Bot,
  Minimize2,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  X
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const TypingAnimation = () => (
  <div className="flex space-x-1 py-2">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

export function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your SmartAgri AI assistant. I can help you with crop management, weather forecasting, pest control, soil analysis, and all your farming questions. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestedPrompts = [
    "What's the best time to plant tomatoes in Ghana?",
    "How do I identify and treat crop diseases?",
    "Give me weather advice for this week",
    "What are sustainable farming practices?"
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const sendMessage = async (message: string, type: string = 'general', params: any = {}) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          type,
          ...params
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      // Remove typing indicator and add real message
      setMessages(prev => prev.filter(msg => msg.id !== 'typing').concat(assistantMessage));
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => prev.filter(msg => msg.id !== 'typing').concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const regenerateResponse = (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1];
      if (userMessage.role === 'user') {
        sendMessage(userMessage.content);
      }
    }
  };

  // Floating chat button when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-200 hover:scale-105"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  // Main chat interface (ChatGPT style)
  return (
    <div className="fixed inset-4 z-50 md:bottom-6 md:right-6 md:top-auto md:left-auto md:w-[440px] md:h-[650px]">
      <Card className="h-full flex flex-col bg-white shadow-2xl border-0 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-green-600 text-white">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                SmartAgri AI
                <Sparkles className="w-4 h-4 text-green-600" />
              </h3>
              <p className="text-xs text-gray-500">Your farming assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 p-0 bg-transparent hover:bg-gray-100 text-gray-500"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 p-0 bg-transparent hover:bg-gray-100 text-gray-500"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-0" ref={scrollAreaRef}>
          <div className="space-y-4 p-4">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    {message.role === 'user' ? (
                      <AvatarFallback className="bg-blue-600 text-white">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback className="bg-green-600 text-white">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className="flex items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {message.role === 'user' ? 'You' : 'SmartAgri AI'}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-blue' : 'prose-gray'}`}>
                      {message.isTyping ? (
                        <TypingAnimation />
                      ) : (
                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                          {message.content}
                        </div>
                      )}
                    </div>
                    
                    {/* Message actions (only for assistant messages) */}
                    {message.role === 'assistant' && !message.isTyping && (
                      <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          onClick={() => copyToClipboard(message.content)}
                          className="w-7 h-7 p-0 bg-transparent hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          onClick={() => regenerateResponse(message.id)}
                          className="w-7 h-7 p-0 bg-transparent hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          className="w-7 h-7 p-0 bg-transparent hover:bg-gray-100 text-gray-400 hover:text-green-600"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          className="w-7 h-7 p-0 bg-transparent hover:bg-gray-100 text-gray-400 hover:text-red-600"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Suggested prompts (show when no user messages) */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <div className="text-xs text-gray-500 mb-2">Try asking about:</div>
            <div className="grid grid-cols-1 gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(prompt)}
                  className="text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message SmartAgri AI..."
                  disabled={isLoading}
                  className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 min-h-[48px] max-h-[120px]"
                  rows={1}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 bottom-2 w-8 h-8 p-0 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>
          <div className="text-xs text-gray-400 mt-2 text-center">
            AI can make mistakes. Verify important farming decisions.
          </div>
        </div>
      </Card>
    </div>
  );
}
