// Test Gemini API integration
const testGeminiAPI = async () => {
  try {
    console.log('Testing Gemini API...');
    
    const apiKey = 'AIzaSyDrdsmirZmv4wGIAgoR6FxK5FyDec0b3h4';
    
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Hello! Can you help me with farming advice?'
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API Error:', response.status, errorText);
      return;
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (generatedText) {
      console.log('✅ Gemini API Response:', generatedText);
    } else {
      console.log('❌ No response content received');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testGeminiAPI();
