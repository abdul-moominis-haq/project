import axios from 'axios';
import { User, Weather, WeatherForecast, Crop, Advisory, CommunityPost, IoTSensor } from '@/types';
import { supabase } from './supabase';


// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000/';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  // Login user
  login: async (email: string, password: string) => {
    // const response = await api.post('/auth/login', { email, password });
    // return response.data;
    
    // Using dummy data for now
    return {
      token: 'dummy-jwt-token',
      user: {
        id: '1',
        name: 'John Farmer',
        email,
        location: 'Nairobi, Kenya'
      }
    };
  },

  // Register user
  register: async (userData: { name: string; email: string; password: string; location: string }) => {
    // const response = await api.post('/auth/register', userData);
    // return response.data;
    
    // Using dummy data for now
    return {
      token: 'dummy-jwt-token',
      user: {
        id: '2',
        name: userData.name,
        email: userData.email,
        location: userData.location
      }
    };
  },

  // Logout user
  logout: async () => {
    // await api.post('/auth/logout');
    localStorage.removeItem('authToken');
  },

  // Get current user
  getCurrentUser: async () => {
    // const response = await api.get('/auth/me');
    // return response.data;
    
    // Using dummy data for now
    return {
      id: '1',
      name: 'John Farmer',
      email: 'john@example.com',
      location: 'Nairobi, Kenya'
    };
  }
};

// Weather API calls
export const weatherAPI = {
  // Get current weather
  getCurrentWeather: async (location?: { lat: number; lng: number }) => {
    // const params = location ? { lat: location.lat, lng: location.lng } : {};
    // const response = await api.get('/weather/current', { params });
    // return response.data;
    
    // Using dummy data for now
    return {
      temperature: 24,
      humidity: 68,
      rainfall: 2.5,
      condition: 'Partly Cloudy',
      icon: '⛅',
      location: location ? `${location.lat}, ${location.lng}` : 'Nairobi, Kenya'
    };
  },

  // Get weather forecast
  getWeatherForecast: async (days: number = 7, location?: { lat: number; lng: number }) => {
    // const params = { days, ...location };
    // const response = await api.get('/weather/forecast', { params });
    // return response.data;
    
    // Using dummy data for now
    return [
      { date: '2025-01-08', temperature: 26, humidity: 72, rainfall: 1.2, condition: 'Sunny', icon: '☀️' },
      { date: '2025-01-09', temperature: 24, humidity: 75, rainfall: 3.5, condition: 'Rainy', icon: '🌧️' },
      { date: '2025-01-10', temperature: 28, humidity: 65, rainfall: 0, condition: 'Clear', icon: '☀️' }
    ];
  },

  // Get historical weather data
  getHistoricalWeather: async (startDate: string, endDate: string, location?: { lat: number; lng: number }) => {
    // const params = { startDate, endDate, ...location };
    // const response = await api.get('/weather/historical', { params });
    // return response.data;
    
    // Using dummy data for now
    return [
      { date: '2025-01-01', temperature: 22, humidity: 70, rainfall: 0 },
      { date: '2025-01-02', temperature: 25, humidity: 65, rainfall: 1.2 },
      { date: '2025-01-03', temperature: 23, humidity: 72, rainfall: 3.8 }
    ];
  },

  // Get AI weather predictions
  getAIPredictions: async (timeframe: 'daily' | 'weekly' | 'monthly', location?: { lat: number; lng: number }) => {
    // const params = { timeframe, ...location };
    // const response = await api.get('/weather/ai-predictions', { params });
    // return response.data;
    
    // Using dummy data for now - AI predictions would come from ML models
    return {
      daily: [
        {
          date: 'Tomorrow',
          temperature: { min: 18, max: 28, confidence: 94 },
          rainfall: { probability: 15, amount: 0.2, confidence: 89 },
          humidity: { value: 72, confidence: 91 },
          recommendation: 'Ideal conditions for outdoor farming activities',
          risk: 'low'
        }
      ],
      weekly: [
        {
          period: 'Week 1',
          avgTemp: { min: 19, max: 27, confidence: 89 },
          totalRainfall: { amount: 25.5, confidence: 84 },
          avgHumidity: { value: 75, confidence: 87 },
          recommendation: 'Moderate rainfall expected - optimal for most crops'
        }
      ],
      monthly: [
        {
          month: 'This Month',
          avgTemp: { min: 19, max: 27, confidence: 82 },
          totalRainfall: { amount: 125.5, confidence: 78 },
          avgHumidity: { value: 74, confidence: 81 },
          recommendation: 'Favorable growing conditions overall'
        }
      ]
    };
  }
};

