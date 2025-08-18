// SmartAgri Chatbot Service using Gemini API

// Check if API key is available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let isGeminiAvailable = false;

if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  console.log('Initializing Gemini API client...');
  isGeminiAvailable = true;
} else {
  console.warn('Gemini API key not configured or using placeholder value');
}

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
    model: string = 'gemini-2.0-flash'
  ): Promise<string> {
    try {
      // Check if Gemini is available
      if (!isGeminiAvailable || !GEMINI_API_KEY) {
        console.log('Gemini not available, using fallback response');
        return this.getFallbackResponse(messages);
      }

      // Format messages for Gemini API
      const lastMessage = messages[messages.length - 1];
      const conversationHistory = messages.slice(0, -1);
      
      // Create conversation context
      let conversationText = this.systemPrompt + '\n\nConversation:\n';
      conversationHistory.forEach(msg => {
        conversationText += `${msg.role === 'user' ? 'Farmer' : 'Assistant'}: ${msg.content}\n`;
      });
      conversationText += `Farmer: ${lastMessage.content}\nAssistant:`;

      console.log('Sending request to Gemini API...');
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: conversationText
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.95,
          topK: 40
        }
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No response content received from Gemini');
      }

      console.log('Successfully received response from Gemini');
      return generatedText.trim();
      
    } catch (error: any) {
      console.error('Chatbot error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type
      });
      
      // Return fallback response for any errors
      console.log('Falling back to local response due to API error');
      return this.getFallbackResponse(messages);
    }
  }

  private getFallbackResponse(messages: ChatMessage[]): string {
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
    
    // Simple keyword-based responses for common farming topics
    if (lastMessage.includes('crop') || lastMessage.includes('plant')) {
      return "🌱 For crop management, consider these key factors: proper soil preparation, appropriate spacing, regular watering, and pest monitoring. What specific crop are you growing? I can provide more targeted advice.";
    }
    
    if (lastMessage.includes('pest') || lastMessage.includes('insect') || lastMessage.includes('bug')) {
      return "🐛 Pest management is crucial for healthy crops. Use integrated pest management (IPM): regular monitoring, beneficial insects, crop rotation, and organic pesticides when necessary. Can you describe the pest issue you're facing?";
    }
    
    if (lastMessage.includes('soil') || lastMessage.includes('fertilizer')) {
      return "🌍 Soil health is the foundation of successful farming. Test your soil pH (6.0-7.0 is ideal for most crops), ensure good drainage, add organic matter like compost, and use balanced fertilizers. What type of soil challenges are you experiencing?";
    }
    
    if (lastMessage.includes('water') || lastMessage.includes('irrigation')) {
      return "💧 Proper irrigation is key to crop success. Water deeply but less frequently, check soil moisture regularly, use mulch to retain moisture, and consider drip irrigation for efficiency. What's your current watering situation?";
    }
    
    if (lastMessage.includes('weather') || lastMessage.includes('rain') || lastMessage.includes('drought')) {
      return "🌦️ Weather planning is essential for farming. Monitor forecasts regularly, prepare for seasonal changes, have drought mitigation plans, and protect crops from extreme weather. What weather challenges are you facing?";
    }
    
    if (lastMessage.includes('harvest') || lastMessage.includes('when to')) {
      return "🌾 Harvest timing depends on your crop type and local conditions. Look for visual cues like color changes, check fruit firmness, monitor sugar content for fruits, and harvest in optimal weather conditions. What crop are you planning to harvest?";
    }
    
    if (lastMessage.includes('organic') || lastMessage.includes('sustainable')) {
      return "🌿 Organic farming focuses on natural methods: composting, crop rotation, beneficial insects, cover crops, and avoiding synthetic chemicals. It builds long-term soil health and ecosystem balance. What organic practices interest you most?";
    }
    
    if (lastMessage.includes('hello') || lastMessage.includes('hi') || lastMessage.includes('help')) {
      return "👋 Hello! I'm your SmartAgri agricultural assistant. I'm here to help with farming questions about crops, soil, pests, irrigation, weather planning, and more. Note: I'm currently running in offline mode with basic responses. What farming topic would you like to discuss?";
    }
    
    // Default response
    return "🌱 I'm here to help with your farming questions! While I'm currently running in offline mode with limited responses, I can still provide basic guidance on crops, soil, irrigation, pest management, and weather planning. Could you be more specific about what farming challenge you're facing?";
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

  // Method to test API connectivity
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!isGeminiAvailable || !GEMINI_API_KEY) {
        return {
          success: false,
          message: 'Gemini API not configured. Using fallback responses.'
        };
      }

      // Test with a simple message
      const testResponse = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: 'Hello, respond with just "API test successful"'
                  }
                ]
              }
            ]
          }),
        }
      );

      if (testResponse.ok) {
        return {
          success: true,
          message: 'Gemini API connection successful!'
        };
      } else {
        throw new Error(`API test failed with status: ${testResponse.status}`);
      }
    } catch (error: any) {
      return {
        success: false,
        message: `API connection failed: ${error.message}`
      };
    }
  }
}

export const smartAgriBot = new SmartAgriChatbot();
