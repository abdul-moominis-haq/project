import { NextRequest, NextResponse } from 'next/server';
import { smartAgriBot, type ChatMessage } from '@/services/chatbot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, type, ...params } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ 
      message: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
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