// Crops API calls
export const cropsAPI = {
  // Get all crops for user
  getCrops: async (userId: any) => {
    const { data, error } = await supabase
      .from("crops")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    return data as Crop[];
  },

  // Create new crop
 // Create new crop
createCrop: async (cropData: Partial<Crop>) => {
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) throw new Error("User not authenticated");
  const { data, error } = await supabase
    .from("crops")
    .insert([
      {
        ...cropData,
        // user_id: user.id,  // ✅ correct UUID
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Crop;
},


  // Update crop
  updateCrop: async (cropId: string, cropData: Partial<Crop>) => {
    // const response = await api.put(`/crops/${cropId}`, cropData);
    // return response.data;
    
    // Using dummy data for now
    return { id: cropId, ...cropData };
  },

  // Delete crop
  deleteCrop: async (cropId: string) => {
    // await api.delete(`/crops/${cropId}`);
    
    // Using dummy data for now
    return { success: true };
  },

  // Get crop analytics
  getCropAnalytics: async (cropId: string) => {
    // const response = await api.get(`/crops/${cropId}/analytics`);
    // return response.data;
    
    // Using dummy data for now
    return {
      growthRate: 85,
      healthTrend: 'improving',
      yieldPrediction: 4.2,
      recommendations: ['Increase watering', 'Apply fertilizer']
    };
  }
};

// IoT Sensors API calls
export const sensorsAPI = {
  // Get all sensors
  getSensors: async (userId: string) => {
    // const response = await api.get(`/sensors?userId=${userId}`);
    // return response.data;
    
    // Using dummy data for now
    return [
      {
        id: '1',
        name: 'Soil Moisture Sensor 1',
        type: 'Soil Moisture',
        status: 'active' as const,
        location: 'North Field',
        lastReading: {
          timestamp: '2025-01-07T10:30:00Z',
          value: 65,
          unit: '%'
        },
        batteryLevel: 87
      }
    ];
  },

  // Create new sensor
  createSensor: async (sensorData: Partial<IoTSensor>) => {
    // const response = await api.post('/sensors', sensorData);
    // return response.data;
    
    // Using dummy data for now
    return {
      id: Date.now().toString(),
      ...sensorData,
      status: 'active' as const,
      batteryLevel: Math.floor(Math.random() * 100),
      lastReading: {
        timestamp: new Date().toISOString(),
        value: Math.floor(Math.random() * 100),
        unit: sensorData.type === 'Temperature' ? '°C' : sensorData.type === 'Humidity' ? '%' : 'pH'
      }
    };
  },

  // Update sensor
  updateSensor: async (sensorId: string, sensorData: Partial<IoTSensor>) => {
    // const response = await api.put(`/sensors/${sensorId}`, sensorData);
    // return response.data;
    
    // Using dummy data for now
    return { id: sensorId, ...sensorData };
  },

  // Delete sensor
  deleteSensor: async (sensorId: string) => {
    // await api.delete(`/sensors/${sensorId}`);
    
    // Using dummy data for now
    return { success: true };
  },

  // Get sensor data history
  getSensorHistory: async (sensorId: string, startDate: string, endDate: string) => {
    // const response = await api.get(`/sensors/${sensorId}/history`, {
    //   params: { startDate, endDate }
    // });
    // return response.data;
    
    // Using dummy data for now
    return [
      { timestamp: '2025-01-07T10:00:00Z', value: 65, unit: '%' },
      { timestamp: '2025-01-07T11:00:00Z', value: 63, unit: '%' },
      { timestamp: '2025-01-07T12:00:00Z', value: 61, unit: '%' }
    ];
  }
};

// Community API calls
export const communityAPI = {
  // Get community posts
  getPosts: async (page: number = 1, limit: number = 10) => {
    // const response = await api.get('/community/posts', {
    //   params: { page, limit }
    // });
    // return response.data;
    
    // Using dummy data for now
    return [
      {
        id: '1',
        title: 'Best practices for maize farming in rainy season',
        content: 'Here are some tips for successful maize cultivation during the rainy season...',
        author: 'John Farmer',
        authorId: '1',
        createdAt: '2025-01-07T10:00:00Z',
        likes: 15,
        comments: 8,
        tags: ['maize', 'rainy-season', 'tips']
      }
    ];
  },

  // Create new post
  createPost: async (postData: Partial<CommunityPost>) => {
    // const response = await api.post('/community/posts', postData);
    // return response.data;
    
    // Using dummy data for now
    return {
      id: Date.now().toString(),
      ...postData,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0
    };
  },

  // Like/unlike post
  toggleLike: async (postId: string) => {
    // const response = await api.post(`/community/posts/${postId}/like`);
    // return response.data;
    
    // Using dummy data for now
    return { liked: true, totalLikes: 16 };
  },

  // Add comment to post
  addComment: async (postId: string, comment: string) => {
    // const response = await api.post(`/community/posts/${postId}/comments`, { comment });
    // return response.data;
    
    // Using dummy data for now
    return {
      id: Date.now().toString(),
      postId,
      comment,
      author: 'Current User',
      createdAt: new Date().toISOString()
    };
  }
};

// Geolocation API calls
export const locationAPI = {
  // Get location details from coordinates
  reverseGeocode: async (lat: number, lng: number) => {
    // const response = await api.get('/location/reverse-geocode', {
    //   params: { lat, lng }
    // });
    // return response.data;
    
    // Using dummy data for now - simulate reverse geocoding
    const locations = [
      { name: 'Nairobi, Kenya', lat: -1.2921, lng: 36.8219 },
      { name: 'Mombasa, Kenya', lat: -4.0435, lng: 39.6682 },
      { name: 'Kisumu, Kenya', lat: -0.0917, lng: 34.7680 },
      { name: 'Nakuru, Kenya', lat: -0.3031, lng: 36.0800 },
    ];

    let closestLocation = 'Unknown Location';
    let minDistance = Infinity;

    locations.forEach(location => {
      const distance = Math.sqrt(
        Math.pow(lat - location.lat, 2) + Math.pow(lng - location.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestLocation = location.name;
      }
    });

    return {
      name: closestLocation,
      coordinates: { lat, lng },
      country: 'Kenya',
      region: 'East Africa'
    };
  },

  // Get weather stations near location
  getNearbyWeatherStations: async (lat: number, lng: number, radius: number = 50) => {
    // const response = await api.get('/location/weather-stations', {
    //   params: { lat, lng, radius }
    // });
    // return response.data;
    
    // Using dummy data for now
    return [
      {
        id: 'jkia',
        name: 'JKIA Weather Station',
        distance: 12,
        reliability: 98,
        status: 'active'
      },
      {
        id: 'wilson',
        name: 'Wilson Airport',
        distance: 8,
        reliability: 95,
        status: 'active'
      }
    ];
  }
};

// Advisory/AI API calls
export const advisoryAPI = {
  // Get farming advisories
  getAdvisories: async (cropType?: string, location?: string) => {
    // const response = await api.get('/advisories', {
    //   params: { cropType, location }
    // });
    // return response.data;
    
    // Using dummy data for now
    return [
      {
        id: '1',
        title: 'Irrigation Alert',
        type: 'irrigation',
        priority: 'high',
        message: 'Low soil moisture detected in North Field. Consider irrigation in next 24 hours.',
        createdAt: '2025-01-07T10:00:00Z',
        cropTypes: ['maize', 'beans']
      }
    ];
  },

  // Get AI chat response
  getAIChatResponse: async (message: string, context?: any) => {
    // const response = await api.post('/ai/chat', { message, context });
    // return response.data;
    
    // Using dummy data for now - simulate AI responses
    const responses = [
      "Based on your current weather conditions, I recommend increasing irrigation for your tomato crops.",
      "Your soil moisture levels are optimal for planting. Consider adding nitrogen-rich fertilizer to field B.",
      "The humidity levels suggest potential fungal risk. Monitor your crops closely and consider preventive spraying.",
      "Your crop health indicators look excellent! Keep up the current care routine.",
      "I notice some sensors showing low battery. Please check and replace batteries for continuous monitoring."
    ];
    
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      confidence: 0.85,
      suggestions: ['Check soil moisture', 'Monitor weather forecast', 'Update irrigation schedule']
    };
  },

  // Get crop recommendations based on conditions
  getCropRecommendations: async (weatherData: any, soilData: any, location: string) => {
    // const response = await api.post('/ai/crop-recommendations', {
    //   weatherData,
    //   soilData,
    //   location
    // });
    // return response.data;
    
    // Using dummy data for now
    return [
      {
        crop: 'Maize',
        suitability: 'excellent',
        confidence: 0.92,
        reason: 'Optimal temperature and rainfall conditions',
        expectedYield: 4.5
      },
      {
        crop: 'Tomatoes',
        suitability: 'good',
        confidence: 0.78,
        reason: 'Good conditions but monitor humidity levels',
        expectedYield: 3.2
      }
    ];
  }
};

export default api;
