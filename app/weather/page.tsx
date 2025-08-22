/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsDown, ThumbsUp, ThermometerSun, ThermometerSnowflake } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import openWeatherService, { ProcessedWeatherData, WeatherRecommendation } from '@/services/openweather-api';
import weatherForecastService, { ProcessedForecastData } from '@/services/weather-forecast';
import { weatherHistoryService, WeatherHistoryData } from '@/services/weather-history';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useAuth } from '@/contexts/AuthContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Helper functions for crop recommendations
const getRecommendedCrops = (weather: ProcessedWeatherData | null) => {
  if (!weather) return [];

  const { temperature, humidity, rainfall } = weather;
  const recommendations = [];

  // Maize
  if (temperature >= 20 && temperature <= 30 && rainfall >= 500 && rainfall <= 1200) {
    recommendations.push({
      name: 'Maize',
      reason: 'Optimal temperature and rainfall conditions for maize growth.'
    });
  }

  // Cassava
  if (temperature >= 25 && temperature <= 35 && rainfall >= 750) {
    recommendations.push({
      name: 'Cassava',
      reason: 'Warm temperatures and good rainfall suitable for cassava cultivation.'
    });
  }

  // Cocoa
  if (temperature >= 18 && temperature <= 32 && humidity >= 70 && rainfall >= 1000) {
    recommendations.push({
      name: 'Cocoa',
      reason: 'High humidity and adequate rainfall perfect for cocoa trees.'
    });
  }

  // Rice
  if (temperature >= 20 && temperature <= 35 && rainfall >= 800) {
    recommendations.push({
      name: 'Rice',
      reason: 'Good temperature range and sufficient water for rice cultivation.'
    });
  }

  // Yam
  if (temperature >= 25 && temperature <= 35 && rainfall >= 1000 && rainfall <= 1500) {
    recommendations.push({
      name: 'Yam',
      reason: 'Warm climate and moderate rainfall ideal for yam growth.'
    });
  }

  return recommendations;
};

const getNonRecommendedCrops = (weather: ProcessedWeatherData | null) => {
  if (!weather) return [];

  const { temperature, humidity, rainfall } = weather;
  const nonRecommended = [];

  // Temperature too high
  if (temperature > 35) {
    nonRecommended.push({
      name: 'Cocoa',
      reason: 'Temperature too high for optimal cocoa growth.'
    });
  }

  // Too dry
  if (rainfall < 500) {
    nonRecommended.push({
      name: 'Rice',
      reason: 'Insufficient rainfall for rice cultivation.'
    });
  }

  // Low humidity
  if (humidity < 60) {
    nonRecommended.push({
      name: 'Plantain',
      reason: 'Humidity levels too low for plantain growth.'
    });
  }

  // Excessive rainfall
  if (rainfall > 2000) {
    nonRecommended.push({
      name: 'Groundnuts',
      reason: 'Excessive rainfall may lead to root rot.'
    });
  }

  return nonRecommended;
};

