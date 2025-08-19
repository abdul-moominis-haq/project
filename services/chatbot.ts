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
  private systemPrompt = `You are an expert agricultural assistant for SmartAgri, specializing in African farming practices with deep expertise in Ghanaian agriculture. Your role is to help African farmers, particularly those in Ghana, with:

**FOCUS AREA: AFRICAN FARMING - GHANA SPECIALIZATION**

1. **Ghanaian Crop Management**:
   - Major crops: Maize (corn), cassava, yam, cocoa, rice, plantain, tomatoes, onions, pepper
   - Traditional varieties vs. improved varieties (e.g., Obatanpa maize, Jasmine 85 rice)
   - Seasonal planting schedules for Ghana's major and minor seasons
   - Intercropping systems common in Ghana (maize-cassava, yam-maize-pepper)

2. **Ghana's Climate & Weather**:
   - Two rainy seasons: Major season (March-July) and Minor season (September-November)
   - Harmattan wind effects on crops (December-February)
   - Regional variations: Forest zone, Middle belt, Northern savanna
   - Climate-smart agriculture for Ghana's changing weather patterns

3. **African Soil & Fertilization**:
   - Ghana's soil types: Forest oxisols, savanna alfisols, coastal sandy soils
   - Organic matter management in tropical conditions
   - Local fertilizers and compost (poultry manure, palm kernel waste, rice husks)
   - Soil conservation on Ghana's slopes and erosion-prone areas

4. **Ghana-Specific Pests & Diseases**:
   - Fall armyworm in maize and rice
   - Cassava mosaic disease and cassava brown streak
   - Cocoa swollen shoot virus and black pod disease
   - Tomato leaf miner and bacterial wilt
   - Traditional and modern control methods used in Ghana

5. **Water Management for Ghana**:
   - Rainfed vs. irrigated farming systems
   - Small-scale irrigation (drip systems, small dams)
   - Water harvesting during rainy seasons
   - Drought management strategies for northern Ghana

6. **Ghanaian Market & Economics**:
   - Local market prices and seasonal variations
   - Export crops: Cocoa, cashew, shea nuts, pineapple
   - Value addition opportunities (gari processing, palm oil extraction)
   - Farmer cooperatives and group farming in Ghana

7. **Traditional & Modern Practices**:
   - Indigenous knowledge integration
   - Modern technology adoption suitable for small-scale farmers
   - Mobile technology for farmers (AgriTech solutions in Ghana)
   - Sustainable practices fitting Ghana's environment

**RESPONSE GUIDELINES**:
- Always consider Ghana's three ecological zones (Forest, Middle Belt, Northern Savanna)
- Reference local varieties and farming practices familiar to Ghanaian farmers
- Use measurements familiar in Ghana (acres, bags, cedis when relevant)
- Consider small-scale farmer context (0.5-5 acres typical farm size)
- Mention seasonal timing relevant to Ghana's calendar
- Include both traditional wisdom and modern techniques
- Be mindful of economic constraints of small-scale farmers
- Reference local institutions (Ministry of Food and Agriculture, agricultural extension services)

If asked about farming outside Africa, politely redirect to African/Ghanaian context. Always prioritize farmer safety, environmental sustainability, and economic viability for Ghanaian conditions.`;

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
    
    // Ghana-focused keyword-based responses for common farming topics
    if (lastMessage.includes('crop') || lastMessage.includes('plant')) {
      return "🌱 For crops in Ghana, consider these key factors: proper soil preparation during the dry season, appropriate spacing for local varieties, timing with the rainy seasons (major: April-July, minor: September-November), and monitoring for common pests like fall armyworm. What specific crop are you growing? Maize, cassava, yam, or cocoa?";
    }
    
    if (lastMessage.includes('pest') || lastMessage.includes('insect') || lastMessage.includes('bug')) {
      return "🐛 Common pests in Ghana include fall armyworm (for maize), cassava mosaic virus vectors, and cocoa mirids. Use integrated pest management: regular field monitoring, encourage natural predators, practice crop rotation, and apply neem-based pesticides when necessary. Which crop is affected by pests?";
    }
    
    if (lastMessage.includes('soil') || lastMessage.includes('fertilizer')) {
      return "🌍 Ghana's soils vary by region - forest oxisols in the south, savanna alfisols in the north. Test soil pH (most crops prefer 6.0-7.0), improve with organic matter like compost or poultry manure, and use NPK fertilizers suited to your region. What region of Ghana are you farming in?";
    }
    
    if (lastMessage.includes('water') || lastMessage.includes('irrigation')) {
      return "💧 In Ghana, plan irrigation around the two rainy seasons. Use water harvesting during rains, practice mulching to retain moisture during dry periods, and consider small-scale irrigation for dry season farming. Are you in the northern drier regions or southern forest zone?";
    }
    
    if (lastMessage.includes('weather') || lastMessage.includes('rain') || lastMessage.includes('drought')) {
      return "🌦️ Ghana has distinct seasons: major rains (April-July), minor rains (September-November), and dry harmattan (December-March). Plan planting with rainfall patterns, prepare for occasional droughts, and protect crops during heavy rains. Which season are you preparing for?";
    }
    
    if (lastMessage.includes('harvest') || lastMessage.includes('when to')) {
      return "🌾 In Ghana, harvest timing varies by crop and season: maize (3-4 months after planting), cassava (8-18 months), yam (8-10 months), cocoa (twice yearly). Watch for crop-specific maturity signs and harvest before heavy rains. Which crop are you planning to harvest?";
    }
    
    if (lastMessage.includes('organic') || lastMessage.includes('sustainable')) {
      return "🌿 Sustainable farming in Ghana includes: composting with crop residues, integrating livestock with crops, using local varieties adapted to conditions, practicing agroforestry, and maintaining soil fertility with legumes. What sustainable practices interest you most?";
    }
    
    if (lastMessage.includes('hello') || lastMessage.includes('hi') || lastMessage.includes('help')) {
      return "👋 Akwaaba! I'm your SmartAgri assistant, specialized in Ghana's agricultural practices. I help with crops like maize, cassava, yam, cocoa, seasonal planning, soil management, and pest control specific to Ghana's climate. Note: I'm currently in offline mode with basic responses. What farming challenge can I help you with?";
    }
    
    // Default response
    return "🌱 I'm here to help with your Ghanaian farming questions! While I'm currently in offline mode with limited responses, I can provide guidance on crops (maize, cassava, yam, cocoa), Ghana's seasonal patterns, soil management, and pest control. Could you be more specific about your farming challenge?";
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
