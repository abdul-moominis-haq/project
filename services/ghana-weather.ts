// Ghana-specific weather service for farming and agriculture
import { WeatherPredictionData, ExtendedWeatherPrediction } from '@/types';

export interface GhanaWeatherData {
  location: string;
  region: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  description: string;
  forecast: {
    today: string;
    tomorrow: string;
    weekly: string;
  };
  farmingAdvice: {
    planting: string;
    irrigation: string;
    harvesting: string;
    pest_control: string;
  };
  cropRecommendations: string[];
  alerts: string[];
}

export interface GhanaRegionWeather {
  [region: string]: {
    climate: string;
    rainySeasonMonths: string[];
    drySeasonMonths: string[];
    averageTemp: number;
    averageRainfall: number;
    mainCrops: string[];
  };
}

class GhanaWeatherService {
  // Using Open-Meteo API which doesn't require API key
  private readonly OPEN_METEO_URL = 'https://api.open-meteo.com/v1';

  // Ghana's agricultural regions and their characteristics
  private readonly ghanaRegions: GhanaRegionWeather = {
    'Greater Accra': {
      climate: 'Coastal savanna',
      rainySeasonMonths: ['April', 'May', 'June', 'July', 'August', 'September'],
      drySeasonMonths: ['November', 'December', 'January', 'February', 'March'],
      averageTemp: 27,
      averageRainfall: 800,
      mainCrops: ['cassava', 'maize', 'sweet potato', 'okra', 'tomato']
    },
    'Ashanti': {
      climate: 'Forest',
      rainySeasonMonths: ['March', 'April', 'May', 'June', 'July', 'August', 'September', 'October'],
      drySeasonMonths: ['November', 'December', 'January', 'February'],
      averageTemp: 26,
      averageRainfall: 1400,
      mainCrops: ['cocoa', 'plantain', 'cassava', 'yam', 'maize']
    },
    'Northern': {
      climate: 'Guinea savanna',
      rainySeasonMonths: ['May', 'June', 'July', 'August', 'September'],
      drySeasonMonths: ['October', 'November', 'December', 'January', 'February', 'March', 'April'],
      averageTemp: 28,
      averageRainfall: 1000,
      mainCrops: ['millet', 'sorghum', 'maize', 'rice', 'yam', 'groundnut']
    },
    'Upper East': {
      climate: 'Sudan savanna',
      rainySeasonMonths: ['May', 'June', 'July', 'August', 'September'],
      drySeasonMonths: ['October', 'November', 'December', 'January', 'February', 'March', 'April'],
      averageTemp: 29,
      averageRainfall: 900,
      mainCrops: ['millet', 'sorghum', 'rice', 'groundnut', 'cowpea']
    },
    'Upper West': {
      climate: 'Sudan savanna',
      rainySeasonMonths: ['May', 'June', 'July', 'August', 'September'],
      drySeasonMonths: ['October', 'November', 'December', 'January', 'February', 'March', 'April'],
      averageTemp: 29,
      averageRainfall: 950,
      mainCrops: ['millet', 'sorghum', 'rice', 'groundnut', 'cowpea']
    },
    'Volta': {
      climate: 'Forest transition',
      rainySeasonMonths: ['April', 'May', 'June', 'July', 'August', 'September', 'October'],
      drySeasonMonths: ['November', 'December', 'January', 'February', 'March'],
      averageTemp: 27,
      averageRainfall: 1200,
      mainCrops: ['maize', 'cassava', 'yam', 'rice', 'cocoa']
    },
    'Eastern': {
      climate: 'Forest',
      rainySeasonMonths: ['March', 'April', 'May', 'June', 'July', 'August', 'September', 'October'],
      drySeasonMonths: ['November', 'December', 'January', 'February'],
      averageTemp: 26,
      averageRainfall: 1300,
      mainCrops: ['cocoa', 'oil palm', 'cassava', 'plantain', 'maize']
    },
    'Western': {
      climate: 'Rainforest',
      rainySeasonMonths: ['March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November'],
      drySeasonMonths: ['December', 'January', 'February'],
      averageTemp: 26,
      averageRainfall: 1800,
      mainCrops: ['cocoa', 'oil palm', 'rubber', 'cassava', 'plantain']
    },
    'Central': {
      climate: 'Forest/coastal',
      rainySeasonMonths: ['April', 'May', 'June', 'July', 'August', 'September', 'October'],
      drySeasonMonths: ['November', 'December', 'January', 'February', 'March'],
      averageTemp: 26,
      averageRainfall: 1200,
      mainCrops: ['cassava', 'maize', 'plantain', 'oil palm', 'cocoa']
    },
    'Brong-Ahafo': {
      climate: 'Forest transition',
      rainySeasonMonths: ['April', 'May', 'June', 'July', 'August', 'September', 'October'],
      drySeasonMonths: ['November', 'December', 'January', 'February', 'March'],
      averageTemp: 26,
      averageRainfall: 1250,
      mainCrops: ['yam', 'maize', 'cassava', 'cocoa', 'cashew']
    }
  };