const getFarmingSystemRecommendations = (weather: ProcessedWeatherData | null) => {
  if (!weather) return [];

  const { temperature, humidity, rainfall, windSpeed } = weather;
  const recommendations = [];

  // Irrigation Systems
  if (rainfall < 800) {
    recommendations.push({
      name: 'Drip Irrigation',
      description: 'Low rainfall conditions require efficient water management. Consider installing drip irrigation.'
    });
  }

  // Mixed Cropping
  if (rainfall >= 800 && rainfall <= 1500) {
    recommendations.push({
      name: 'Mixed Cropping',
      description: 'Favorable conditions for diverse crop combinations. Integrate legumes with cereals.'
    });
  }

  // Agroforestry
  if (temperature > 30) {
    recommendations.push({
      name: 'Agroforestry',
      description: 'High temperatures suggest benefits from tree integration for shade and soil protection.'
    });
  }

  // Conservation Agriculture
  if (rainfall > 1500) {
    recommendations.push({
      name: 'Conservation Agriculture',
      description: 'High rainfall area needs soil protection. Use mulching and minimum tillage.'
    });
  }

  // Greenhouse Farming
  if (windSpeed > 10 || temperature > 35) {
    recommendations.push({
      name: 'Protected Agriculture',
      description: 'Consider greenhouse or tunnels to protect crops from extreme conditions.'
    });
  }

  return recommendations;
};
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
  CalendarRange,
  Sprout,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Calendar,
  Brain,
  Zap,
  Target,
  Navigation,
  Eye,
  Gauge,
  CloudRain,
  CloudSnow,
  Sunrise,
  Sunset,
  ArrowRight
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
  const [forecast, setForecast] = useState<Omit<ProcessedForecastData, 'farmingRecommendations'> & {
    yearly?: WeatherHistoryData[];
    seasonalPatterns?: string[];
    farmingRecommendations: WeatherRecommendation[];
  }>({
    daily: [],
    farmingRecommendations: [],
    yearly: [],
    seasonalPatterns: []
  });
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
  // const ghanaLocations = [
  //   { value: 'accra', label: 'Accra', coords: '5.6037°N, 0.1870°W' },
  //   { value: 'kumasi', label: 'Kumasi', coords: '6.6885°N, 1.6244°W' },
  //   { value: 'tamale', label: 'Tamale', coords: '9.4008°N, 0.8393°W' },
  //   { value: 'cape_coast', label: 'Cape Coast', coords: '5.1053°N, 1.2466°W' },
  //   { value: 'ho', label: 'Ho', coords: '6.6110°N, 0.4708°E' },
  //   { value: 'wa', label: 'Wa', coords: '10.0602°N, 2.5057°W' },
  //   { value: 'bolgatanga', label: 'Bolgatanga', coords: '10.7856°N, 0.8515°W' },
  //   { value: 'sunyani', label: 'Sunyani', coords: '7.3386°N, 2.3267°W' }
  // ];
  const ghanaLocations = [
  { value: 'accra', label: 'Accra', coords: '5.6037°N, 0.1870°W' }, // Greater Accra
  { value: 'kumasi', label: 'Kumasi', coords: '6.6885°N, 1.6244°W' }, // Ashanti
  { value: 'tamale', label: 'Tamale', coords: '9.4008°N, 0.8393°W' }, // Northern
  { value: 'cape_coast', label: 'Cape Coast', coords: '5.1053°N, 1.2466°W' }, // Central
  { value: 'ho', label: 'Ho', coords: '6.6110°N, 0.4708°E' }, // Volta
  { value: 'wa', label: 'Wa', coords: '10.0602°N, 2.5057°W' }, // Upper West
  { value: 'bolgatanga', label: 'Bolgatanga', coords: '10.7856°N, 0.8515°W' }, // Upper East
  { value: 'sunyani', label: 'Sunyani', coords: '7.3386°N, 2.3267°W' }, // Bono
  { value: 'techiman', label: 'Techiman', coords: '7.5830°N, 1.9381°W' }, // Bono East
  { value: 'goaso', label: 'Goaso', coords: '6.8010°N, 2.5237°W' }, // Ahafo
  { value: 'sekondi_takoradi', label: 'Sekondi-Takoradi', coords: '4.9437°N, 1.7040°W' }, // Western
  { value: 'sefwi_wiawso', label: 'Sefwi Wiawso', coords: '6.2012°N, 2.4857°W' }, // Western North
  { value: 'koforidua', label: 'Koforidua', coords: '6.0941°N, 0.2591°W' }, // Eastern
  { value: 'dambai', label: 'Dambai', coords: '8.1667°N, 0.1500°E' }, // Oti
  { value: 'nalerigu', label: 'Nalerigu', coords: '10.5276°N, 0.3690°W' }, // North East
  { value: 'damongo', label: 'Damongo', coords: '9.0833°N, 1.8167°W' }, // Savannah
  { value: 'ejura', label: 'Ejura', coords: '7.3833°N, 1.3500°W' }, // Maize, yam, soya
  { value: 'wenchi', label: 'Wenchi', coords: '7.7333°N, 2.1000°W' }, // Cashew, maize
  { value: 'navrongo', label: 'Navrongo', coords: '10.8956°N, 1.0921°W' }, // Rice, millet
  { value: 'salaga', label: 'Salaga', coords: '8.5500°N, 0.5167°W' }, // Yam, groundnuts
  { value: 'yendi', label: 'Yendi', coords: '9.4427°N, 0.0099°W' }, // Rice, maize
  { value: 'savelugu', label: 'Savelugu', coords: '9.6241°N, 0.8250°W' }, // Soya, maize
  { value: 'bawku', label: 'Bawku', coords: '11.0616°N, 0.2417°W' }, // Groundnuts, millet
  { value: 'damongo_farms', label: 'Damongo (Farming Area)', coords: '9.0833°N, 1.8167°W' }, // Yam, maize
  { value: 'wenchi_cashew', label: 'Wenchi Cashew Belt', coords: '7.7333°N, 2.1000°W' }, // Cashew hub
  { value: 'asante_mampong', label: 'Asante Mampong', coords: '7.0627°N, 1.4000°W' }, // Cocoa, maize
  { value: 'goaso_cocoa', label: 'Goaso Cocoa Belt', coords: '6.8010°N, 2.5237°W' }, // Cocoa
  { value: 'suhum', label: 'Suhum', coords: '6.0333°N, 0.4500°W' }, // Cocoa, vegetables
  { value: 'nsawam', label: 'Nsawam', coords: '5.8080°N, 0.3500°W' } // Pineapple, vegetables
];


  // const getLocationCoordinates = (locationValue: string) => {
  //   const locations = {
  //     'accra': { lat: 5.6037, lng: -0.1870, name: 'Accra' },
  //     'kumasi': { lat: 6.6885, lng: -1.6244, name: 'Kumasi' },
  //     'tamale': { lat: 9.4008, lng: -0.8393, name: 'Tamale' },
  //     'cape_coast': { lat: 5.1053, lng: -1.2466, name: 'Cape Coast' },
  //     'ho': { lat: 6.6110, lng: 0.4708, name: 'Ho' },
  //     'wa': { lat: 10.0602, lng: -2.5057, name: 'Wa' },
  //     'bolgatanga': { lat: 10.7856, lng: -0.8515, name: 'Bolgatanga' },
  //     'sunyani': { lat: 7.3386, lng: -2.3267, name: 'Sunyani' }
  //   };
  //   return locations[locationValue as keyof typeof locations] || locations['accra'];
  // };

  const getLocationCoordinates = (locationValue: string) => {
  const locations = {
    // Major Cities
    'accra': { lat: 5.6037, lng: -0.1870, name: 'Accra' },
    'kumasi': { lat: 6.6885, lng: -1.6244, name: 'Kumasi' },
    'tamale': { lat: 9.4008, lng: -0.8393, name: 'Tamale' },
    'cape_coast': { lat: 5.1053, lng: -1.2466, name: 'Cape Coast' },
    'ho': { lat: 6.6110, lng: 0.4708, name: 'Ho' },
    'wa': { lat: 10.0602, lng: -2.5057, name: 'Wa' },
    'bolgatanga': { lat: 10.7856, lng: -0.8515, name: 'Bolgatanga' },
    'sunyani': { lat: 7.3386, lng: -2.3267, name: 'Sunyani' },

    // Additional Regional Capitals
    'techiman': { lat: 7.5830, lng: -1.9381, name: 'Techiman' },
    'goaso': { lat: 6.8010, lng: -2.5237, name: 'Goaso' },
    'sekondi_takoradi': { lat: 4.9437, lng: -1.7040, name: 'Sekondi-Takoradi' },
    'sefwi_wiawso': { lat: 6.2012, lng: -2.4857, name: 'Sefwi Wiawso' },
    'koforidua': { lat: 6.0941, lng: -0.2591, name: 'Koforidua' },
    'dambai': { lat: 8.1667, lng: 0.1500, name: 'Dambai' },
    'nalerigu': { lat: 10.5276, lng: -0.3690, name: 'Nalerigu' },
    'damongo': { lat: 9.0833, lng: -1.8167, name: 'Damongo' },

    // Popular Farming Areas
    'ejura': { lat: 7.3833, lng: -1.3500, name: 'Ejura' },
    'wenchi': { lat: 7.7333, lng: -2.1000, name: 'Wenchi' },
    'navrongo': { lat: 10.8956, lng: -1.0921, name: 'Navrongo' },
    'salaga': { lat: 8.5500, lng: -0.5167, name: 'Salaga' },
    'yendi': { lat: 9.4427, lng: -0.0099, name: 'Yendi' },
    'savelugu': { lat: 9.6241, lng: -0.8250, name: 'Savelugu' },
    'bawku': { lat: 11.0616, lng: -0.2417, name: 'Bawku' },
    'damongo_farms': { lat: 9.0833, lng: -1.8167, name: 'Damongo (Farming Area)' },
    'wenchi_cashew': { lat: 7.7333, lng: -2.1000, name: 'Wenchi Cashew Belt' },
    'asante_mampong': { lat: 7.0627, lng: -1.4000, name: 'Asante Mampong' },
    'goaso_cocoa': { lat: 6.8010, lng: -2.5237, name: 'Goaso Cocoa Belt' },
    'suhum': { lat: 6.0333, lng: -0.4500, name: 'Suhum' },
    'nsawam': { lat: 5.8080, lng: -0.3500, name: 'Nsawam' }
  };

  return locations[locationValue as keyof typeof locations] || locations['accra'];
};


  // Load weather data on component mount and location change
  useEffect(() => {
    loadWeatherData();
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

      const weatherData = await openWeatherService.getCurrentWeather(lat, lng);
      setRealTimeWeather(weatherData);
      setWeatherRecommendations(weatherData.recommendations);

      // Track weather check activity
      if (user?.id) {
        localStorageService.recordActivity(user.id, {
          type: 'weather_check',
          data: {
            location: locationName,
            temperature: weatherData.temperature,
            condition: weatherData.description,
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('Error loading weather data:', error);
      setRealTimeWeather(null);
    } finally {
      setLoadingWeather(false);
    }
  };

  const loadForecastData = async () => {
    try {
      setLoadingWeather(true);
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

      const [forecastData, yearlyData, currentWeather] = await Promise.all([
        weatherForecastService.getForecast(lat, lng),
        weatherHistoryService.getYearlyAnalytics(lat, lng),
        openWeatherService.getCurrentWeather(lat, lng)
      ]);

      setForecast({
        ...forecastData,
        yearly: yearlyData.monthlyData,
        seasonalPatterns: yearlyData.seasonalPatterns,
        farmingRecommendations: [
          ...forecastData.farmingRecommendations,
          ...yearlyData.farmingRecommendations
        ]
      });

      setRealTimeWeather(currentWeather);
      setWeatherRecommendations(currentWeather.recommendations);

      // Track weather check activity
      if (user?.id) {
        localStorageService.recordActivity(user.id, {
          type: 'weather_check',
          data: {
            location: locationName,
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('Error loading forecast data:', error);
      setForecast({
        daily: [],
        farmingRecommendations: [],
        yearly: [],
        seasonalPatterns: []
      });
      setRealTimeWeather(null);
    } finally {
      setLoadingWeather(false);
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
          const newLocation = { 
            latitude, 
            longitude, 
            name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
          };
          setUserLocation(newLocation);
          setLocationPermission('granted');
          setSelectedLocation(''); // Clear selected location
          await loadForecastData();
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
                <div className="space-y-6">
                  {/* Current Weather Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Current Weather Conditions</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Temperature</p>
                        <p className="font-medium">{realTimeWeather?.temperature || 0}°C</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Humidity</p>
                        <p className="font-medium">{realTimeWeather?.humidity || 0}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rainfall</p>
                        <p className="font-medium">{realTimeWeather?.rainfall || 0}mm</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Wind Speed</p>
                        <p className="font-medium">{realTimeWeather?.windSpeed || 0}m/s</p>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Crops */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-3 flex items-center">
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Recommended Crops
                      </h4>
                      <div className="space-y-3">
                        {getRecommendedCrops(realTimeWeather).map((crop, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-green-100">
                            <h5 className="font-medium text-green-800 mb-1">{crop.name}</h5>
                            <p className="text-sm text-green-700">{crop.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 mb-3 flex items-center">
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Not Recommended
                      </h4>
                      <div className="space-y-3">
                        {getNonRecommendedCrops(realTimeWeather).map((crop, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-red-100">
                            <h5 className="font-medium text-red-800 mb-1">{crop.name}</h5>
                            <p className="text-sm text-red-700">{crop.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Farming Systems Recommendations */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Recommended Farming Systems
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getFarmingSystemRecommendations(realTimeWeather).map((system, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-blue-100">
                          <h5 className="font-medium text-blue-800 mb-1">{system.name}</h5>
                          <p className="text-sm text-blue-700">{system.description}</p>
                        </div>
                      ))}
                    </div>
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
                          <SelectItem value="accra">Accra</SelectItem>
                          <SelectItem value="kumasi">Kumasi</SelectItem>
                          <SelectItem value="tamale">Tamale</SelectItem>
                          <SelectItem value="cape_coast">Cape Coast</SelectItem>
                          <SelectItem value="ho">Ho</SelectItem>
                          <SelectItem value="wa">Wa</SelectItem>
                          <SelectItem value="bolgatanga">Bolgatanga</SelectItem>
                          <SelectItem value="sunyani">Sunyani</SelectItem>
                          <SelectItem value="techiman">Techiman</SelectItem>
                          <SelectItem value="goaso">Goaso</SelectItem>
                          <SelectItem value="sekondi_takoradi">Sekondi-Takoradi</SelectItem>
                          <SelectItem value="sefwi_wiawso">Sefwi Wiawso</SelectItem>
                          <SelectItem value="koforidua">Koforidua</SelectItem>
                          <SelectItem value="dambai">Dambai</SelectItem>
                          <SelectItem value="nalerigu">Nalerigu</SelectItem>
                          <SelectItem value="damongo">Damongo</SelectItem>
                          <SelectItem value="ejura">Ejura</SelectItem>
                          <SelectItem value="wenchi">Wenchi</SelectItem>
                          <SelectItem value="navrongo">Navrongo</SelectItem>
                          <SelectItem value="salaga">Salaga</SelectItem>
                          <SelectItem value="yendi">Yendi</SelectItem>
                          <SelectItem value="savelugu">Savelugu</SelectItem>
                          <SelectItem value="bawku">Bawku</SelectItem>
                          <SelectItem value="damongo_farms">Damongo (Farming Area)</SelectItem>
                          <SelectItem value="wenchi_cashew">Wenchi Cashew Belt</SelectItem>
                          <SelectItem value="asante_mampong">Asante Mampong</SelectItem>
                          <SelectItem value="goaso_cocoa">Goaso Cocoa Belt</SelectItem>
                          <SelectItem value="suhum">Suhum</SelectItem>
                          <SelectItem value="nsawam">Nsawam</SelectItem>
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
                    <Select 
                      value={selectedLocation} 
                      onValueChange={(value) => {
                        setSelectedLocation(value);
                        setUserLocation(null); // Clear any GPS location
                        const location = getLocationCoordinates(value);
                        loadForecastData();
                      }}
                    >
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
                <div className="space-y-6">
                  {/* Weekly Forecast Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {forecast.daily.map((day, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="font-medium text-gray-900 mb-2">{day.day}</p>
                        <img 
                          src={weatherForecastService.getWeatherIconUrl(day.icon)}
                          alt={day.condition}
                          className="w-12 h-12 mx-auto mb-2"
                        />
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

                  {/* Weather Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Temperature Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Temperature Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Line
                          data={{
                            labels: forecast?.daily?.map(day => day.day) || [],
                            datasets: [
                              {
                                label: 'Maximum Temperature',
                                data: forecast?.daily?.map(day => day.tempMax) || [],
                                borderColor: 'rgb(239, 68, 68)',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                fill: true,
                                tension: 0.4
                              },
                              {
                                label: 'Minimum Temperature',
                                data: forecast?.daily?.map(day => day.tempMin) || [],
                                borderColor: 'rgb(59, 130, 246)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                fill: true,
                                tension: 0.4
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                position: 'top' as const,
                              },
                              title: {
                                display: true,
                                text: 'Temperature Trends'
                              }
                            },
                            scales: {
                              y: {
                                type: 'linear' as const,
                                display: true,
                                position: 'left' as const,
                                title: {
                                  display: true,
                                  text: 'Temperature (°C)'
                                }
                              }
                            }
                          }}
                        />
                      </CardContent>
                    </Card>

                    {/* Rainfall and Humidity Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Rainfall & Humidity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Bar
                          data={{
                            labels: forecast?.daily?.map(day => day.day) || [],
                            datasets: [
                              {
                                label: 'Rainfall (mm)',
                                data: forecast?.daily?.map(day => day.rainfall) || [],
                                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                                yAxisID: 'y1',
                              },
                              {
                                label: 'Humidity (%)',
                                data: forecast?.daily?.map(day => day.humidity) || [],
                                backgroundColor: 'rgba(167, 139, 250, 0.5)',
                                yAxisID: 'y2',
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                position: 'top' as const,
                              },
                              title: {
                                display: true,
                                text: 'Rainfall & Humidity'
                              }
                            },
                            scales: {
                              y1: {
                                type: 'linear' as const,
                                display: true,
                                position: 'left' as const,
                                title: {
                                  display: true,
                                  text: 'Rainfall (mm)'
                                },
                                grid: {
                                  drawOnChartArea: false
                                }
                              },
                              y2: {
                                type: 'linear' as const,
                                display: true,
                                position: 'right' as const,
                                title: {
                                  display: true,
                                  text: 'Humidity (%)'
                                }
                              }
                            }
                          }}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Farming Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Sprout className="w-5 h-5" />
                        <span>Farming Recommendations</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {forecast.farmingRecommendations.map((rec, index) => (
                          <Alert key={index} className={`${
                            rec.severity === 'high' ? 'border-red-200 bg-red-50' :
                            rec.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                            'border-green-200 bg-green-50'
                          }`}>
                            <AlertTitle>{rec.category}</AlertTitle>
                            <AlertDescription>
                              <p>{rec.message}</p>
                              {rec.action && (
                                <Button variant="link" className="mt-2 p-0 h-auto font-normal">
                                  <ArrowRight className="w-4 h-4 mr-1" />
                                  {rec.action}
                                </Button>
                              )}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Yearly Analysis */}
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
                
                {/* Yearly Temperature Chart */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Annual Temperature & Rainfall Patterns</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Line
                        data={{
                          labels: forecast.yearly?.map(data => data.month) || [],
                          datasets: [
                            {
                              label: 'Average Temperature (°C)',
                              data: forecast.yearly?.map(data => data.avgTemp) || [],
                              borderColor: 'rgb(239, 68, 68)',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              yAxisID: 'y1',
                              fill: true
                            },
                            {
                              label: 'Total Rainfall (mm)',
                              data: forecast.yearly?.map(data => data.totalRainfall) || [],
                              borderColor: 'rgb(59, 130, 246)',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              yAxisID: 'y2',
                              fill: true
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          interaction: {
                            mode: 'index' as const,
                            intersect: false,
                          },
                          plugins: {
                            title: {
                              display: true,
                              text: 'Annual Weather Patterns'
                            }
                          },
                          scales: {
                            y1: {
                              type: 'linear' as const,
                              display: true,
                              position: 'left' as const,
                              title: {
                                display: true,
                                text: 'Temperature (°C)'
                              }
                            },
                            y2: {
                              type: 'linear' as const,
                              display: true,
                              position: 'right' as const,
                              title: {
                                display: true,
                                text: 'Rainfall (mm)'
                              }
                            }
                          }
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* Seasonal Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Seasonal Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Seasonal Patterns */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Seasonal Patterns</h4>
                          <ul className="space-y-2">
                            {forecast.seasonalPatterns?.map((pattern, index) => (
                              <li key={index} className="text-sm flex items-center space-x-2">
                                <CalendarRange className="w-4 h-4 text-blue-600" />
                                <span>{pattern}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Farming Recommendations */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Farming Recommendations</h4>
                          <ul className="space-y-2">
                            {forecast.farmingRecommendations?.map((rec, index) => (
                              <li key={index} className="text-sm flex items-center space-x-2">
                                <Sprout className="w-4 h-4 text-green-600" />
                                <span>{rec.message}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Current vs Historical */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Current vs Historical Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Temperature Comparison */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Temperature</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Current:</span>
                              <span className="font-medium">{realTimeWeather?.temperature || 'N/A'}°C</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Historical Avg:</span>
                              <span className="font-medium">{forecast.yearly?.[new Date().getMonth()]?.avgTemp || 'N/A'}°C</span>
                            </div>
                          </div>
                        </div>

                        {/* Rainfall Comparison */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Rainfall</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Current:</span>
                              <span className="font-medium">{realTimeWeather?.rainfall || '0'}mm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Historical Avg:</span>
                              <span className="font-medium">{forecast.yearly?.[new Date().getMonth()]?.totalRainfall || 'N/A'}mm</span>
                            </div>
                          </div>
                        </div>

                        {/* Humidity Comparison */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Humidity</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Current:</span>
                              <span className="font-medium">{realTimeWeather?.humidity || 'N/A'}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Historical Avg:</span>
                              <span className="font-medium">{forecast.yearly?.[new Date().getMonth()]?.avgHumidity || 'N/A'}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
