// API endpoint to handle weather prediction data
import { NextRequest, NextResponse } from 'next/server';
import ghanaWeatherService from '@/services/ghana-weather';
import { WeatherPredictionData } from '@/types';

interface PredictionRequest {
  data: WeatherPredictionData | WeatherPredictionData[];
  region?: string;
  format?: 'processed' | 'weather' | 'full';
}

export async function POST(request: NextRequest) {
  try {
    const body: PredictionRequest = await request.json();
    
    if (!body.data) {
      return NextResponse.json(
        { error: 'Missing prediction data' },
        { status: 400 }
      );
    }

    const region = body.region || 'Greater Accra';
    const format = body.format || 'processed';

    // Handle single prediction data
    if (!Array.isArray(body.data)) {
      const singleData = body.data as WeatherPredictionData;
      
      switch (format) {
        case 'weather':
          const weatherData = ghanaWeatherService.convertPredictionToWeatherData(singleData, region);
          return NextResponse.json({ weather: weatherData });
          
        case 'processed':
          const processedData = ghanaWeatherService.processPredictionData(singleData, region);
          return NextResponse.json({ processed: processedData });
          
        case 'full':
          const fullData = {
            original: singleData,
            processed: ghanaWeatherService.processPredictionData(singleData, region),
            weather: ghanaWeatherService.convertPredictionToWeatherData(singleData, region)
          };
          return NextResponse.json({ full: fullData });
          
        default:
          return NextResponse.json(
            { error: 'Invalid format specified' },
            { status: 400 }
          );
      }
    }

    // Handle multiple prediction data
    const predictions = body.data as WeatherPredictionData[];
    const results = predictions.map((prediction, index) => {
      const processed = ghanaWeatherService.processPredictionData(prediction, region);
      const weather = ghanaWeatherService.convertPredictionToWeatherData(prediction, region);
      
      return {
        day: index + 1,
        date: prediction.Date,
        original: prediction,
        processed: processed,
        weather: weather
      };
    });

    // Calculate weekly summary
    const weeklyAnalysis = {
      totalDays: predictions.length,
      averages: {
        temperature_min: predictions.reduce((sum, day) => sum + day.Minimum_Temperature, 0) / predictions.length,
        temperature_max: predictions.reduce((sum, day) => sum + day.Maximum_Temperature, 0) / predictions.length,
        humidity: predictions.reduce((sum, day) => sum + day.Average_Relative_Humidity, 0) / predictions.length,
        cloud_cover: predictions.reduce((sum, day) => sum + day.Cloud_Cover, 0) / predictions.length,
        pressure: predictions.reduce((sum, day) => sum + day.Station_Level_Pressure, 0) / predictions.length
      },
      recommendations: generateWeeklyRecommendations(predictions)
    };

    return NextResponse.json({
      region: region,
      period: `${predictions[0]?.Date} to ${predictions[predictions.length - 1]?.Date}`,
      daily_predictions: results,
      weekly_analysis: weeklyAnalysis
    });

  } catch (error) {
    console.error('Error processing prediction data:', error);
    return NextResponse.json(
      { error: 'Failed to process prediction data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Return sample prediction data format for testing
  const sampleData = {
    single_prediction: {
      "Average_Relative_Humidity": 78.5,
      "Minimum_Temperature": 22.3,
      "Maximum_Temperature": 29.7,
      "Cloud_Cover": 6,
      "Station_Level_Pressure": 1012.5,
      "Date": "2025-08-17"
    },
    multi_day_format: [
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
      }
    ],
    usage_examples: {
      "POST /api/weather/predictions": {
        description: "Send prediction data for processing",
        body: {
          data: "WeatherPredictionData | WeatherPredictionData[]",
          region: "Ghana region name (optional, defaults to 'Greater Accra')",
          format: "processed | weather | full (optional, defaults to 'processed')"
        }
      }
    },
    supported_regions: ghanaWeatherService.getSupportedRegions()
  };

  return NextResponse.json(sampleData);
}

function generateWeeklyRecommendations(predictions: WeatherPredictionData[]): string[] {
  const recommendations: string[] = [];
  
  // Calculate weekly averages
  const avgHumidity = predictions.reduce((sum, day) => sum + day.Average_Relative_Humidity, 0) / predictions.length;
  const avgTempMax = predictions.reduce((sum, day) => sum + day.Maximum_Temperature, 0) / predictions.length;
  const avgTempMin = predictions.reduce((sum, day) => sum + day.Minimum_Temperature, 0) / predictions.length;
  const avgCloudCover = predictions.reduce((sum, day) => sum + day.Cloud_Cover, 0) / predictions.length;
  const avgPressure = predictions.reduce((sum, day) => sum + day.Station_Level_Pressure, 0) / predictions.length;

  // High temperature days
  const hotDays = predictions.filter(day => day.Maximum_Temperature > 35).length;
  if (hotDays > 0) {
    recommendations.push(`${hotDays} day(s) with high temperatures expected - prepare heat protection measures`);
  }

  // High humidity periods
  if (avgHumidity > 85) {
    recommendations.push('High humidity week - increased risk of plant diseases, ensure good ventilation');
  }

  // Cloud cover patterns
  if (avgCloudCover > 70) {
    recommendations.push('Generally cloudy week - expect limited direct sunlight, potential for rainfall');
  } else if (avgCloudCover < 20) {
    recommendations.push('Clear sky week - excellent for outdoor farming activities and harvesting');
  }

  // Pressure patterns
  if (avgPressure < 1010) {
    recommendations.push('Low pressure systems expected - prepare for unstable weather conditions');
  }

  // Temperature range assessment
  const tempRange = avgTempMax - avgTempMin;
  if (tempRange > 15) {
    recommendations.push('Large daily temperature variations - monitor crops for stress');
  }

  // Optimal farming conditions
  if (avgTempMax >= 25 && avgTempMax <= 32 && avgHumidity >= 60 && avgHumidity <= 80) {
    recommendations.push('Favorable conditions for most tropical crops - good week for field operations');
  }

  return recommendations;
}
