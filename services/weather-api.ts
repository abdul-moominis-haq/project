import axios from 'axios';

// Open-Meteo API endpoints
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';
const OPEN_METEO_ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1';

// Interface definitions for Open-Meteo API responses
interface OpenMeteoCurrentWeather {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    apparent_temperature: string;
    is_day: string;
    precipitation: string;
    rain: string;
    showers: string;
    snowfall: string;
    weather_code: string;
    cloud_cover: string;
    pressure_msl: string;
    surface_pressure: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
    wind_gusts_10m: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
}

interface OpenMeteoForecast {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  daily_units: {
    time: string;
    weather_code: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    apparent_temperature_max: string;
    apparent_temperature_min: string;
    sunrise: string;
    sunset: string;
    uv_index_max: string;
    precipitation_sum: string;
    rain_sum: string;
    showers_sum: string;
    snowfall_sum: string;
    precipitation_hours: string;
    precipitation_probability_max: string;
    wind_speed_10m_max: string;
    wind_gusts_10m_max: string;
    wind_direction_10m_dominant: string;
    shortwave_radiation_sum: string;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_sum: number[];
    rain_sum: number[];
    showers_sum: number[];
    snowfall_sum: number[];
    precipitation_hours: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    wind_direction_10m_dominant: number[];
    shortwave_radiation_sum: number[];
  };
}

interface OpenMeteoHistorical {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: {
    time: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    precipitation: string;
    pressure_msl: string;
    wind_speed_10m: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation: number[];
    pressure_msl: number[];
    wind_speed_10m: number[];
  };
}

