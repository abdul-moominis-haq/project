import { supabase } from './supabase';

export interface WeatherPrediction {
  id: string;
  average_relative_humidity: number;
  minimum_temperature: number;
  maximum_temperature: number;
  cloud_cover: number;
  station_level_pressure: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export const weatherPredictionsAPI = {
  async getLatestPredictions(): Promise<WeatherPrediction[]> {
    const { data, error } = await supabase
      .from('weather_predictions')
      .select('*')
      .order('date', { ascending: true })
      .limit(7);

    if (error) {
      console.error('Error fetching weather predictions:', error);
      throw error;
    }

    return data || [];
  },

  async getPredictionsByDateRange(startDate: string, endDate: string): Promise<WeatherPrediction[]> {
    const { data, error } = await supabase
      .from('weather_predictions')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching weather predictions:', error);
      throw error;
    }

    return data || [];
  }
};
