/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Import Ghana-specific services
import ghanaWeatherService, { GhanaWeatherData } from '@/services/ghana-weather';
import ghanaLocationService from '@/services/ghana-location';
import openWeatherService, { ProcessedWeatherData, WeatherRecommendation } from '@/services/openweather-api';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService } from '@/services/local-storage';
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
  CheckCircle,
  Navigation,
  Eye,
  Gauge,
  CloudRain,
  CloudSnow,
  Sunrise,
  Sunset
} from 'lucide-react';

// Ghana dummy data for fallback
const ghanaHistoricalWeatherData = [
  { date: '2025-01-01', temperature: 28, humidity: 72, rainfall: 0 },
  { date: '2025-01-02', temperature: 30, humidity: 68, rainfall: 2.5 },
  { date: '2025-01-03', temperature: 26, humidity: 80, rainfall: 15.2 },
  { date: '2025-01-04', temperature: 29, humidity: 70, rainfall: 0 },
  { date: '2025-01-05', temperature: 31, humidity: 65, rainfall: 0 },
  { date: '2025-01-06', temperature: 27, humidity: 78, rainfall: 8.1 },
  { date: '2025-01-07', temperature: 28, humidity: 73, rainfall: 1.2 }
];

const ghanaCurrentWeather = {
  temperature: 28,
  condition: 'Partly Cloudy',
  humidity: 75,
  rainfall: 0,
  icon: '⛅'
};

const ghanaCrops = [
  { 
    id: 1, 
    name: 'Cocoa Plantation', 
    type: 'Tree Crop', 
    variety: 'Trinitario',
    stage: 'Mature',
    progress: 85,
    health: 92,
    location: 'Ashanti Region',
    area: 5.2
  },
  { 
    id: 2, 
    name: 'Maize Field', 
    type: 'Cereal', 
    variety: 'Obatanpa',
    stage: 'Flowering',
    progress: 65,
    health: 88,
    location: 'Northern Region',
    area: 3.8
  },
  { 
    id: 3, 
    name: 'Cassava Farm', 
    type: 'Root Crop', 
    variety: 'Bankye Hemaa',
    stage: 'Growing',
    progress: 45,
    health: 85,
    location: 'Volta Region',
    area: 4.1
  }
];

