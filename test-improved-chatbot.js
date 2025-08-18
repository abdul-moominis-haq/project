// Test the improved chatbot service
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

// Mock the Next.js environment
process.env.NODE_ENV = 'development';

const testImprovedChatbot = async () => {
  try {
    console.log('Testing improved chatbot service...');
    
    // Import the chatbot (using dynamic import for ES modules)
    const { smartAgriBot } = await import('./services/chatbot.js');
    
    console.log('✅ Chatbot service imported successfully');
    
    // Test connection
    console.log('\n🔍 Testing connection...');
    const connectionTest = await smartAgriBot.testConnection();
    console.log('Connection result:', connectionTest);
    
    // Test basic message
    console.log('\n💬 Testing basic message...');
    const response1 = await smartAgriBot.sendMessage([
      { role: 'user', content: 'Hello, can you help me with farming?' }
    ]);
    console.log('Response 1:', response1);
    
    // Test crop advice
    console.log('\n🌱 Testing crop advice...');
    const response2 = await smartAgriBot.getCropAdvice('tomatoes', 'leaves turning yellow');
    console.log('Response 2:', response2);
    
    // Test weather advice
    console.log('\n🌦️ Testing weather advice...');
    const response3 = await smartAgriBot.getWeatherBasedAdvice('rainy', ['corn', 'beans'], 'Ghana');
    console.log('Response 3:', response3);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
};

testImprovedChatbot();
