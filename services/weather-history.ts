import openWeatherService from './openweather-api';
import { WeatherRecommendation } from './openweather-api';

export interface WeatherHistoryData {
  month: string;
  avgTemp: number;
  avgHumidity: number;
  totalRainfall: number;
  avgWindSpeed: number;
}

export const weatherHistoryService = {
  async getWeeklyAnalytics(lat: number, lng: number): Promise<{
    thisWeek: WeatherHistoryData[];
    lastWeek: WeatherHistoryData[];
  }> {
    try {
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const [thisWeekData, lastWeekData] = await Promise.all([
        openWeatherService.getCurrentWeather(lat, lng),
        openWeatherService.getCurrentWeather(lat, lng) // In real API, this would be historical
      ]);

      // Process the data (in real API, we would process historical data)
      return {
        thisWeek: this.processWeatherData(thisWeekData),
        lastWeek: this.processWeatherData(lastWeekData)
      };
    } catch (error) {
      console.error('Error fetching weekly analytics:', error);
      return { thisWeek: [], lastWeek: [] };
    }
  },

  async getYearlyAnalytics(lat: number, lng: number): Promise<{
    monthlyData: WeatherHistoryData[];
    seasonalPatterns: string[];
    farmingRecommendations: WeatherRecommendation[];
  }> {
    try {
      // In a real implementation, we would fetch historical data for each month
      // For now, we'll generate sample data based on Ghana's climate patterns
      const monthlyData = this.generateYearlyData();
      
      return {
        monthlyData,
        seasonalPatterns: this.analyzeSeasonalPatterns(monthlyData),
        farmingRecommendations: this.generateFarmingRecommendations(monthlyData)
      };
    } catch (error) {
      console.error('Error fetching yearly analytics:', error);
      return { 
        monthlyData: [], 
        seasonalPatterns: [],
        farmingRecommendations: []
      };
    }
  },

  processWeatherData(data: any): WeatherHistoryData[] {
    // Process raw weather data into our format
    return [{
      month: new Date().toLocaleString('en-US', { month: 'short' }),
      avgTemp: data.temperature || 0,
      avgHumidity: data.humidity || 0,
      totalRainfall: data.rainfall || 0,
      avgWindSpeed: data.windSpeed || 0
    }];
  },

  generateYearlyData(): WeatherHistoryData[] {
    // Generate sample data based on Ghana's typical climate patterns
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map(month => {
      const isRainySeason = ['Apr', 'May', 'Jun', 'Sep', 'Oct'].includes(month);
      const isHotSeason = ['Feb', 'Mar'].includes(month);
      const isHarmattan = ['Dec', 'Jan'].includes(month);

      return {
        month,
        avgTemp: isHotSeason ? 32 : isHarmattan ? 28 : 26,
        avgHumidity: isRainySeason ? 85 : isHarmattan ? 55 : 70,
        totalRainfall: isRainySeason ? 150 : 30,
        avgWindSpeed: isHarmattan ? 15 : 8
      };
    });
  },

  analyzeSeasonalPatterns(data: WeatherHistoryData[]): string[] {
    return [
      'Major rainy season: April to mid-July',
      'Minor rainy season: September to November',
      'Harmattan season: December to February',
      'Hot season: February to March'
    ];
  },

  generateFarmingRecommendations(data: WeatherHistoryData[]): WeatherRecommendation[] {
    const recommendations = [
      'Plant maize and other cereals at the start of the major rainy season (April)',
      'Consider irrigation systems for dry season farming',
      'Prepare for harmattan impacts on crops during December-February',
      'Monitor soil moisture during the hot season (February-March)'
    ];

    return recommendations.map(rec => ({
      id: `yearly-${rec.slice(0, 20)}`,
      category: 'Yearly Analysis',
      message: rec,
      severity: 'medium' as const,
      action: 'Review historical data',
      timestamp: new Date().toISOString()
    }));
  }
};
