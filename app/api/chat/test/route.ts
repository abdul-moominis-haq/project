import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test the OpenRouter API configuration
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'OK',
      message: 'Chatbot API is configured and ready',
      hasApiKey: !!apiKey,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot test error:', error);
    return NextResponse.json(
      { error: 'Failed to test chatbot configuration' },
      { status: 500 }
    );
  }
}
