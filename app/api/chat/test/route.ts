import { NextRequest, NextResponse } from 'next/server';
import { smartAgriBot } from '@/services/chatbot';

export async function GET() {
  try {
    console.log('Testing chatbot connection...');
    
    // Test the connection
    const connectionTest = await smartAgriBot.testConnection();
    
    // Test a simple message
    const testResponse = await smartAgriBot.sendMessage([
      { role: 'user', content: 'Hello, can you help me with farming?' }
    ]);

    return NextResponse.json({
      status: 'Chatbot API is working',
      connection: connectionTest,
      testResponse: testResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Chatbot test error:', error);
    
    return NextResponse.json(
      { 
        error: 'Chatbot test failed',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
