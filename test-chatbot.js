// Test script to verify OpenRouter API connection
const testChatbot = async () => {
  try {
    console.log('Testing OpenRouter API...');
    
    // Check environment variable
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENROUTER_API_KEY not found in environment');
      return;
    }
    console.log('✅ API key found');
    console.log('API key starts with:', apiKey.substring(0, 10) + '...');

    // Test with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    console.log('Making API request...');
    
    // Test API call
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SmartAgri Test',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an agricultural assistant.'
          },
          {
            role: 'user',
            content: 'Hello, can you help me with farming?'
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response:', data.choices[0]?.message?.content);
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Request timed out after 10 seconds');
    } else {
      console.error('❌ Test failed:', error.message);
    }
  }
};

// Load environment variables
require('dotenv').config({ path: '.env.local' });
testChatbot();
