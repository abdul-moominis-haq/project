export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
}

export interface Weather {
  temperature: number;
  humidity: number;
  rainfall: number;
  condition: string;
  icon: string;
}

export interface WeatherForecast extends Weather {
  date: string;
}

export interface Crop {
  id: string;
  name: string;
  type: string;
  datePlanted: string;
  expectedHarvest: string;
  stage: string;
  health: number;
  progress: number;
  location: string;
  variety: string;
  area: number;
}

export interface Advisory {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

export interface CommunityPost {
  id: string;
  author: string;
  content: string;
  date: string;
  likes: number;
  replies: Reply[];
  tags: string[];
}

export interface Reply {
  id: string;
  author: string;
  content: string;
  date: string;
  likes: number;
}

export interface IoTSensor {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  location: string;
  lastReading: {
    timestamp: string;
    value: number;
    unit: string;
  };
  batteryLevel: number;
}

export interface WeatherHistoricalData {
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
}