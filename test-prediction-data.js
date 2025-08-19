// Test file for weather prediction data format

// Sample prediction data in your specified format
const samplePredictionData = {
  "Average_Relative_Humidity": 78.5,
  "Minimum_Temperature": 22.3,
  "Maximum_Temperature": 29.7,
  "Cloud_Cover": 6,
  "Station_Level_Pressure": 1012.5,
  "Date": "2025-08-17"
};

// Multiple days of prediction data
const multiDayPredictions = [
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
    "Average_Relative_Humidity": 75.2,
    "Minimum_Temperature": 23.1,
    "Maximum_Temperature": 31.2,
    "Cloud_Cover": 15,
    "Station_Level_Pressure": 1015.7,
    "Date": "2025-08-19"
  },
  {
    "Average_Relative_Humidity": 89.3,
    "Minimum_Temperature": 20.5,
    "Maximum_Temperature": 26.8,
    "Cloud_Cover": 85,
    "Station_Level_Pressure": 1005.2,
    "Date": "2025-08-20"
  },
  {
    "Average_Relative_Humidity": 65.8,
    "Minimum_Temperature": 24.2,
    "Maximum_Temperature": 33.1,
    "Cloud_Cover": 8,
    "Station_Level_Pressure": 1018.9,
    "Date": "2025-08-21"
  }
];

// Function to process prediction data
function processPredictionData(data) {
  console.log('\n--- Processing Weather Prediction Data ---');
  console.log('Date:', data.Date);
  console.log('Temperature Range:', `${data.Minimum_Temperature}°C - ${data.Maximum_Temperature}°C`);
  console.log('Average Humidity:', `${data.Average_Relative_Humidity}%`);
  console.log('Cloud Cover:', `${data.Cloud_Cover}%`);
  console.log('Pressure:', `${data.Station_Level_Pressure} hPa`);
  
  // Calculate derived values
  const avgTemperature = (data.Minimum_Temperature + data.Maximum_Temperature) / 2;
  console.log('Average Temperature:', `${avgTemperature.toFixed(1)}°C`);
  
  // Determine weather condition
  let condition = 'Clear';
  if (data.Cloud_Cover > 70) condition = 'Cloudy';
  else if (data.Cloud_Cover > 30) condition = 'Partly Cloudy';
  console.log('Weather Condition:', condition);
  
  // Estimate rainfall probability
  const rainfallProbability = Math.min(100, (data.Average_Relative_Humidity - 50) + (data.Cloud_Cover * 0.5));
  console.log('Rainfall Probability:', `${Math.max(0, rainfallProbability.toFixed(1))}%`);
  
  // Generate farming recommendations
  const recommendations = generateRecommendations(data);
  console.log('Farming Recommendations:');
  recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
  
  return {
    ...data,
    avgTemperature: avgTemperature,
    condition: condition,
    rainfallProbability: Math.max(0, rainfallProbability),
    recommendations: recommendations
  };
}

function generateRecommendations(data) {
  const recommendations = [];
  const avgTemp = (data.Minimum_Temperature + data.Maximum_Temperature) / 2;
  
  // Temperature recommendations
  if (data.Maximum_Temperature > 35) {
    recommendations.push('High temperature alert - provide shade for crops and increase irrigation');
  }
  if (data.Minimum_Temperature < 15) {
    recommendations.push('Cold temperature warning - protect sensitive crops');
  }
  
  // Humidity recommendations
  if (data.Average_Relative_Humidity > 85) {
    recommendations.push('High humidity - monitor for fungal diseases');
  }
  if (data.Average_Relative_Humidity < 40) {
    recommendations.push('Low humidity - increase irrigation frequency');
  }
  
  // Cloud cover recommendations
  if (data.Cloud_Cover > 80) {
    recommendations.push('Heavy cloud cover - prepare for possible rainfall');
  }
  if (data.Cloud_Cover < 20) {
    recommendations.push('Clear skies - excellent for field operations and harvesting');
  }
  
  // Pressure recommendations
  if (data.Station_Level_Pressure < 1010) {
    recommendations.push('Low pressure system - expect unsettled weather');
  }
  
  // General farming advice based on conditions
  if (avgTemp >= 25 && avgTemp <= 30 && data.Average_Relative_Humidity >= 60 && data.Average_Relative_Humidity <= 80) {
    recommendations.push('Optimal conditions for most crops - good time for planting');
  }
  
  return recommendations;
}

// Test single prediction
console.log('=== SINGLE DAY PREDICTION TEST ===');
const processedSingle = processPredictionData(samplePredictionData);

// Test multiple predictions
console.log('\n\n=== MULTI-DAY PREDICTION TEST ===');
multiDayPredictions.forEach((prediction, index) => {
  console.log(`\n--- Day ${index + 1} ---`);
  processPredictionData(prediction);
});

// Summary analysis
console.log('\n\n=== WEEKLY SUMMARY ===');
const weeklyAnalysis = {
  avgTempMin: multiDayPredictions.reduce((sum, day) => sum + day.Minimum_Temperature, 0) / multiDayPredictions.length,
  avgTempMax: multiDayPredictions.reduce((sum, day) => sum + day.Maximum_Temperature, 0) / multiDayPredictions.length,
  avgHumidity: multiDayPredictions.reduce((sum, day) => sum + day.Average_Relative_Humidity, 0) / multiDayPredictions.length,
  avgCloudCover: multiDayPredictions.reduce((sum, day) => sum + day.Cloud_Cover, 0) / multiDayPredictions.length,
  avgPressure: multiDayPredictions.reduce((sum, day) => sum + day.Station_Level_Pressure, 0) / multiDayPredictions.length
};

console.log('Weekly Averages:');
console.log(`  Temperature Range: ${weeklyAnalysis.avgTempMin.toFixed(1)}°C - ${weeklyAnalysis.avgTempMax.toFixed(1)}°C`);
console.log(`  Humidity: ${weeklyAnalysis.avgHumidity.toFixed(1)}%`);
console.log(`  Cloud Cover: ${weeklyAnalysis.avgCloudCover.toFixed(1)}%`);
console.log(`  Pressure: ${weeklyAnalysis.avgPressure.toFixed(1)} hPa`);

// Export sample data for use in other parts of the application
module.exports = {
  samplePredictionData,
  multiDayPredictions,
  processPredictionData,
  generateRecommendations
};
