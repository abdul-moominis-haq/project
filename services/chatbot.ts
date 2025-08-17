import OpenAI from 'openai';

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
      const formattedMessages = [
        { role: 'system' as const, content: this.systemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const completion = await openai.chat.completions.create({
        model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Chatbot error:', error);
      throw new Error('Failed to get response from agricultural assistant');
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
