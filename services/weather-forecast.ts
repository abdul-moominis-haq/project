// Weather Forecast Service for OpenWeather API
import { WeatherRecommendation } from './openweather-api';

export type { WeatherRecommendation };

interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  rain?: {
    '3h': number;
  };
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface WeatherForecastData {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface ProcessedForecastData {
  daily: Array<{
    date: Date;
    day: string;
    temp: number;
    tempMin: number;
    tempMax: number;
    humidity: number;
    windSpeed: number;
    rainfall: number;
    condition: string;
    icon: string;
    pressure: number;
    uvi: number;
  }>;
  farmingRecommendations: WeatherRecommendation[];
}

class WeatherForecastService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = 'https://api.openweathermap.org/data/2.5/forecast';
    this.apiKey = '2089648194dc69bb764b036ffd94f28b';
  }


  private getMostFrequent(arr: any[]): string {
    return arr.sort((a, b) =>
      arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
  }

  async getForecast(lat: number, lon: number): Promise<ProcessedForecastData> {
    try {
      const response = await fetch(
        `${this.baseUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&cnt=40`
      );

      if (!response.ok) {
        throw new Error(`Weather Forecast API error: ${response.status}`);
      }

      const data: WeatherForecastData = await response.json();
      return this.processForecastData(data);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      throw error;
    }
  }

  private processForecastData(data: WeatherForecastData): ProcessedForecastData {
    // Group forecast items by day
    const dailyData = data.list.reduce((acc: { [key: string]: ForecastItem[] }, item) => {
      const date = item.dt_txt.split(' ')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});

    // Process each day's data
    const daily = Object.entries(dailyData).map(([date, items]) => {
      const temps = items.map(item => item.main.temp);
      const tempMin = Math.min(...temps);
      const tempMax = Math.max(...temps);
      const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
      
      const weatherItem = items[Math.floor(items.length / 2)].weather[0]; // Use mid-day weather
      
      return {
        date: new Date(date),
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: Math.round(avgTemp),
        tempMin: Math.round(tempMin),
        tempMax: Math.round(tempMax),
        humidity: Math.round(items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length),
        windSpeed: Math.round(items.reduce((sum, item) => sum + item.wind.speed, 0) / items.length),
        rainfall: Math.round(items.reduce((sum, item) => sum + (item.rain?.['3h'] || 0), 0) * 10) / 10,
        condition: weatherItem.description,
        icon: weatherItem.icon,
        pressure: Math.round(items.reduce((sum, item) => sum + item.main.pressure, 0) / items.length),
        uvi: 0 // Not available in this API endpoint
      };
    }).slice(0, 7); // Get next 7 days

    const farmingRecommendations = this.generateFarmingRecommendations(daily);

    return {
      daily,
      farmingRecommendations
    };
  }

  private generateFarmingRecommendations(dailyData: ProcessedForecastData['daily']): WeatherRecommendation[] {
    const recommendations: WeatherRecommendation[] = [];
    const averageTemp = dailyData.reduce((sum, day) => sum + day.temp, 0) / dailyData.length;
    const totalRainfall = dailyData.reduce((sum, day) => sum + day.rainfall, 0);
    const highUVDays = dailyData.filter(day => day.uvi > 8).length;

    // Temperature-based recommendations
    if (averageTemp > 30) {
      recommendations.push({
        category: 'Temperature',
        message: 'High temperatures expected. Consider additional irrigation and shade protection for sensitive crops.',
        severity: 'high',
        action: 'Implement heat management strategies'
      });
    }

    // Rainfall-based recommendations
    if (totalRainfall > 50) {
      recommendations.push({
        category: 'Rainfall',
        message: 'Heavy rainfall expected. Check drainage systems and protect against soil erosion.',
        severity: 'high',
        action: 'Prepare drainage systems'
      });
    } else if (totalRainfall < 10) {
      recommendations.push({
        category: 'Rainfall',
        message: 'Low rainfall expected. Plan irrigation accordingly.',
        severity: 'medium',
        action: 'Review irrigation schedule'
      });
    }

    // UV exposure recommendations
    if (highUVDays > 3) {
      recommendations.push({
        category: 'UV Exposure',
        message: 'High UV levels expected. Protect workers and sensitive crops.',
        severity: 'medium',
        action: 'Plan for UV protection'
      });
    }

    return recommendations;
  }

  getWeatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }
}

const weatherForecastService = new WeatherForecastService();
export default weatherForecastService;
