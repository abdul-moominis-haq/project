'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Import API services
import WeatherAPIService from '@/services/weather-api';
import { 
  Cloud, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind,
  Sun,
  BarChart3,
  TrendingUp,
  Cpu,
  Settings,
  Sprout,
  Calendar,
  Activity,
  Brain,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { historicalWeatherData, currentWeather, dummyCrops } from '@/lib/dummy-data';

export default function WeatherPage() {
  const [selectedLocation, setSelectedLocation] = useState('nairobi');
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number, name: string} | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [aiPredictionTimeframe, setAiPredictionTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  // Additional state for API data
  const [weatherData, setWeatherData] = useState(currentWeather);
  const [historicalData, setHistoricalData] = useState(historicalWeatherData);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Load weather data on component mount and location change
  useEffect(() => {
    loadWeatherData();
    loadHistoricalData();
    loadForecastData();
  }, [userLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  // API Functions using Open-Meteo Weather API
  const loadWeatherData = async () => {
    setLoadingWeather(true);
    try {
      if (userLocation) {
        const weather = await WeatherAPIService.getCurrentWeather(
          userLocation.latitude, 
          userLocation.longitude
        );
        setWeatherData({
          temperature: Math.round(weather.current.temperature),
          condition: weather.current.weather_description,
          humidity: weather.current.humidity,
          rainfall: weather.current.precipitation || 0,
          icon: weather.current.weather_icon
        });
      } else {
        // Default to Nairobi if no location set
        const defaultLat = -1.286389;
        const defaultLng = 36.817223;
        const weather = await WeatherAPIService.getCurrentWeather(defaultLat, defaultLng);
        setWeatherData({
          temperature: Math.round(weather.current.temperature),
          condition: weather.current.weather_description,
          humidity: weather.current.humidity,
          rainfall: weather.current.precipitation || 0,
          icon: weather.current.weather_icon
        });
      }
    } catch (error) {
      console.error('Error loading weather data:', error);
      // Fallback to dummy data
      setWeatherData(currentWeather);
    } finally {
      setLoadingWeather(false);
    }
  };

  const loadHistoricalData = async () => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      if (userLocation) {
        const historical = await WeatherAPIService.getHistoricalWeather(
          userLocation.latitude, 
          userLocation.longitude, 
          startDate, 
          endDate
        );
        setHistoricalData(historical.daily.map((day: any) => ({
          date: day.date,
          temperature: Math.round(day.temperature_avg),
          humidity: Math.round(day.humidity_avg),
          rainfall: day.precipitation_sum
        })));
      } else {
        // Default to Nairobi
        const defaultLat = -1.286389;
        const defaultLng = 36.817223;
        const historical = await WeatherAPIService.getHistoricalWeather(
          defaultLat, 
          defaultLng, 
          startDate, 
          endDate
        );
        setHistoricalData(historical.daily.map((day: any) => ({
          date: day.date,
          temperature: Math.round(day.temperature_avg),
          humidity: Math.round(day.humidity_avg),
          rainfall: day.precipitation_sum
        })));
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
      // Fallback to dummy data
      setHistoricalData(historicalWeatherData);
    }
  };

  const loadForecastData = async () => {
    try {
      if (userLocation) {
        const forecast = await WeatherAPIService.getWeatherForecast(
          userLocation.latitude, 
          userLocation.longitude, 
          7
        );
        setForecastData(forecast.forecast.map((day: any) => ({
          date: day.date,
          temperature: Math.round((day.temperature_max + day.temperature_min) / 2),
          temperature_max: Math.round(day.temperature_max),
          temperature_min: Math.round(day.temperature_min),
          humidity: 70, // Default since not provided in daily forecast
          rainfall: day.precipitation_sum,
          condition: day.weather_description,
          icon: day.weather_icon,
          precipitation_probability: day.precipitation_probability,
          wind_speed: Math.round(day.wind_speed_max),
          uv_index: day.uv_index_max
        })));
      } else {
        // Default to Nairobi
        const defaultLat = -1.286389;
        const defaultLng = 36.817223;
        const forecast = await WeatherAPIService.getWeatherForecast(
          defaultLat, 
          defaultLng, 
          7
        );
        setForecastData(forecast.forecast.map((day: any) => ({
          date: day.date,
          temperature: Math.round((day.temperature_max + day.temperature_min) / 2),
          temperature_max: Math.round(day.temperature_max),
          temperature_min: Math.round(day.temperature_min),
          humidity: 70,
          rainfall: day.precipitation_sum,
          condition: day.weather_description,
          icon: day.weather_icon,
          precipitation_probability: day.precipitation_probability,
          wind_speed: Math.round(day.wind_speed_max),
          uv_index: day.uv_index_max
        })));
      }
    } catch (error) {
      console.error('Error loading forecast data:', error);
      // Fallback to dummy data
      setForecastData([
        { date: '2025-01-08', temperature: 26, humidity: 72, rainfall: 1.2, condition: 'Sunny', icon: '☀️' },
        { date: '2025-01-09', temperature: 24, humidity: 75, rainfall: 3.5, condition: 'Rainy', icon: '🌧️' },
        { date: '2025-01-10', temperature: 28, humidity: 65, rainfall: 0, condition: 'Clear', icon: '☀️' }
      ]);
    }
  };

  // Get agricultural weather analysis
  const getAgriculturalAnalysis = async (cropType?: string) => {
    try {
      if (userLocation) {
        const analysis = await WeatherAPIService.getAgriculturalWeatherAnalysis(
          userLocation.latitude, 
          userLocation.longitude, 
          cropType
        );
        return analysis.insights;
      } else {
        // Default to Nairobi
        const defaultLat = -1.286389;
        const defaultLng = 36.817223;
        const analysis = await WeatherAPIService.getAgriculturalWeatherAnalysis(
          defaultLat, 
          defaultLng, 
          cropType
        );
        return analysis.insights;
      }
    } catch (error) {
      console.error('Error getting agricultural analysis:', error);
      return {
        irrigation: ['Unable to fetch irrigation recommendations'],
        planting: ['Unable to fetch planting recommendations'],
        harvesting: ['Unable to fetch harvesting recommendations'],
        pest_disease: ['Unable to fetch pest/disease alerts'],
        general: ['Weather analysis temporarily unavailable']
      };
    }
  };

  // Geolocation functionality
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.permissions.query({name: 'geolocation'}).then((result) => {
        setLocationPermission(result.state as 'granted' | 'denied' | 'prompt');
      });
    }
  }, []);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Simulate reverse geocoding (in real app, use Google Maps API or similar)
        try {
          const locationName = await reverseGeocode(latitude, longitude);
          setUserLocation({ latitude, longitude, name: locationName });
          setLocationPermission('granted');
        } catch (error) {
          console.error('Error getting location name:', error);
          setUserLocation({ 
            latitude, 
            longitude, 
            name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
          });
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        setIsLoadingLocation(false);
        alert('Unable to retrieve your location. Please check your browser settings.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  // Reverse geocoding using Open-Meteo API
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const locationName = await WeatherAPIService.getLocationName(lat, lng);
      return locationName;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback to coordinates
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // AI Weather Predictions Data
  const aiPredictions = {
    daily: [
      {
        date: 'Tomorrow',
        temperature: { min: 18, max: 28, confidence: 94 },
        rainfall: { probability: 15, amount: 0.2, confidence: 89 },
        humidity: { value: 72, confidence: 91 },
        recommendation: 'Ideal conditions for outdoor farming activities',
        risk: 'low'
      },
      {
        date: 'Day 2',
        temperature: { min: 20, max: 26, confidence: 91 },
        rainfall: { probability: 45, amount: 3.5, confidence: 86 },
        humidity: { value: 78, confidence: 88 },
        recommendation: 'Light rain expected - check irrigation schedules',
        risk: 'medium'
      },
      {
        date: 'Day 3',
        temperature: { min: 19, max: 25, confidence: 87 },
        rainfall: { probability: 70, amount: 8.2, confidence: 82 },
        humidity: { value: 85, confidence: 85 },
        recommendation: 'Heavy rain likely - ensure proper drainage',
        risk: 'high'
      }
    ],
    weekly: [
      {
        period: 'Week 1',
        avgTemp: { min: 19, max: 27, confidence: 89 },
        totalRainfall: { amount: 25.5, confidence: 84 },
        avgHumidity: { value: 75, confidence: 87 },
        recommendation: 'Moderate rainfall expected - optimal for most crops',
        patterns: ['Sunny mornings', 'Afternoon showers', 'Cool evenings']
      },
      {
        period: 'Week 2',
        avgTemp: { min: 21, max: 29, confidence: 85 },
        totalRainfall: { amount: 12.3, confidence: 79 },
        avgHumidity: { value: 68, confidence: 82 },
        recommendation: 'Drier conditions - increase irrigation frequency',
        patterns: ['Clear skies', 'Low humidity', 'Warmer temperatures']
      },
      {
        period: 'Week 3',
        avgTemp: { min: 18, max: 26, confidence: 78 },
        totalRainfall: { amount: 35.8, confidence: 75 },
        avgHumidity: { value: 82, confidence: 80 },
        recommendation: 'Heavy rainfall period - monitor for flooding',
        patterns: ['Overcast conditions', 'Frequent rain', 'High humidity']
      }
    ],
    monthly: [
      {
        month: 'This Month',
        avgTemp: { min: 19, max: 27, confidence: 82 },
        totalRainfall: { amount: 125.5, confidence: 78 },
        avgHumidity: { value: 74, confidence: 81 },
        recommendation: 'Favorable growing conditions overall',
        trends: ['Temperature stability', 'Regular rainfall', 'Moderate humidity'],
        cropSuitability: ['Maize: Excellent', 'Tomatoes: Good', 'Beans: Excellent']
      },
      {
        month: 'Next Month',
        avgTemp: { min: 21, max: 30, confidence: 75 },
        totalRainfall: { amount: 85.2, confidence: 72 },
        avgHumidity: { value: 69, confidence: 76 },
        recommendation: 'Warmer and drier - adjust irrigation plans',
        trends: ['Rising temperatures', 'Decreasing rainfall', 'Lower humidity'],
        cropSuitability: ['Maize: Good', 'Tomatoes: Excellent', 'Beans: Moderate']
      },
      {
        month: 'Month 3',
        avgTemp: { min: 17, max: 25, confidence: 68 },
        totalRainfall: { amount: 180.3, confidence: 65 },
        avgHumidity: { value: 81, confidence: 71 },
        recommendation: 'Wet season approaching - prepare drainage systems',
        trends: ['Cooling temperatures', 'Increasing rainfall', 'Higher humidity'],
        cropSuitability: ['Maize: Moderate', 'Tomatoes: Poor', 'Beans: Good']
      }
    ]
  };

  const getCurrentPredictions = () => {
    return aiPredictions[aiPredictionTimeframe];
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-blue-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const locations = [
    { value: 'nairobi', label: 'Nairobi, Kenya', coords: '-1.2921°, 36.8219°' },
    { value: 'mombasa', label: 'Mombasa, Kenya', coords: '-4.0435°, 39.6682°' },
    { value: 'kisumu', label: 'Kisumu, Kenya', coords: '-0.0917°, 34.7680°' },
    { value: 'nakuru', label: 'Nakuru, Kenya', coords: '-0.3031°, 36.0800°' }
  ];

  const currentLocationData = locations.find(loc => loc.value === selectedLocation);

  const temperatureData = historicalData.map(data => ({
    date: new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    temperature: data.temperature
  }));

  const weeklyForecast = [
    { day: 'Mon', temp: 26, condition: '☀️', humidity: 65, rainfall: 0 },
    { day: 'Tue', temp: 24, condition: '⛅', humidity: 70, rainfall: 1.2 },
    { day: 'Wed', temp: 28, condition: '☀️', humidity: 58, rainfall: 0 },
    { day: 'Thu', temp: 25, condition: '🌧️', humidity: 80, rainfall: 8.5 },
    { day: 'Fri', temp: 23, condition: '⛅', humidity: 72, rainfall: 2.1 },
    { day: 'Sat', temp: 27, condition: '☀️', humidity: 62, rainfall: 0 },
    { day: 'Sun', temp: 29, condition: '☀️', humidity: 55, rainfall: 0 },
  ];

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Weather & AI Farming</h1>
          <p className="text-gray-600 text-sm sm:text-base">Monitor weather conditions and analyze historical data</p>
        </div>

        <Tabs defaultValue="crops" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-max">
              <TabsTrigger value="crops" className="text-xs sm:text-sm px-2 sm:px-4">Crops</TabsTrigger>
              <TabsTrigger value="current" className="text-xs sm:text-sm px-2 sm:px-4">Current</TabsTrigger>
              <TabsTrigger value="forecast" className="text-xs sm:text-sm px-2 sm:px-4">Weather & GPS</TabsTrigger>
              <TabsTrigger value="ai-predictions" className="text-xs sm:text-sm px-2 sm:px-4">AI Predictions</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 sm:px-4">Analytics</TabsTrigger>
            </TabsList>
          </div>

          {/* Crop Management Tab */}
          <TabsContent value="crops" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-1 gap-4 sm:gap-6">
              {/* Crop Management */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Sprout className="w-5 h-5" />
                    <span>Crop Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {dummyCrops.slice(0, 3).map((crop) => (
                    <div key={crop.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{crop.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">{crop.type} - {crop.variety}</p>
                        </div>
                        <Badge 
                          variant={crop.health > 80 ? 'default' : crop.health > 60 ? 'secondary' : 'destructive'}
                          className="text-xs shrink-0 ml-2"
                        >
                          {crop.health}%
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <p className="text-gray-500">Stage</p>
                          <p className="font-medium">{crop.stage}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Progress</p>
                          <p className="font-medium">{crop.progress}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Location</p>
                          <p className="font-medium truncate">{crop.location}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Area</p>
                          <p className="font-medium">{crop.area} ha</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Growth Progress</span>
                          <span>{crop.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all" 
                            style={{ width: `${crop.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Integrated Weather and Crop Recommendations */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Activity className="w-5 h-5" />
                  <span>Weather-Based Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Irrigation Alert</h4>
                    <p className="text-xs sm:text-sm text-blue-800 mb-3">
                      Low soil moisture detected in North Field. Consider irrigation in next 24 hours.
                    </p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs w-full sm:w-auto">
                      Schedule Irrigation
                    </Button>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-yellow-900 mb-2 text-sm sm:text-base">Weather Warning</h4>
                    <p className="text-xs sm:text-sm text-yellow-800 mb-3">
                      Heavy rainfall expected tomorrow. Check drainage systems and protect crops.
                    </p>
                    <Button size="sm" variant="outline" className="text-xs w-full sm:w-auto">
                      View Details
                    </Button>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 md:col-span-2 lg:col-span-1">
                    <h4 className="font-medium text-green-900 mb-2 text-sm sm:text-base">Optimal Conditions</h4>
                    <p className="text-xs sm:text-sm text-green-800 mb-3">
                      Perfect weather for tomato cultivation. Consider expanding operations.
                    </p>
                    <Button size="sm" variant="outline" className="text-xs w-full sm:w-auto">
                      Learn More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="current" className="space-y-6">
            {/* Current Weather Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cloud className="w-5 h-5" />
                    <span>Current Conditions</span>
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{userLocation ? userLocation.name : 'Nairobi, Kenya'}</span>
                      {userLocation && (
                        <Badge variant="outline">GPS: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</Badge>
                      )}
                      {!userLocation && (
                        <Badge variant="outline">GPS: -1.2921°, 36.8219°</Badge>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={requestLocation}
                      disabled={isLoadingLocation}
                      className="flex items-center space-x-1"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{isLoadingLocation ? 'Getting Location...' : 'Use My Location'}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-4">
                      <span className="text-6xl">{weatherData.icon}</span>
                      <div>
                        <p className="text-4xl font-bold text-gray-900">{weatherData.temperature}°C</p>
                        <p className="text-gray-600 text-lg">{weatherData.condition}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 flex-1">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Droplets className="w-5 h-5 text-blue-500" />
                          <span className="text-sm text-gray-600">Humidity</span>
                        </div>
                        <p className="text-2xl font-semibold">{weatherData.humidity}%</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Droplets className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-600">Rainfall</span>
                        </div>
                        <p className="text-2xl font-semibold">{weatherData.rainfall}mm</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Wind className="w-5 h-5 text-gray-500" />
                          <span className="text-sm text-gray-600">Wind Speed</span>
                        </div>
                        <p className="text-2xl font-semibold">12 km/h</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Sun className="w-5 h-5 text-yellow-500" />
                          <span className="text-sm text-gray-600">UV Index</span>
                        </div>
                        <p className="text-2xl font-semibold">6 (High)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>


            </div>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            {/* Location Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Location Selection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Location</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.value} value={location.value}>
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Current Location Details</h4>
                    <p className="text-sm text-gray-600 mb-1">{currentLocationData?.label}</p>
                    <p className="text-sm text-gray-600">GPS: {currentLocationData?.coords}</p>
                    <Button size="sm" variant="outline" className="mt-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      Use Current Location
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>7-Day Weather Forecast</span>
                </CardTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>Location: {currentLocationData?.label} (GPS: {currentLocationData?.coords})</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {weeklyForecast.map((day, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="font-medium text-gray-900 mb-2">{day.day}</p>
                      <div className="text-3xl mb-2">{day.condition}</div>
                      <p className="text-xl font-bold text-gray-900 mb-2">{day.temp}°C</p>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center justify-center space-x-1">
                          <Droplets className="w-3 h-3" />
                          <span>{day.humidity}%</span>
                        </div>
                        <div className="flex items-center justify-center space-x-1">
                          <Cloud className="w-3 h-3" />
                          <span>{day.rainfall}mm</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced GPS and Location Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>GPS & Weather Station Network</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Geographical Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium">{currentLocationData?.label}</p>
                      <p className="text-sm text-gray-600">Coordinates: {currentLocationData?.coords}</p>
                      <p className="text-sm text-gray-600">Elevation: 1,795m</p>
                      <p className="text-sm text-gray-600">Time Zone: EAT (UTC+3)</p>
                      <p className="text-sm text-gray-600">Climate Zone: Tropical Highland</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Regional Weather Stations</h4>
                    <div className="space-y-2">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">JKIA Weather Station</span>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Distance: 12 km | Reliability: 98%</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Wilson Airport</span>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Distance: 8 km | Reliability: 95%</p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Nairobi University</span>
                          <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Distance: 15 km | Reliability: 87%</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">Weather Data Sources</h5>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• Meteorological stations: 3 active</p>
                        <p>• Satellite data: Updated hourly</p>
                        <p>• Crowd-sourced data: 47 contributors</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Predictions Tab */}
          <TabsContent value="ai-predictions" className="space-y-6">
            {/* AI Predictions Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>AI Weather Predictions</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Advanced machine learning models predict weather patterns using historical data, satellite imagery, 
                  and IoT sensor networks to provide accurate farming insights.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Prediction Timeframe:</span>
                    <Select value={aiPredictionTimeframe} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setAiPredictionTimeframe(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily (3 Days)</SelectItem>
                        <SelectItem value="weekly">Weekly (3 Weeks)</SelectItem>
                        <SelectItem value="monthly">Monthly (3 Months)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span>AI Model: WeatherNet v3.2</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Target className="w-4 h-4 text-green-500" />
                    <span>Accuracy: 89.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Predictions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {getCurrentPredictions().map((prediction: any, index: number) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {aiPredictionTimeframe === 'daily' ? prediction.date : 
                         aiPredictionTimeframe === 'weekly' ? prediction.period : 
                         prediction.month}
                      </CardTitle>
                      {aiPredictionTimeframe === 'daily' && prediction.risk && (
                        <Badge className={getRiskColor(prediction.risk)}>
                          {prediction.risk} risk
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Temperature Prediction */}
                    <div className="bg-red-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Thermometer className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium">Temperature</span>
                        </div>
                        <span className={`text-xs font-medium ${getConfidenceColor(
                          aiPredictionTimeframe === 'daily' ? prediction.temperature.confidence :
                          aiPredictionTimeframe === 'weekly' ? prediction.avgTemp.confidence :
                          prediction.avgTemp.confidence
                        )}`}>
                          {aiPredictionTimeframe === 'daily' ? prediction.temperature.confidence :
                           aiPredictionTimeframe === 'weekly' ? prediction.avgTemp.confidence :
                           prediction.avgTemp.confidence}% confidence
                        </span>
                      </div>
                      <p className="text-lg font-bold text-red-700">
                        {aiPredictionTimeframe === 'daily' ? 
                          `${prediction.temperature.min}°C - ${prediction.temperature.max}°C` :
                         aiPredictionTimeframe === 'weekly' ?
                          `${prediction.avgTemp.min}°C - ${prediction.avgTemp.max}°C avg` :
                          `${prediction.avgTemp.min}°C - ${prediction.avgTemp.max}°C avg`
                        }
                      </p>
                    </div>

                    {/* Rainfall Prediction */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">Rainfall</span>
                        </div>
                        <span className={`text-xs font-medium ${getConfidenceColor(
                          aiPredictionTimeframe === 'daily' ? prediction.rainfall.confidence :
                          aiPredictionTimeframe === 'weekly' ? prediction.totalRainfall.confidence :
                          prediction.totalRainfall.confidence
                        )}`}>
                          {aiPredictionTimeframe === 'daily' ? prediction.rainfall.confidence :
                           aiPredictionTimeframe === 'weekly' ? prediction.totalRainfall.confidence :
                           prediction.totalRainfall.confidence}% confidence
                        </span>
                      </div>
                      {aiPredictionTimeframe === 'daily' ? (
                        <>
                          <p className="text-lg font-bold text-blue-700">{prediction.rainfall.probability}% chance</p>
                          <p className="text-sm text-blue-600">Expected: {prediction.rainfall.amount}mm</p>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-blue-700">
                          {aiPredictionTimeframe === 'weekly' ? prediction.totalRainfall.amount : prediction.totalRainfall.amount}mm total
                        </p>
                      )}
                    </div>

                    {/* Humidity Prediction */}
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Wind className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">Humidity</span>
                        </div>
                        <span className={`text-xs font-medium ${getConfidenceColor(
                          aiPredictionTimeframe === 'daily' ? prediction.humidity.confidence :
                          aiPredictionTimeframe === 'weekly' ? prediction.avgHumidity.confidence :
                          prediction.avgHumidity.confidence
                        )}`}>
                          {aiPredictionTimeframe === 'daily' ? prediction.humidity.confidence :
                           aiPredictionTimeframe === 'weekly' ? prediction.avgHumidity.confidence :
                           prediction.avgHumidity.confidence}% confidence
                        </span>
                      </div>
                      <p className="text-lg font-bold text-green-700">
                        {aiPredictionTimeframe === 'daily' ? prediction.humidity.value :
                         aiPredictionTimeframe === 'weekly' ? prediction.avgHumidity.value :
                         prediction.avgHumidity.value}% avg
                      </p>
                    </div>

                    {/* AI Recommendation */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">AI Recommendation</span>
                      </div>
                      <p className="text-sm text-purple-800">{prediction.recommendation}</p>
                    </div>

                    {/* Additional Info for Weekly/Monthly */}
                    {aiPredictionTimeframe === 'weekly' && prediction.patterns && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">Expected Patterns:</h5>
                        <div className="grid grid-cols-1 gap-1">
                          {prediction.patterns.map((pattern: string, idx: number) => (
                            <div key={idx} className="flex items-center space-x-2 text-xs text-gray-600">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span>{pattern}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiPredictionTimeframe === 'monthly' && prediction.trends && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">Climate Trends:</h5>
                        <div className="grid grid-cols-1 gap-1">
                          {prediction.trends.map((trend: string, idx: number) => (
                            <div key={idx} className="flex items-center space-x-2 text-xs text-gray-600">
                              <TrendingUp className="w-3 h-3 text-blue-500" />
                              <span>{trend}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <h6 className="text-xs font-medium text-gray-700 mb-1">Crop Suitability:</h6>
                          {prediction.cropSuitability.map((crop: string, idx: number) => (
                            <div key={idx} className="text-xs text-gray-600">{crop}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Model Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  <span>AI Model Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">89.5%</div>
                    <div className="text-sm text-gray-600">Overall Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">94.2%</div>
                    <div className="text-sm text-gray-600">Rainfall Prediction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">91.8%</div>
                    <div className="text-sm text-gray-600">Temperature Forecast</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">87.3%</div>
                    <div className="text-sm text-gray-600">Humidity Prediction</div>
                  </div>
                </div>
                
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Data Sources & Training:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p>• 5+ years of historical weather data</p>
                      <p>• Real-time IoT sensor networks</p>
                      <p>• Satellite imagery and radar data</p>
                    </div>
                    <div>
                      <p>• Global climate models integration</p>
                      <p>• Local microclimate considerations</p>
                      <p>• Continuous learning from farmer feedback</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Time Period Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Historical Data Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Select defaultValue="7days">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="3months">Last 3 Months</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select defaultValue="temperature">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="humidity">Humidity</SelectItem>
                      <SelectItem value="rainfall">Rainfall</SelectItem>
                      <SelectItem value="all">All Metrics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Temperature Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Temperature Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-48 bg-gray-50 rounded-lg p-4 flex items-end justify-between">
                      {temperatureData.map((data, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2">
                          <div className="text-xs font-medium">{data.temperature}°C</div>
                          <div 
                            className="w-6 bg-gradient-to-t from-blue-400 to-red-400 rounded-t"
                            style={{ height: `${(data.temperature / 30) * 120}px` }}
                          ></div>
                          <div className="text-xs text-gray-600">{data.date}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500">Min Temp</p>
                        <p className="font-semibold text-blue-600">
                          {Math.min(...historicalWeatherData.map(d => d.temperature))}°C
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Avg Temp</p>
                        <p className="font-semibold">
                          {Math.round(historicalWeatherData.reduce((sum, data) => sum + data.temperature, 0) / historicalWeatherData.length)}°C
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Max Temp</p>
                        <p className="font-semibold text-red-600">
                          {Math.max(...historicalWeatherData.map(d => d.temperature))}°C
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rainfall Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Droplets className="w-5 h-5" />
                    <span>Rainfall Patterns</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-48 bg-gray-50 rounded-lg p-4 flex items-end justify-between">
                      {historicalWeatherData.map((data, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2">
                          <div className="text-xs font-medium">{data.rainfall}mm</div>
                          <div 
                            className="w-6 bg-blue-500 rounded-t"
                            style={{ height: `${(data.rainfall / 5) * 120}px` }}
                          ></div>
                          <div className="text-xs text-gray-600">
                            {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500">Total Rainfall</p>
                        <p className="font-semibold text-blue-600">
                          {historicalWeatherData.reduce((sum, data) => sum + data.rainfall, 0).toFixed(1)}mm
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Rainy Days</p>
                        <p className="font-semibold">
                          {historicalWeatherData.filter(d => d.rainfall > 0).length} days
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comprehensive Historical Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Historical Weather Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 flex items-center space-x-2">
                      <Thermometer className="w-4 h-4" />
                      <span>Temperature</span>
                    </h5>
                    <p className="text-2xl font-bold text-blue-900">
                      {Math.round(historicalWeatherData.reduce((sum, data) => sum + data.temperature, 0) / historicalWeatherData.length)}°C
                    </p>
                    <p className="text-sm text-blue-700">Average (7 days)</p>
                    <div className="mt-2 text-xs text-blue-600">
                      <p>Range: {Math.min(...historicalWeatherData.map(d => d.temperature))}°C - {Math.max(...historicalWeatherData.map(d => d.temperature))}°C</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <h5 className="font-medium text-green-900 flex items-center space-x-2">
                      <Droplets className="w-4 h-4" />
                      <span>Rainfall</span>
                    </h5>
                    <p className="text-2xl font-bold text-green-900">
                      {historicalWeatherData.reduce((sum, data) => sum + data.rainfall, 0).toFixed(1)}mm
                    </p>
                    <p className="text-sm text-green-700">Total (7 days)</p>
                    <div className="mt-2 text-xs text-green-600">
                      <p>Rainy days: {historicalWeatherData.filter(d => d.rainfall > 0).length}</p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-900 flex items-center space-x-2">
                      <Droplets className="w-4 h-4" />
                      <span>Humidity</span>
                    </h5>
                    <p className="text-2xl font-bold text-yellow-900">
                      {Math.round(historicalWeatherData.reduce((sum, data) => sum + data.humidity, 0) / historicalWeatherData.length)}%
                    </p>
                    <p className="text-sm text-yellow-700">Average (7 days)</p>
                    <div className="mt-2 text-xs text-yellow-600">
                      <p>Range: {Math.min(...historicalWeatherData.map(d => d.humidity))}% - {Math.max(...historicalWeatherData.map(d => d.humidity))}%</p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h5 className="font-medium text-purple-900 flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Trends</span>
                    </h5>
                    <p className="text-lg font-bold text-purple-900">Stable</p>
                    <p className="text-sm text-purple-700">Weather Pattern</p>
                    <div className="mt-2 text-xs text-purple-600">
                      <p>Variation: Low</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historical Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Historical Comparison & Forecasting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Year-over-Year Comparison</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <span className="text-sm">Average Temperature</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">24.3°C</span>
                          <Badge className="bg-green-100 text-green-800">+1.2°C</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <span className="text-sm">Total Rainfall</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">128.5mm</span>
                          <Badge className="bg-blue-100 text-blue-800">-15.3mm</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <span className="text-sm">Average Humidity</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">66.2%</span>
                          <Badge className="bg-yellow-100 text-yellow-800">+2.1%</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Agricultural Insights</h4>
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-green-900">Optimal Planting</h5>
                        <p className="text-xs text-green-800 mt-1">
                          Current conditions are ideal for maize planting. Historical data shows 85% success rate.
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-blue-900">Irrigation Planning</h5>
                        <p className="text-xs text-blue-800 mt-1">
                          Rainfall patterns suggest supplemental irrigation needed in 2 weeks.
                        </p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-orange-900">Pest Risk</h5>
                        <p className="text-xs text-orange-800 mt-1">
                          High humidity levels may increase fungal disease risk. Monitor crops closely.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}