import { ProcessedWeatherData } from './openweather-api';
import weatherForecastService from './weather-forecast';

export interface WeatherData {
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  condition: string;
  location: string;
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData[]> {
  try {
    const forecastData = await weatherForecastService.getForecast(lat, lon);
    
    return forecastData.daily.map(day => ({
      date: day.date.toISOString().split('T')[0],
      temperature: day.temp,
      humidity: day.humidity,
      rainfall: day.rainfall,
      condition: day.condition,
      location: `${lat.toFixed(2)}, ${lon.toFixed(2)}`
    }));
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}