  async getCurrentWeather(lat: number, lon: number): Promise<GhanaWeatherData | null> {
    try {
      // Use Open-Meteo API which doesn't require API key
      const response = await fetch(
        `${this.OPEN_METEO_URL}/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=Africa/Accra`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Determine Ghana region based on coordinates
      const region = this.getGhanaRegionFromCoords(lat, lon);
      
      return this.formatOpenMeteoData(data, region, lat, lon);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Return mock data for Ghana as fallback
      return this.getMockWeatherData('Ghana', 'Greater Accra');
    }
  }

  async getWeatherByCity(city: string): Promise<GhanaWeatherData | null> {
    try {
      // For city-based requests, use default Ghana coordinates or return mock data
      // Open-Meteo works better with coordinates than city names
      const ghanaCoords = this.getGhanaCityCoordinates(city);
      
      if (ghanaCoords) {
        return this.getCurrentWeather(ghanaCoords.lat, ghanaCoords.lon);
      } else {
        // Return mock data for unknown cities
        console.log(`Unknown Ghana city: ${city}, returning mock data`);
        return this.getMockWeatherData(city, 'Greater Accra');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return this.getMockWeatherData(city, 'Greater Accra');
    }
  }

  private getGhanaCityCoordinates(city: string): { lat: number; lon: number } | null {
    // Common Ghana cities and their coordinates
    const ghanaCities: { [key: string]: { lat: number; lon: number } } = {
      'accra': { lat: 5.6037, lon: -0.1870 },
      'kumasi': { lat: 6.6885, lon: -1.6244 },
      'tamale': { lat: 9.4034, lon: -0.8424 },
      'takoradi': { lat: 4.8845, lon: -1.7554 },
      'cape coast': { lat: 5.1313, lon: -1.2464 },
      'ho': { lat: 6.6112, lon: 0.4712 },
      'koforidua': { lat: 6.0940, lon: -0.2640 },
      'sunyani': { lat: 7.3386, lon: -2.3266 },
      'wa': { lat: 10.0608, lon: -2.5009 },
      'bolgatanga': { lat: 10.7856, lon: -0.8506 }
    };
    
    const normalizedCity = city.toLowerCase().trim();
    return ghanaCities[normalizedCity] || null;
  }

  private formatOpenMeteoData(data: any, region: string, lat: number, lon: number): GhanaWeatherData {
    const currentWeather = data.current_weather;
    const hourlyData = data.hourly;
    
    // Calculate averages from hourly data for better accuracy
    const temperature = currentWeather.temperature;
    const humidity = hourlyData.relative_humidity_2m ? 
      hourlyData.relative_humidity_2m.slice(0, 24).reduce((a: number, b: number) => a + b, 0) / 24 : 65;
    const rainfall = hourlyData.precipitation ? 
      hourlyData.precipitation.slice(0, 24).reduce((a: number, b: number) => a + b, 0) : 0;
    const windSpeed = currentWeather.windspeed;
    
    const regionData = this.ghanaRegions[region] || this.ghanaRegions['Greater Accra'];
    
    // Create mock data structure that matches what existing methods expect
    const mockApiData = {
      main: {
        temp: temperature,
        humidity: humidity
      },
      weather: [{
        main: rainfall > 2 ? 'Rain' : (temperature > 30 ? 'Clear' : 'Clouds'),
        description: rainfall > 2 ? 'light rain' : (temperature > 30 ? 'clear sky' : 'few clouds')
      }],
      wind: {
        speed: windSpeed
      }
    };

    // Determine if it's rainy season (April to September)
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const isRainySeason = currentMonth >= 4 && currentMonth <= 9;
    
    return {
      location: `${region}, Ghana`,
      region: region,
      temperature: Math.round(temperature),
      humidity: Math.round(humidity),
      rainfall: Math.round(rainfall * 10) / 10, // Round to 1 decimal
      windSpeed: Math.round(windSpeed * 10) / 10,
      description: mockApiData.weather[0].description,
      forecast: this.generateForecastFromData(region, temperature, rainfall, isRainySeason),
      farmingAdvice: this.getFarmingAdvice(mockApiData, region, isRainySeason),
      cropRecommendations: regionData.mainCrops,
      alerts: this.getWeatherAlerts(mockApiData, region, isRainySeason)
    };
  }

  private generateForecastFromData(region: string, temperature: number, rainfall: number, isRainySeason: boolean): any {
    const regionInfo = this.ghanaRegions[region] || this.ghanaRegions['Greater Accra'];
    
    return {
      today: `${Math.round(temperature)}°C, ${rainfall > 1 ? 'Rainy' : 'Clear'}. Good for ${regionInfo.mainCrops[0]} farming.`,
      tomorrow: `Expected ${Math.round(temperature + (Math.random() - 0.5) * 4)}°C. ${isRainySeason ? 'Possible showers.' : 'Generally dry.'}`,
      weekly: isRainySeason 
        ? `Rainy season continues. Regular rainfall expected, ideal for ${regionInfo.mainCrops.slice(0, 2).join(' and ')}.`
        : `Dry conditions expected. Focus on irrigation for ${regionInfo.mainCrops[0]} crops.`
    };
  }

  private getGhanaRegionFromCoords(lat: number, lon: number): string {
    // Simple region detection based on coordinates
    // Northern regions
    if (lat > 9.5) return 'Upper East';
    if (lat > 9.0 && lon < -2.0) return 'Upper West';
    if (lat > 8.0) return 'Northern';
    
    // Forest belt
    if (lat > 6.5 && lon < -1.5) return 'Brong-Ahafo';
    if (lat > 6.0 && lon < -0.5) return 'Ashanti';
    if (lat > 6.0 && lon < -2.5) return 'Western';
    if (lat > 6.0) return 'Eastern';
    
    // Southern regions
    if (lon > 0.5) return 'Volta';
    if (lat < 5.8) return 'Central';
    
    return 'Greater Accra'; // Default for Accra area
  }

  private formatWeatherData(apiData: any, region: string): GhanaWeatherData {
    const regionInfo = this.ghanaRegions[region] || this.ghanaRegions['Greater Accra'];
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const isRainySeason = regionInfo.rainySeasonMonths.includes(currentMonth);

    return {
      location: apiData.name,
      region: region,
      temperature: Math.round(apiData.main.temp),
      humidity: apiData.main.humidity,
      rainfall: apiData.rain?.['1h'] || 0,
      windSpeed: apiData.wind?.speed || 0,
      description: apiData.weather[0].description,
      forecast: {
        today: this.getTodayForecast(apiData, isRainySeason),
        tomorrow: this.getTomorrowForecast(apiData, isRainySeason),
        weekly: this.getWeeklyForecast(region, isRainySeason)
      },
      farmingAdvice: this.getFarmingAdvice(apiData, region, isRainySeason),
      cropRecommendations: this.getCropRecommendations(region, isRainySeason),
      alerts: this.getWeatherAlerts(apiData, region, isRainySeason)
    };
  }

  private getTodayForecast(data: any, isRainySeason: boolean): string {
    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const description = data.weather[0].description;
    
    return `${description} with temperature ${temp}°C and humidity ${humidity}%. ${
      isRainySeason ? 'Expect possible rainfall.' : 'Dry conditions expected.'
    }`;
  }

  private getTomorrowForecast(data: any, isRainySeason: boolean): string {
    const temp = Math.round(data.main.temp);
    return `Similar conditions expected. Temperature around ${temp - 1}-${temp + 1}°C. ${
      isRainySeason ? 'Monitor for rain patterns.' : 'Continue dry season farming practices.'
    }`;
  }

  private getWeeklyForecast(region: string, isRainySeason: boolean): string {
    const regionInfo = this.ghanaRegions[region];
    return `${region} region: ${regionInfo.climate} climate. ${
      isRainySeason 
        ? 'Rainy season continues - expect regular rainfall patterns suitable for crop growth.'
        : 'Dry season conditions - focus on irrigation and water conservation.'
    }`;
  }

  private getFarmingAdvice(data: any, region: string, isRainySeason: boolean): any {
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const regionInfo = this.ghanaRegions[region];

    return {
      planting: isRainySeason 
        ? `Excellent time for planting ${regionInfo.mainCrops.slice(0, 2).join(' and ')}. Soil moisture is optimal.`
        : `Consider drought-resistant varieties. Wait for rains or ensure irrigation for ${regionInfo.mainCrops[0]}.`,
      
      irrigation: humidity < 60 
        ? `Low humidity (${humidity}%). Increase irrigation frequency. Consider drip irrigation systems.`
        : `Adequate moisture levels. Monitor soil moisture and adjust irrigation as needed.`,
      
      harvesting: temp > 30 
        ? `High temperature (${temp}°C). Harvest early morning or late evening to prevent crop stress.`
        : `Good harvesting conditions. Optimal temperature for crop handling and storage.`,
      
      pest_control: isRainySeason 
        ? `Humid conditions increase pest risk. Monitor for fungal diseases and apply preventive treatments.`
        : `Lower pest pressure during dry season. Focus on stored grain protection.`
    };
  }

  private getCropRecommendations(region: string, isRainySeason: boolean): string[] {
    const regionInfo = this.ghanaRegions[region];
    
    if (isRainySeason) {
      return [
        `Plant ${regionInfo.mainCrops[0]} - main crop for ${region} region`,
        `Consider ${regionInfo.mainCrops[1]} as secondary crop`,
        `Intercrop with legumes for soil fertility`,
        `Start land preparation for next season crops`
      ];
    } else {
      return [
        `Harvest mature ${regionInfo.mainCrops[0]} crops`,
        `Plant dry season vegetables if irrigation available`,
        `Prepare storage facilities for harvested crops`,
        `Plan crop rotation for next rainy season`
      ];
    }
  }

  private getWeatherAlerts(data: any, region: string, isRainySeason: boolean): string[] {
    const alerts: string[] = [];
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const windSpeed = data.wind?.speed || 0;

    if (temp > 35) {
      alerts.push(`High temperature alert: ${temp}°C. Protect crops from heat stress.`);
    }

    if (humidity > 85 && isRainySeason) {
      alerts.push(`High humidity warning: Risk of fungal diseases in crops.`);
    }

    if (windSpeed > 10) {
      alerts.push(`Strong winds: Secure lightweight structures and young plants.`);
    }

    if (data.rain && data.rain['1h'] > 10) {
      alerts.push(`Heavy rainfall expected: Ensure proper drainage in fields.`);
    }

    if (!isRainySeason && humidity < 40) {
      alerts.push(`Very dry conditions: Increase irrigation and consider mulching.`);
    }

    return alerts;
  }

  private getMockWeatherData(location: string, region: string): GhanaWeatherData {
    const regionInfo = this.ghanaRegions[region] || this.ghanaRegions['Greater Accra'];
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const isRainySeason = regionInfo.rainySeasonMonths.includes(currentMonth);

    return {
      location: location,
      region: region,
      temperature: regionInfo.averageTemp,
      humidity: isRainySeason ? 75 : 45,
      rainfall: isRainySeason ? 5 : 0,
      windSpeed: 3,
      description: isRainySeason ? 'partly cloudy' : 'clear sky',
      forecast: {
        today: `${regionInfo.climate} climate with typical ${isRainySeason ? 'rainy' : 'dry'} season conditions.`,
        tomorrow: `Continued ${isRainySeason ? 'rainy' : 'dry'} season weather patterns.`,
        weekly: `${region} region experiencing normal ${isRainySeason ? 'wet' : 'dry'} season conditions.`
      },
      farmingAdvice: {
        planting: `Suitable for planting ${regionInfo.mainCrops[0]} during ${isRainySeason ? 'rainy' : 'dry'} season.`,
        irrigation: isRainySeason ? 'Natural rainfall sufficient.' : 'Irrigation required for crop growth.',
        harvesting: 'Good conditions for harvesting mature crops.',
        pest_control: `Monitor for ${isRainySeason ? 'humidity-related' : 'drought-stress'} pest issues.`
      },
      cropRecommendations: regionInfo.mainCrops.slice(0, 3),
      alerts: [`Sample data - connect to weather API for real-time alerts in ${region} region.`]
    };
  }

  // Get all Ghana regions for dropdown/selection
  getGhanaRegions(): string[] {
    return Object.keys(this.ghanaRegions);
  }

  // Get list of all supported Ghana regions
  getSupportedRegions(): string[] {
    return Object.keys(this.ghanaRegions);
  }

  // Get region-specific crop information
  getRegionCrops(region: string): string[] {
    return this.ghanaRegions[region]?.mainCrops || [];
  }

  // Get seasonal information for a region
  getSeasonalInfo(region: string): { rainySeasonMonths: string[], drySeasonMonths: string[] } {
    const regionInfo = this.ghanaRegions[region] || this.ghanaRegions['Greater Accra'];
    return {
      rainySeasonMonths: regionInfo.rainySeasonMonths,
      drySeasonMonths: regionInfo.drySeasonMonths
    };
  }

  // Process weather prediction data for AI crop recommendations
  processPredictionData(predictionData: WeatherPredictionData, region?: string): ExtendedWeatherPrediction {
    const targetRegion = region || 'Greater Accra';
    const regionInfo = this.ghanaRegions[targetRegion] || this.ghanaRegions['Greater Accra'];
    
    // Calculate average temperature from min/max
    const avgTemperature = (predictionData.Minimum_Temperature + predictionData.Maximum_Temperature) / 2;
    
    // Determine weather condition based on cloud cover and humidity
    let weatherCondition = 'Clear';
    if (predictionData.Cloud_Cover > 70) {
      weatherCondition = 'Cloudy';
    } else if (predictionData.Cloud_Cover > 30) {
      weatherCondition = 'Partly Cloudy';
    }

    // Estimate rainfall based on humidity and cloud cover
    let predictedRainfall = 0;
    if (predictionData.Average_Relative_Humidity > 80 && predictionData.Cloud_Cover > 60) {
      predictedRainfall = Math.max(0, (predictionData.Average_Relative_Humidity - 60) * 0.2);
    }

    // Generate farming recommendations based on prediction
    const farmingRecommendations = this.generateFarmingRecommendations(predictionData, regionInfo, avgTemperature);

    return {
      ...predictionData,
      location: targetRegion,
      region: targetRegion,
      predicted_rainfall: predictedRainfall,
      weather_condition: weatherCondition,
      farming_recommendations: farmingRecommendations
    };
  }

  // Generate farming recommendations based on prediction data
  private generateFarmingRecommendations(
    predictionData: WeatherPredictionData, 
    regionInfo: any, 
    avgTemperature: number
  ): string[] {
    const recommendations: string[] = [];
    
    // Temperature-based recommendations
    if (predictionData.Maximum_Temperature > 35) {
      recommendations.push('High temperature expected - consider shade protection for crops and increase irrigation');
    }
    if (predictionData.Minimum_Temperature < 15) {
      recommendations.push('Low temperature expected - protect sensitive crops from cold stress');
    }

    // Humidity-based recommendations
    if (predictionData.Average_Relative_Humidity > 85) {
      recommendations.push('High humidity levels - monitor for fungal diseases and ensure good ventilation');
    }
    if (predictionData.Average_Relative_Humidity < 40) {
      recommendations.push('Low humidity levels - increase irrigation frequency and consider mulching');
    }

    // Cloud cover recommendations
    if (predictionData.Cloud_Cover < 20) {
      recommendations.push('Clear skies expected - excellent for harvesting and field operations');
    }
    if (predictionData.Cloud_Cover > 80) {
      recommendations.push('Heavy cloud cover - potential for rainfall, prepare drainage systems');
    }

    // Pressure-based recommendations
    if (predictionData.Station_Level_Pressure < 1010) {
      recommendations.push('Low pressure system - expect unsettled weather, secure loose structures');
    }

    // Crop-specific recommendations for the region
    if (regionInfo.mainCrops.includes('cocoa') && avgTemperature > 30) {
      recommendations.push('Cocoa farms: High temperature may stress plants - ensure adequate shade');
    }
    if (regionInfo.mainCrops.includes('maize') && predictionData.Average_Relative_Humidity < 50) {
      recommendations.push('Maize fields: Low humidity - ensure adequate soil moisture for optimal growth');
    }

    return recommendations;
  }

  // Convert prediction data to GhanaWeatherData format
  convertPredictionToWeatherData(predictionData: WeatherPredictionData, region?: string): GhanaWeatherData {
    const processedData = this.processPredictionData(predictionData, region);
    const avgTemperature = (predictionData.Minimum_Temperature + predictionData.Maximum_Temperature) / 2;
    const regionInfo = this.ghanaRegions[region || 'Greater Accra'];

    return {
      location: processedData.location || 'Ghana',
      region: processedData.region || 'Greater Accra',
      temperature: Math.round(avgTemperature),
      humidity: predictionData.Average_Relative_Humidity,
      rainfall: processedData.predicted_rainfall || 0,
      windSpeed: 5, // Default value as not provided in prediction data
      description: processedData.weather_condition || 'Partly Cloudy',
      forecast: {
        today: `${processedData.weather_condition} with temperature range ${predictionData.Minimum_Temperature}-${predictionData.Maximum_Temperature}°C`,
        tomorrow: `Similar conditions expected with ${predictionData.Average_Relative_Humidity}% humidity`,
        weekly: `Weather patterns suitable for ${regionInfo?.mainCrops?.slice(0, 2).join(' and ')} cultivation`
      },
      farmingAdvice: {
        planting: processedData.farming_recommendations?.find(r => r.includes('plant')) || 'Monitor weather conditions before planting',
        irrigation: processedData.farming_recommendations?.find(r => r.includes('irrigation')) || 'Maintain regular irrigation schedule',
        harvesting: processedData.farming_recommendations?.find(r => r.includes('harvest')) || 'Good conditions for harvesting',
        pest_control: processedData.farming_recommendations?.find(r => r.includes('diseases')) || 'Monitor for pest activity'
      },
      cropRecommendations: regionInfo?.mainCrops?.slice(0, 3) || ['maize', 'cassava', 'plantain'],
      alerts: processedData.farming_recommendations || []
    };
  }
}

const ghanaWeatherService = new GhanaWeatherService();
export default ghanaWeatherService;
