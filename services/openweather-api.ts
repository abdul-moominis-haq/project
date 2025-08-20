// OpenWeather API Service for real-time weather data
export interface OpenWeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  snow?: {
    '1h'?: number;
    '3h'?: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface WeatherRecommendation {
  category: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  action?: string;
}

export interface ProcessedWeatherData {
  location: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  cloudCover: number;
  visibility: number;
  description: string;
  icon: string;
  sunrise: Date;
  sunset: Date;
  recommendations: WeatherRecommendation[];
}

class OpenWeatherService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_OPENWEATHER_BASE_URL || 'http://api.openweathermap.org/data/2.5/weather';
    this.apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '';
  }

  async getCurrentWeather(lat: number, lon: number): Promise<ProcessedWeatherData> {
    try {
      const response = await fetch(
        `${this.baseUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: OpenWeatherData = await response.json();
      return this.processWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  async getCurrentWeatherByCity(city: string, country: string = 'GH'): Promise<ProcessedWeatherData> {
    try {
      const response = await fetch(
        `${this.baseUrl}?q=${city},${country}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: OpenWeatherData = await response.json();
      return this.processWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data by city:', error);
      throw error;
    }
  }

  private processWeatherData(data: OpenWeatherData): ProcessedWeatherData {
    const recommendations = this.generateRecommendations(data);

    return {
      location: `${data.name}, ${data.sys.country}`,
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      cloudCover: data.clouds.all,
      visibility: data.visibility / 1000, // Convert to km
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      recommendations
    };
  }

  private generateRecommendations(data: OpenWeatherData): WeatherRecommendation[] {
    const recommendations: WeatherRecommendation[] = [];
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const rainVolume = data.rain?.['1h'] || 0;
    const weatherMain = data.weather[0].main.toLowerCase();

    // Temperature-based recommendations
    if (temp > 35) {
      recommendations.push({
        category: 'Heat Stress',
        message: 'Very high temperatures detected. Crops may experience heat stress.',
        severity: 'high',
        action: 'Increase irrigation frequency and provide shade for sensitive crops.'
      });
    } else if (temp > 30) {
      recommendations.push({
        category: 'High Temperature',
        message: 'High temperatures may affect crop growth.',
        severity: 'medium',
        action: 'Monitor soil moisture and consider early morning watering.'
      });
    } else if (temp < 15) {
      recommendations.push({
        category: 'Cool Weather',
        message: 'Cool temperatures may slow crop development.',
        severity: 'medium',
        action: 'Consider protective covering for sensitive plants.'
      });
    }

    // Humidity-based recommendations
    if (humidity > 80) {
      recommendations.push({
        category: 'High Humidity',
        message: 'High humidity may promote fungal diseases.',
        severity: 'medium',
        action: 'Improve air circulation and monitor for fungal infections.'
      });
    } else if (humidity < 30) {
      recommendations.push({
        category: 'Low Humidity',
        message: 'Low humidity may cause plant stress.',
        severity: 'medium',
        action: 'Increase irrigation and consider mulching to retain moisture.'
      });
    }

    // Wind-based recommendations
    if (windSpeed > 10) {
      recommendations.push({
        category: 'Strong Winds',
        message: 'Strong winds may damage crops and increase water loss.',
        severity: 'high',
        action: 'Provide windbreaks and secure loose structures.'
      });
    }

    // Weather condition-based recommendations
    if (weatherMain.includes('rain') || rainVolume > 0) {
      if (rainVolume > 10) {
        recommendations.push({
          category: 'Heavy Rain',
          message: 'Heavy rainfall may cause waterlogging.',
          severity: 'high',
          action: 'Ensure proper drainage and avoid field activities.'
        });
      } else {
        recommendations.push({
          category: 'Light Rain',
          message: 'Light rainfall provides natural irrigation.',
          severity: 'low',
          action: 'Good conditions for most crops. Monitor soil moisture.'
        });
      }
    } else if (weatherMain.includes('clear') || weatherMain.includes('sun')) {
      recommendations.push({
        category: 'Clear Weather',
        message: 'Clear sunny conditions are favorable for photosynthesis.',
        severity: 'low',
        action: 'Good time for field activities and monitoring crops.'
      });
    }

    // Ghana-specific recommendations
    if (data.sys.country === 'GH') {
      if (temp > 32 && humidity > 70) {
        recommendations.push({
          category: 'Ghana Climate Alert',
          message: 'Hot and humid conditions typical for Ghana\'s rainy season.',
          severity: 'medium',
          action: 'Monitor for pest activity and fungal diseases common in Ghana.'
        });
      }
    }

    return recommendations;
  }

  // Get weather icon URL
  getWeatherIconUrl(iconCode: string): string {
    return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  // Get crop-specific recommendations based on weather
  getCropRecommendations(cropType: string, weatherData: ProcessedWeatherData): WeatherRecommendation[] {
    const cropRecommendations: WeatherRecommendation[] = [];
    const { temperature, humidity, windSpeed } = weatherData;

    switch (cropType.toLowerCase()) {
      case 'tomato':
      case 'tomatoes':
        if (temperature > 30) {
          cropRecommendations.push({
            category: 'Tomato Care',
            message: 'High temperatures can affect tomato fruit set.',
            severity: 'medium',
            action: 'Provide shade during peak sun hours and maintain consistent watering.'
          });
        }
        if (humidity > 80) {
          cropRecommendations.push({
            category: 'Tomato Disease Risk',
            message: 'High humidity increases risk of blight and fungal diseases.',
            severity: 'high',
            action: 'Improve air circulation and apply preventive fungicides.'
          });
        }
        break;

      case 'maize':
      case 'corn':
        if (temperature > 35) {
          cropRecommendations.push({
            category: 'Maize Heat Stress',
            message: 'Extreme heat can reduce maize yield.',
            severity: 'high',
            action: 'Ensure adequate water supply during tasseling and grain filling.'
          });
        }
        if (windSpeed > 8) {
          cropRecommendations.push({
            category: 'Maize Wind Damage',
            message: 'Strong winds may cause lodging in mature maize plants.',
            severity: 'medium',
            action: 'Check plant stability and consider harvesting if near maturity.'
          });
        }
        break;

      case 'rice':
        if (temperature < 20) {
          cropRecommendations.push({
            category: 'Rice Growth',
            message: 'Cool temperatures may slow rice development.',
            severity: 'medium',
            action: 'Monitor growth stages and adjust management practices.'
          });
        }
        break;

      case 'cocoa':
        if (humidity < 60) {
          cropRecommendations.push({
            category: 'Cocoa Moisture',
            message: 'Cocoa requires high humidity for optimal growth.',
            severity: 'medium',
            action: 'Maintain soil moisture and consider irrigation.'
          });
        }
        break;

      default:
        // General crop recommendations
        if (temperature > 35 || temperature < 10) {
          cropRecommendations.push({
            category: 'General Crop Care',
            message: 'Extreme temperatures may stress most crops.',
            severity: 'medium',
            action: 'Monitor crops closely and adjust irrigation as needed.'
          });
        }
    }

    return [...weatherData.recommendations, ...cropRecommendations];
  }
}

const openWeatherService = new OpenWeatherService();
export default openWeatherService;
