import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'SmartAgri - Smart Farming Management System',
  },
});

export async function POST(request: NextRequest) {
  try {
    console.log('Testing OpenRouter API with new key...');
    
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'user',
          content: 'Hello! Can you help me with farming advice? Just say "Yes, I can help with farming!"',
        },
      ],
      max_tokens: 50,
    });

    console.log('API Response:', completion.choices[0].message);

    return NextResponse.json({
      success: true,
      message: completion.choices[0].message.content,
      apiKeyStatus: 'Working',
    });

  } catch (error: any) {
    console.error('OpenRouter API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      apiKeyStatus: 'Failed',
    }, { status: 500 });
  }
}