// Weather code descriptions for Open-Meteo
const WEATHER_DESCRIPTIONS: { [key: number]: { description: string; icon: string } } = {
  0: { description: 'Clear sky', icon: '☀️' },
  1: { description: 'Mainly clear', icon: '🌤️' },
  2: { description: 'Partly cloudy', icon: '⛅' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Fog', icon: '🌫️' },
  48: { description: 'Depositing rime fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌦️' },
  53: { description: 'Moderate drizzle', icon: '🌦️' },
  55: { description: 'Dense drizzle', icon: '🌧️' },
  56: { description: 'Light freezing drizzle', icon: '🌨️' },
  57: { description: 'Dense freezing drizzle', icon: '🌨️' },
  61: { description: 'Slight rain', icon: '🌧️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  66: { description: 'Light freezing rain', icon: '🌨️' },
  67: { description: 'Heavy freezing rain', icon: '🌨️' },
  71: { description: 'Slight snow fall', icon: '🌨️' },
  73: { description: 'Moderate snow fall', icon: '❄️' },
  75: { description: 'Heavy snow fall', icon: '❄️' },
  77: { description: 'Snow grains', icon: '🌨️' },
  80: { description: 'Slight rain showers', icon: '🌦️' },
  81: { description: 'Moderate rain showers', icon: '🌧️' },
  82: { description: 'Violent rain showers', icon: '⛈️' },
  85: { description: 'Slight snow showers', icon: '🌨️' },
  86: { description: 'Heavy snow showers', icon: '❄️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

export class WeatherAPIService {
  // Get current weather for specific coordinates
  static async getCurrentWeather(latitude: number, longitude: number) {
    try {
      const response = await axios.get<OpenMeteoCurrentWeather>(
        `${OPEN_METEO_BASE_URL}/forecast`,
        {
          params: {
            latitude,
            longitude,
            current: [
              'temperature_2m',
              'relative_humidity_2m',
              'apparent_temperature',
              'is_day',
              'precipitation',
              'rain',
              'showers',
              'snowfall',
              'weather_code',
              'cloud_cover',
              'pressure_msl',
              'surface_pressure',
              'wind_speed_10m',
              'wind_direction_10m',
              'wind_gusts_10m'
            ].join(','),
            timezone: 'auto'
          }
        }
      );

      const data = response.data;
      const weatherInfo = WEATHER_DESCRIPTIONS[data.current.weather_code] || 
        { description: 'Unknown', icon: '❓' };

      return {
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          elevation: data.elevation
        },
        current: {
          time: data.current.time,
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          apparent_temperature: data.current.apparent_temperature,
          precipitation: data.current.precipitation,
          rain: data.current.rain,
          weather_code: data.current.weather_code,
          weather_description: weatherInfo.description,
          weather_icon: weatherInfo.icon,
          cloud_cover: data.current.cloud_cover,
          pressure: data.current.pressure_msl,
          wind_speed: data.current.wind_speed_10m,
          wind_direction: data.current.wind_direction_10m,
          wind_gusts: data.current.wind_gusts_10m,
          is_day: data.current.is_day === 1
        },
        units: data.current_units
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw new Error('Failed to fetch current weather data');
    }
  }

  // Get weather forecast for specific coordinates
  static async getWeatherForecast(latitude: number, longitude: number, days: number = 7) {
    try {
      const response = await axios.get<OpenMeteoForecast>(
        `${OPEN_METEO_BASE_URL}/forecast`,
        {
          params: {
            latitude,
            longitude,
            daily: [
              'weather_code',
              'temperature_2m_max',
              'temperature_2m_min',
              'apparent_temperature_max',
              'apparent_temperature_min',
              'sunrise',
              'sunset',
              'uv_index_max',
              'precipitation_sum',
              'rain_sum',
              'showers_sum',
              'snowfall_sum',
              'precipitation_hours',
              'precipitation_probability_max',
              'wind_speed_10m_max',
              'wind_gusts_10m_max',
              'wind_direction_10m_dominant',
              'shortwave_radiation_sum'
            ].join(','),
            timezone: 'auto',
            forecast_days: days
          }
        }
      );

      const data = response.data;
      const forecast = data.daily.time.map((date: string, index: number) => {
        const weatherInfo = WEATHER_DESCRIPTIONS[data.daily.weather_code[index]] || 
          { description: 'Unknown', icon: '❓' };

        return {
          date,
          weather_code: data.daily.weather_code[index],
          weather_description: weatherInfo.description,
          weather_icon: weatherInfo.icon,
          temperature_max: data.daily.temperature_2m_max[index],
          temperature_min: data.daily.temperature_2m_min[index],
          apparent_temperature_max: data.daily.apparent_temperature_max[index],
          apparent_temperature_min: data.daily.apparent_temperature_min[index],
          sunrise: data.daily.sunrise[index],
          sunset: data.daily.sunset[index],
          uv_index_max: data.daily.uv_index_max[index],
          precipitation_sum: data.daily.precipitation_sum[index],
          rain_sum: data.daily.rain_sum[index],
          precipitation_probability: data.daily.precipitation_probability_max[index],
          wind_speed_max: data.daily.wind_speed_10m_max[index],
          wind_gusts_max: data.daily.wind_gusts_10m_max[index],
          wind_direction: data.daily.wind_direction_10m_dominant[index],
          solar_radiation: data.daily.shortwave_radiation_sum[index]
        };
      });

      return {
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          elevation: data.elevation
        },
        forecast,
        units: data.daily_units
      };
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw new Error('Failed to fetch weather forecast data');
    }
  }

  // Get historical weather data for analysis
  static async getHistoricalWeather(
    latitude: number, 
    longitude: number, 
    startDate: string, 
    endDate: string
  ) {
    try {
      const response = await axios.get<OpenMeteoHistorical>(
        `${OPEN_METEO_ARCHIVE_URL}/era5`,
        {
          params: {
            latitude,
            longitude,
            start_date: startDate,
            end_date: endDate,
            hourly: [
              'temperature_2m',
              'relative_humidity_2m',
              'precipitation',
              'pressure_msl',
              'wind_speed_10m'
            ].join(','),
            timezone: 'auto'
          }
        }
      );

      const data = response.data;
      
      // Process hourly data into daily summaries for analysis
      const dailyData = this.processDailyAverages(data);

      return {
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          elevation: data.elevation
        },
        hourly: {
          time: data.hourly.time,
          temperature: data.hourly.temperature_2m,
          humidity: data.hourly.relative_humidity_2m,
          precipitation: data.hourly.precipitation,
          pressure: data.hourly.pressure_msl,
          wind_speed: data.hourly.wind_speed_10m
        },
        daily: dailyData,
        units: data.hourly_units
      };
    } catch (error) {
      console.error('Error fetching historical weather:', error);
      throw new Error('Failed to fetch historical weather data');
    }
  }

  // Process hourly data into daily averages
  private static processDailyAverages(data: OpenMeteoHistorical) {
    const dailyMap = new Map<string, {
      temperatures: number[];
      humidity: number[];
      precipitation: number[];
      pressure: number[];
      wind_speed: number[];
    }>();

    // Group hourly data by date
    data.hourly.time.forEach((timeStr, index) => {
      const date = timeStr.split('T')[0]; // Extract date part
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          temperatures: [],
          humidity: [],
          precipitation: [],
          pressure: [],
          wind_speed: []
        });
      }

      const dayData = dailyMap.get(date)!;
      dayData.temperatures.push(data.hourly.temperature_2m[index]);
      dayData.humidity.push(data.hourly.relative_humidity_2m[index]);
      dayData.precipitation.push(data.hourly.precipitation[index]);
      dayData.pressure.push(data.hourly.pressure_msl[index]);
      dayData.wind_speed.push(data.hourly.wind_speed_10m[index]);
    });

    // Calculate daily averages
    return Array.from(dailyMap.entries()).map(([date, dayData]) => ({
      date,
      temperature_avg: this.average(dayData.temperatures),
      temperature_max: Math.max(...dayData.temperatures),
      temperature_min: Math.min(...dayData.temperatures),
      humidity_avg: this.average(dayData.humidity),
      precipitation_sum: dayData.precipitation.reduce((sum, val) => sum + val, 0),
      pressure_avg: this.average(dayData.pressure),
      wind_speed_avg: this.average(dayData.wind_speed),
      wind_speed_max: Math.max(...dayData.wind_speed)
    }));
  }

  // Helper function to calculate average
  private static average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  // Get weather data for agricultural analysis
  static async getAgriculturalWeatherAnalysis(
    latitude: number, 
    longitude: number, 
    cropType?: string
  ) {
    try {
      // Get current weather
      const currentWeather = await this.getCurrentWeather(latitude, longitude);
      
      // Get 14-day forecast
      const forecast = await this.getWeatherForecast(latitude, longitude, 14);
      
      // Get historical data for the past 30 days for trend analysis
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      const historical = await this.getHistoricalWeather(latitude, longitude, startDate, endDate);

      // Generate agricultural insights
      const insights = this.generateAgriculturalInsights(
        currentWeather, 
        forecast, 
        historical, 
        cropType
      );

      return {
        current: currentWeather,
        forecast,
        historical,
        insights
      };
    } catch (error) {
      console.error('Error in agricultural weather analysis:', error);
      throw new Error('Failed to generate agricultural weather analysis');
    }
  }

  // Generate agricultural insights based on weather data
  private static generateAgriculturalInsights(
    current: any, 
    forecast: any, 
    historical: any, 
    cropType?: string
  ) {
    const insights: {
      irrigation: string[];
      planting: string[];
      harvesting: string[];
      pest_disease: string[];
      general: string[];
    } = {
      irrigation: [],
      planting: [],
      harvesting: [],
      pest_disease: [],
      general: []
    };

    // Current conditions analysis
    if (current.current.humidity < 40) {
      insights.irrigation.push('Low humidity detected. Consider increasing irrigation frequency.');
    }
    
    if (current.current.temperature > 35) {
      insights.general.push('High temperature alert. Provide shade for sensitive crops.');
    }

    // Forecast analysis
    const upcomingRain = forecast.forecast.slice(0, 7).some((day: any) => 
      day.precipitation_probability > 70
    );
    
    if (upcomingRain) {
      insights.irrigation.push('Heavy rain expected in the next week. Reduce irrigation accordingly.');
      insights.pest_disease.push('Wet conditions may increase fungal disease risk. Monitor crops closely.');
    }

    // Historical trend analysis
    const recentTemps = historical.daily.slice(-7).map((day: any) => day.temperature_avg);
    const tempTrend = recentTemps[recentTemps.length - 1] - recentTemps[0];
    
    if (tempTrend > 5) {
      insights.general.push('Rising temperature trend detected. Adjust watering schedule.');
    }

    // Crop-specific insights
    if (cropType) {
      insights.general.push(this.getCropSpecificAdvice(cropType, current, forecast));
    }

    return insights;
  }

  // Get crop-specific weather advice
  private static getCropSpecificAdvice(cropType: string, current: any, forecast: any): string {
    const temp = current.current.temperature;
    const humidity = current.current.humidity;
    
    switch (cropType.toLowerCase()) {
      case 'tomatoes':
        if (temp > 30) return 'Tomatoes prefer cooler temperatures. Consider shade cloth.';
        if (humidity > 80) return 'High humidity may cause blight in tomatoes. Ensure good ventilation.';
        return 'Weather conditions are favorable for tomato growth.';
      
      case 'maize':
      case 'corn':
        if (temp < 15) return 'Cool temperatures may slow maize growth.';
        if (current.current.precipitation < 5) return 'Maize requires adequate water. Consider irrigation.';
        return 'Weather conditions are suitable for maize cultivation.';
      
      case 'beans':
        if (humidity > 85) return 'High humidity may cause fungal diseases in beans.';
        if (temp > 28) return 'High temperatures may affect bean pod development.';
        return 'Weather conditions are appropriate for bean growth.';
      
      default:
        return 'Monitor weather conditions and adjust farming practices accordingly.';
    }
  }

  // Get location name from coordinates using reverse geocoding
  static async getLocationName(latitude: number, longitude: number): Promise<string> {
    try {
      // Using a simple reverse geocoding approach
      // In production, you might want to use a dedicated geocoding service
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
      );
      
      // For now, return coordinates as location name
      // You can enhance this with a proper geocoding service
      return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
    } catch (error) {
      return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
    }
  }
}

export default WeatherAPIService;
