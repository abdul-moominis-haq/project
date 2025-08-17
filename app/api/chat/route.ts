import { NextRequest, NextResponse } from 'next/server';
import { smartAgriBot, type ChatMessage } from '@/services/chatbot';

export async function POST(request: NextRequest) {
  try {
    console.log('Chat API: Received request');
    
    const body = await request.json();
    const { messages, type, ...params } = body;
    
    console.log('Chat API: Request body', { 
      messagesCount: messages?.length, 
      type, 
      params 
    });

    if (!messages || !Array.isArray(messages)) {
      console.error('Chat API: Invalid messages array');
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('Chat API: OPENROUTER_API_KEY not found in environment');
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    console.log('Chat API: Processing request type:', type);
    let response: string;

    switch (type) {
      case 'quick-advice':
        response = await smartAgriBot.getQuickAdvice(params.query);
        break;
      
      case 'crop-advice':
        response = await smartAgriBot.getCropAdvice(params.cropName, params.issue);
        break;
      
      case 'weather-advice':
        response = await smartAgriBot.getWeatherBasedAdvice(
          params.weatherCondition,
          params.crops,
          params.location
        );
        break;
      
      case 'seasonal-advice':
        response = await smartAgriBot.getSeasonalAdvice(params.season, params.location);
        break;
      
      default:
        response = await smartAgriBot.sendMessage(messages);
    }

    console.log('Chat API: Successfully generated response');
    
    return NextResponse.json({ 
      message: response,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Chat API error:', {
      message: error.message,
      stack: error.stack,
      status: error.status,
      code: error.code
    });
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process chat request',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'SmartAgri Agricultural Assistant API is running',
    endpoints: {
      POST: 'Send chat messages',
      types: [
        'default - general chat',
        'quick-advice - quick farming advice',
        'crop-advice - specific crop issues',
        'weather-advice - weather-based recommendations',
        'seasonal-advice - seasonal farming tips'
      ]
    }
  });
}
