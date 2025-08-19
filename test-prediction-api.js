// Simple test script to demonstrate weather prediction data usage
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

// Sample prediction data in your format
const samplePredictionData = {
  "Average_Relative_Humidity": 78.5,
  "Minimum_Temperature": 22.3,
  "Maximum_Temperature": 29.7,
  "Cloud_Cover": 6,
  "Station_Level_Pressure": 1012.5,
  "Date": "2025-08-17"
};

const multiDayPredictionData = [
  {
    "Average_Relative_Humidity": 78.5,
    "Minimum_Temperature": 22.3,
    "Maximum_Temperature": 29.7,
    "Cloud_Cover": 6,
    "Station_Level_Pressure": 1012.5,
    "Date": "2025-08-17"
  },
  {
    "Average_Relative_Humidity": 82.1,
    "Minimum_Temperature": 21.8,
    "Maximum_Temperature": 28.4,
    "Cloud_Cover": 45,
    "Station_Level_Pressure": 1008.3,
    "Date": "2025-08-18"
  },
  {
    "Average_Relative_Humidity": 89.3,
    "Minimum_Temperature": 20.5,
    "Maximum_Temperature": 26.8,
    "Cloud_Cover": 85,
    "Station_Level_Pressure": 1005.2,
    "Date": "2025-08-19"
  }
];

async function testPredictionAPI() {
  try {
    console.log('🌤️  Testing Weather Prediction API Integration\n');

    // Test 1: Get API documentation
    console.log('1. Getting API documentation...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/weather/predictions`);
      const docs = await response.json();
      console.log('✅ API documentation retrieved');
      console.log('   Supported regions:', docs.supported_regions?.length || 0);
      console.log('   Usage examples available:', Object.keys(docs.usage_examples || {}).length);
    } catch (error) {
      console.log('❌ Failed to get API documentation:', error.message);
      console.log('   Make sure the development server is running on port 3000');
      return;
    }

    // Test 2: Process single prediction
    console.log('\n2. Processing single day prediction...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/weather/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: samplePredictionData,
          region: 'Ashanti',
          format: 'processed'
        })
      });

      const result = await response.json();
      if (result.processed) {
        console.log('✅ Single prediction processed successfully');
        console.log(`   Date: ${result.processed.Date}`);
        console.log(`   Weather: ${result.processed.weather_condition}`);
        console.log(`   Recommendations: ${result.processed.farming_recommendations?.length || 0} items`);
      }
    } catch (error) {
      console.log('❌ Failed to process single prediction:', error.message);
    }

    // Test 3: Process multi-day predictions
    console.log('\n3. Processing multi-day predictions...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/weather/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: multiDayPredictionData,
          region: 'Northern',
          format: 'full'
        })
      });

      const result = await response.json();
      if (result.daily_predictions) {
        console.log('✅ Multi-day predictions processed successfully');
        console.log(`   Period: ${result.period}`);
        console.log(`   Region: ${result.region}`);
        console.log(`   Days processed: ${result.daily_predictions.length}`);
        console.log(`   Weekly recommendations: ${result.weekly_analysis?.recommendations?.length || 0} items`);
        
        // Show first day details
        const firstDay = result.daily_predictions[0];
        if (firstDay) {
          console.log(`   First day example:`);
          console.log(`     - Weather: ${firstDay.processed.weather_condition}`);
          console.log(`     - Temp Range: ${firstDay.original.Minimum_Temperature}°C - ${firstDay.original.Maximum_Temperature}°C`);
          console.log(`     - Humidity: ${firstDay.original.Average_Relative_Humidity}%`);
        }
      }
    } catch (error) {
      console.log('❌ Failed to process multi-day predictions:', error.message);
    }

    // Test 4: Convert to weather data format
    console.log('\n4. Converting to weather data format...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/weather/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: samplePredictionData,
          region: 'Greater Accra',
          format: 'weather'
        })
      });

      const result = await response.json();
      if (result.weather) {
        console.log('✅ Weather data conversion successful');
        console.log(`   Location: ${result.weather.location}`);
        console.log(`   Temperature: ${result.weather.temperature}°C`);
        console.log(`   Description: ${result.weather.description}`);
        console.log(`   Crop recommendations: ${result.weather.cropRecommendations?.length || 0} crops`);
      }
    } catch (error) {
      console.log('❌ Failed to convert to weather data:', error.message);
    }

    console.log('\n🎉 Weather prediction API testing completed!');
    console.log('\nNext steps:');
    console.log('1. Your application can now process prediction data in the specified format');
    console.log('2. Use the /api/weather/predictions endpoint to process your AI predictions');
    console.log('3. Integrate the WeatherPredictionsTab component into your UI');
    console.log('4. Visit http://localhost:3000/weather to see the predictions interface');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Example usage in your application
function exampleUsage() {
  console.log('\n📝 Example usage in your application:\n');
  
  const exampleCode = `
// In your React component:
import { WeatherPredictionsTab } from '@/components/weather/WeatherPredictionsTab';

// Your prediction data format:
const predictionData = {
  "Average_Relative_Humidity": 78.5,
  "Minimum_Temperature": 22.3,
  "Maximum_Temperature": 29.7,
  "Cloud_Cover": 6,
  "Station_Level_Pressure": 1012.5,
  "Date": "2025-08-17"
};

// Process prediction data:
const processData = async () => {
  const response = await fetch('/api/weather/predictions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: predictionData,
      region: 'Ashanti',
      format: 'processed'
    })
  });
  
  const result = await response.json();
  return result.processed; // Contains farming recommendations
};
  `;
  
  console.log(exampleCode);
}

// Run the tests
if (require.main === module) {
  testPredictionAPI().then(() => {
    exampleUsage();
    process.exit(0);
  }).catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testPredictionAPI,
  samplePredictionData,
  multiDayPredictionData
};