export default function WeatherPage() {
  const { profile, user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState('accra');
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number, name: string} | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [aiPredictionTimeframe, setAiPredictionTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // State for Ghana weather data
  const [weatherData, setWeatherData] = useState(ghanaCurrentWeather);
  const [historicalData, setHistoricalData] = useState(ghanaHistoricalWeatherData);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(false);
  
  // State for real-time OpenWeather data
  const [realTimeWeather, setRealTimeWeather] = useState<ProcessedWeatherData | null>(null);
  const [weatherRecommendations, setWeatherRecommendations] = useState<WeatherRecommendation[]>([]);
  const [loadingRealTime, setLoadingRealTime] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Accra');

  // Track navigation to weather page
  useEffect(() => {
    if (user?.id) {
      localStorageService.recordNavigation(user.id, 'weather');
    }
  }, [user]);

  // Ghana locations
  const ghanaLocations = [
    { value: 'accra', label: 'Accra', coords: '5.6037°N, 0.1870°W' },
    { value: 'kumasi', label: 'Kumasi', coords: '6.6885°N, 1.6244°W' },
    { value: 'tamale', label: 'Tamale', coords: '9.4008°N, 0.8393°W' },
    { value: 'cape_coast', label: 'Cape Coast', coords: '5.1053°N, 1.2466°W' },
    { value: 'ho', label: 'Ho', coords: '6.6110°N, 0.4708°E' },
    { value: 'wa', label: 'Wa', coords: '10.0602°N, 2.5057°W' },
    { value: 'bolgatanga', label: 'Bolgatanga', coords: '10.7856°N, 0.8515°W' },
    { value: 'sunyani', label: 'Sunyani', coords: '7.3386°N, 2.3267°W' }
  ];

  const getLocationCoordinates = (locationValue: string) => {
    const locations = {
      'accra': { lat: 5.6037, lng: -0.1870, name: 'Accra' },
      'kumasi': { lat: 6.6885, lng: -1.6244, name: 'Kumasi' },
      'tamale': { lat: 9.4008, lng: -0.8393, name: 'Tamale' },
      'cape_coast': { lat: 5.1053, lng: -1.2466, name: 'Cape Coast' },
      'ho': { lat: 6.6110, lng: 0.4708, name: 'Ho' },
      'wa': { lat: 10.0602, lng: -2.5057, name: 'Wa' },
      'bolgatanga': { lat: 10.7856, lng: -0.8515, name: 'Bolgatanga' },
      'sunyani': { lat: 7.3386, lng: -2.3267, name: 'Sunyani' }
    };
    return locations[locationValue as keyof typeof locations] || locations['accra'];
  };

  // Load weather data on component mount and location change
  useEffect(() => {
    loadWeatherData();
    loadHistoricalData();
    loadForecastData();
  }, [userLocation, selectedLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Try to use profile location if available
  useEffect(() => {
    if (profile?.latitude && profile?.longitude) {
      setUserLocation({
        latitude: profile.latitude,
        longitude: profile.longitude,
        name: profile.region || 'Ghana'
      });
    }
  }, [profile]);

  // Load real-time weather data
  const loadRealTimeWeather = async () => {
    setLoadingRealTime(true);
    try {
      let weatherData: ProcessedWeatherData;
      
      if (userLocation) {
        // Use GPS coordinates if available
        weatherData = await openWeatherService.getCurrentWeather(
          userLocation.latitude, 
          userLocation.longitude
        );
      } else {
        // Use selected city
        weatherData = await openWeatherService.getCurrentWeatherByCity(selectedCity, 'GH');
      }
      
      setRealTimeWeather(weatherData);
      setWeatherRecommendations(weatherData.recommendations);
    } catch (error) {
      console.error('Error loading real-time weather:', error);
      // Fallback to dummy data
      setRealTimeWeather(null);
    } finally {
      setLoadingRealTime(false);
    }
  };

  // Load real-time weather on component mount and when location changes
  useEffect(() => {
    loadRealTimeWeather();
  }, [userLocation, selectedCity]); // eslint-disable-line react-hooks/exhaustive-deps

  // API Functions using Ghana Weather Service
  const loadWeatherData = async () => {
    setLoadingWeather(true);
    try {
      let lat, lng, locationName;
      
      if (userLocation) {
        lat = userLocation.latitude;
        lng = userLocation.longitude;
        locationName = userLocation.name;
      } else {
        const location = getLocationCoordinates(selectedLocation);
        lat = location.lat;
        lng = location.lng;
        locationName = location.name;
      }

      const weather = await ghanaWeatherService.getCurrentWeather(lat, lng);
      if (weather) {
        const weatherResult = {
          temperature: weather.temperature,
          condition: weather.description || 'Partly Cloudy',
          humidity: weather.humidity,
          rainfall: weather.rainfall || 0,
          icon: weather.description?.includes('rain') ? '🌧️' : 
                weather.description?.includes('cloud') ? '⛅' : 
                weather.description?.includes('sun') ? '☀️' : '🌤️'
        };
        
        setWeatherData(weatherResult);
        
        // Track weather check activity
        if (user?.id) {
          localStorageService.recordActivity(user.id, {
            type: 'weather_check',
            data: {
              location: locationName,
              temperature: weather.temperature,
              condition: weather.description,
              timestamp: new Date().toISOString()
            }
          });
        }
      }
    } catch (error) {
      console.error('Error loading weather data:', error);
      setWeatherData(ghanaCurrentWeather);
    } finally {
      setLoadingWeather(false);
    }
  };

  const loadHistoricalData = async () => {
    try {
      // Use dummy data for now since historical API might not be available
      setHistoricalData(ghanaHistoricalWeatherData);
    } catch (error) {
      console.error('Error loading historical data:', error);
      setHistoricalData(ghanaHistoricalWeatherData);
    }
  };

  const loadForecastData = async () => {
    try {
      // Use dummy forecast data for Ghana climate
      setForecastData([
        { date: '2025-01-08', temperature: 29, humidity: 72, rainfall: 0, condition: 'Sunny', icon: '☀️' },
        { date: '2025-01-09', temperature: 27, humidity: 78, rainfall: 12.5, condition: 'Thunderstorms', icon: '⛈️' },
        { date: '2025-01-10', temperature: 31, humidity: 65, rainfall: 0, condition: 'Clear', icon: '☀️' },
        { date: '2025-01-11', temperature: 28, humidity: 73, rainfall: 5.2, condition: 'Rain Showers', icon: '🌦️' },
        { date: '2025-01-12', temperature: 30, humidity: 68, rainfall: 0, condition: 'Partly Cloudy', icon: '⛅' },
        { date: '2025-01-13', temperature: 26, humidity: 85, rainfall: 18.3, condition: 'Heavy Rain', icon: '🌧️' },
        { date: '2025-01-14', temperature: 32, humidity: 60, rainfall: 0, condition: 'Sunny', icon: '☀️' }
      ]);
    } catch (error) {
      console.error('Error loading forecast data:', error);
      setForecastData([
        { date: '2025-01-08', temperature: 29, humidity: 72, rainfall: 0, condition: 'Sunny', icon: '☀️' }
      ]);
    }
  };

  // Geolocation functionality for Ghana
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
        
        // Check if location is within Ghana bounds
        if (latitude >= 4.5 && latitude <= 11.5 && longitude >= -3.5 && longitude <= 1.5) {
          setUserLocation({ 
            latitude, 
            longitude, 
            name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
          });
          setLocationPermission('granted');
        } else {
          alert('Location detected outside Ghana. Using Accra as default.');
          const accraLocation = getLocationCoordinates('accra');
          setUserLocation({ 
            latitude: accraLocation.lat, 
            longitude: accraLocation.lng, 
            name: 'Accra (Default)' 
          });
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        setIsLoadingLocation(false);
        alert('Unable to retrieve your location. Using Accra as default.');
        const accraLocation = getLocationCoordinates('accra');
        setUserLocation({ 
          latitude: accraLocation.lat, 
          longitude: accraLocation.lng, 
          name: 'Accra (Default)' 
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  // Rest of your component code remains the same, but update the locations array reference
  const currentLocationData = ghanaLocations.find(loc => loc.value === selectedLocation);

  const temperatureData = historicalData.map(data => ({
    date: new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    temperature: data.temperature
  }));

  // Update weekly forecast to use Ghana data
  const weeklyForecast = forecastData.length > 0 ? forecastData.slice(0, 7).map((day, index) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
    temp: day.temperature,
    condition: day.icon,
    humidity: day.humidity,
    rainfall: day.rainfall
  })) : [
    { day: 'Mon', temp: 29, condition: '☀️', humidity: 68, rainfall: 0 },
    { day: 'Tue', temp: 27, condition: '⛅', humidity: 75, rainfall: 2.1 },
    { day: 'Wed', temp: 31, condition: '☀️', humidity: 62, rainfall: 0 },
    { day: 'Thu', temp: 26, condition: '⛈️', humidity: 85, rainfall: 18.5 },
    { day: 'Fri', temp: 28, condition: '🌦️', humidity: 78, rainfall: 5.2 },
    { day: 'Sat', temp: 30, condition: '☀️', humidity: 65, rainfall: 0 },
    { day: 'Sun', temp: 32, condition: '☀️', humidity: 60, rainfall: 0 },
  ];

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header - Responsive */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Weather & AI Farming (Ghana)</h1>
          <p className="text-gray-600 text-sm sm:text-base">Monitor Ghana weather conditions and analyze agricultural data</p>
        </div>

        <Tabs defaultValue="crops" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 min-w-max">
              <TabsTrigger value="crops" className="text-xs sm:text-sm px-2 sm:px-4">
                <span className="hidden sm:inline">Ghana Crops</span>
                <span className="sm:hidden">Crops</span>
              </TabsTrigger>
              <TabsTrigger value="current" className="text-xs sm:text-sm px-2 sm:px-4">Current</TabsTrigger>
              <TabsTrigger value="forecast" className="text-xs sm:text-sm px-2 sm:px-4">
                <span className="hidden sm:inline">Weather & GPS</span>
                <span className="sm:hidden">Weather</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 sm:px-4">Analytics</TabsTrigger>
            </TabsList>
          </div>

          {/* Ghana Crop Management Tab - Enhanced Responsive */}
          <TabsContent value="crops" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-1 gap-4 sm:gap-6">
              {/* Ghana Crop Management */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Ghana Crop Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {ghanaCrops.map((crop) => (
                      <div key={crop.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{crop.name}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">{crop.type} - {crop.variety}</p>
                          </div>
                          <Badge 
                            className={`text-xs shrink-0 ml-2 ${
                              crop.health > 80 ? 'bg-green-100 text-green-800' : 
                              crop.health > 60 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}
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
                            <p className="text-gray-500">Region</p>
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
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ghana-specific Weather Recommendations */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Activity className="w-5 h-5" />
                  <span>Ghana Weather-Based Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Cocoa Care</h4>
                    <p className="text-xs sm:text-sm text-blue-800 mb-3">
                      Ideal humidity levels for cocoa trees. Continue current management practices.
                    </p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs w-full sm:w-auto">
                      Monitor Pods
                    </Button>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-yellow-900 mb-2 text-sm sm:text-base">Rainy Season Alert</h4>
                    <p className="text-xs sm:text-sm text-yellow-800 mb-3">
                      Heavy rains expected. Check drainage in cassava and maize fields.
                    </p>
                    <Button size="sm" variant="outline" className="text-xs w-full sm:w-auto">
                      Check Drainage
                    </Button>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 md:col-span-2 lg:col-span-1">
                    <h4 className="font-medium text-green-900 mb-2 text-sm sm:text-base">Optimal Planting</h4>
                    <p className="text-xs sm:text-sm text-green-800 mb-3">
                      Perfect conditions for planting maize and cassava. Soil moisture is ideal.
                    </p>
                    <Button size="sm" variant="outline" className="text-xs w-full sm:w-auto">
                      Plan Planting
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="current" className="space-y-6">
            {/* Current Weather Overview with Real-time Data */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cloud className="w-5 h-5" />
                    <span>Current Weather</span>
                    {loadingRealTime && <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>}
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{realTimeWeather?.location || (userLocation ? userLocation.name : currentLocationData?.label || 'Accra')}</span>
                      {userLocation && (
                        <Badge>GPS: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</Badge>
                      )}
                      {!userLocation && (
                        <Badge>GPS: {currentLocationData?.coords}</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Accra">Accra</SelectItem>
                          <SelectItem value="Kumasi">Kumasi</SelectItem>
                          <SelectItem value="Tamale">Tamale</SelectItem>
                          <SelectItem value="Cape Coast">Cape Coast</SelectItem>
                          <SelectItem value="Ho">Ho</SelectItem>
                          <SelectItem value="Wa">Wa</SelectItem>
                        </SelectContent>
                      </Select>
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
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900">Weather for {selectedCity}, Ghana</p>
                  </div>
                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-4">
                      {realTimeWeather ? (
                        <>
                          <img 
                            src={openWeatherService.getWeatherIconUrl(realTimeWeather.icon)} 
                            alt={realTimeWeather.description}
                            className="w-16 h-16"
                          />
                          <div>
                            <p className="text-4xl font-bold text-gray-900">{realTimeWeather.temperature}°C</p>
                            <p className="text-gray-600 text-lg capitalize">{realTimeWeather.description}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-6xl">{weatherData.icon}</span>
                          <div>
                            <p className="text-4xl font-bold text-gray-900">{weatherData.temperature}°C</p>
                            <p className="text-gray-600 text-lg">{weatherData.condition}</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 flex-1">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Droplets className="w-5 h-5 text-blue-500" />
                          <span className="text-sm text-gray-600">Humidity</span>
                        </div>
                        <p className="text-2xl font-semibold">{realTimeWeather?.humidity || weatherData.humidity}%</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Gauge className="w-5 h-5 text-purple-500" />
                          <span className="text-sm text-gray-600">Pressure</span>
                        </div>
                        <p className="text-2xl font-semibold">{realTimeWeather?.pressure || 1013} hPa</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Wind className="w-5 h-5 text-gray-500" />
                          <span className="text-sm text-gray-600">Wind Speed</span>
                        </div>
                        <p className="text-2xl font-semibold">{realTimeWeather?.windSpeed || 8} m/s</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Eye className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-gray-600">Visibility</span>
                        </div>
                        <p className="text-2xl font-semibold">{realTimeWeather?.visibility?.toFixed(1) || 10} km</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional weather info */}
                  {realTimeWeather && (
                    <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Sunrise className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-600">Sunrise: {realTimeWeather.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Sunset className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-gray-600">Sunset: {realTimeWeather.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Weather Recommendations Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sprout className="w-5 h-5" />
                    <span>Weather Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {weatherRecommendations.length > 0 ? (
                    weatherRecommendations.map((rec, index) => (
                      <Alert key={index} className={`${
                        rec.severity === 'high' ? 'border-red-200 bg-red-50' :
                        rec.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                        'border-green-200 bg-green-50'
                      }`}>
                        <AlertTriangle className={`w-4 h-4 ${
                          rec.severity === 'high' ? 'text-red-600' :
                          rec.severity === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`} />
                        <AlertDescription>
                          <div className="space-y-1">
                            <p className="font-medium">{rec.category}</p>
                            <p className="text-sm">{rec.message}</p>
                            {rec.action && (
                              <p className="text-sm italic text-gray-600">Action: {rec.action}</p>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))
                  ) : (
                    <div className="bg-green-50 rounded-lg p-3">
                      <h4 className="font-medium text-green-900 mb-2">Good Conditions</h4>
                      <p className="text-sm text-green-800">Current weather conditions are favorable for farming activities.</p>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-2">Soil Conditions</h4>
                    <p className="text-sm text-blue-800">Good moisture, suitable for planting</p>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <h4 className="font-medium text-yellow-900 mb-2">Disease Risk</h4>
                    <p className="text-sm text-yellow-800">Moderate - monitor for fungal diseases</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            {/* Ghana Location Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Ghana Location Selection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Ghana Region</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your location in Ghana" />
                      </SelectTrigger>
                      <SelectContent>
                        {ghanaLocations.map((location) => (
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
                    <Button size="sm" variant="outline" className="mt-2" onClick={requestLocation}>
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
                  <span>7-Day Ghana Weather Forecast</span>
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
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Ghana Weather Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Historical weather data and trends for {currentLocationData?.label || 'Ghana'}.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">7-Day Temperature Trend</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {historicalData.map((day, index) => (
                      <div key={index} className="text-center">
                        <p className="text-xs text-gray-500">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className="font-bold text-lg">{day.temperature}°</p>
                        <p className="text-xs text-blue-600">{day.humidity}%</p>
                        <p className="text-xs text-green-600">{day.rainfall}mm</p>
                      </div>
                    ))}
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
