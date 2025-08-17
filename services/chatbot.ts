import OpenAI from 'openai';

// Ensure API key is available
if (!process.env.OPENROUTER_API_KEY) {
  console.error('OPENROUTER_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'SmartAgri - Agricultural Assistant',
  },
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export class SmartAgriChatbot {
  private systemPrompt = `You are an expert agricultural assistant for SmartAgri, a modern farming application. Your role is to help farmers with:

1. Crop management and planning
2. Weather-related farming advice
3. Pest and disease identification and treatment
4. Soil health and fertilization guidance
5. Irrigation and water management
6. Seasonal farming tips
7. Market insights and crop pricing
8. Sustainable farming practices
9. Technology adoption in agriculture
10. General agricultural best practices

Always provide practical, actionable advice. Consider factors like climate, season, soil type, and regional farming practices. Be encouraging and supportive while being scientifically accurate. If you need more specific information about the user's location, crops, or farming conditions, ask relevant questions.

Keep responses concise but comprehensive, and always prioritize farmer safety and environmental sustainability.`;

  async sendMessage(
    messages: ChatMessage[],
    model: string = 'openai/gpt-4o-mini'
  ): Promise<string> {
    try {
      // Check if API key is available
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key is not configured');
      }

      const formattedMessages = [
        { role: 'system' as const, content: this.systemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      console.log('Sending request to OpenRouter...');
      
      const completion = await openai.chat.completions.create({
        model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response content received from OpenRouter');
      }

      console.log('Successfully received response from OpenRouter');
      return response;
      
    } catch (error: any) {
      console.error('Chatbot error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
        stack: error.stack
      });
      
      // Provide more specific error messages
      if (error.message?.includes('API key')) {
        throw new Error('OpenRouter API key is invalid or missing. Please check your configuration.');
      } else if (error.status === 401) {
        throw new Error('OpenRouter API authentication failed. Please verify your API key.');
      } else if (error.status === 429) {
        throw new Error('OpenRouter API rate limit exceeded. Please try again later.');
      } else if (error.status === 500) {
        throw new Error('OpenRouter API service error. Please try again later.');
      } else {
        throw new Error(`Failed to get response from agricultural assistant: ${error.message}`);
      }
    }
  }

  async getQuickAdvice(query: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: query
      }
    ];

    return this.sendMessage(messages);
  }

  async getCropAdvice(cropName: string, issue: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `I'm growing ${cropName} and I'm experiencing: ${issue}. What should I do?`
      }
    ];

    return this.sendMessage(messages);
  }

  async getWeatherBasedAdvice(
    weatherCondition: string,
    crops: string[],
    location?: string
  ): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `The weather is ${weatherCondition} in ${location || 'my area'}. I'm growing ${crops.join(', ')}. What farming activities should I prioritize?`
      }
    ];

    return this.sendMessage(messages);
  }

  async getSeasonalAdvice(season: string, location?: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `What are the key farming activities I should focus on during ${season} in ${location || 'my area'}?`
      }
    ];

    return this.sendMessage(messages);
  }
}

export const smartAgriBot = new SmartAgriChatbot();
