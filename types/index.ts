export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
}

// Database types (Supabase)
export interface Profile {
  id: string
  name: string | null
  location: string | null
  created_at: string
  updated_at: string
}

export interface DatabaseCrop {
  id: string
  user_id: string
  name: string
  type: string
  planting_date: string | null
  expected_harvest: string | null
  status: string
  notes: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface WeatherData {
  id: string
  user_id: string
  location: string
  temperature: number | null
  humidity: number | null
  precipitation: number | null
  wind_speed: number | null
  recorded_at: string
  created_at: string
}

export interface DatabaseCommunityPost {
  id: string
  user_id: string
  title: string
  content: string
  image_url: string | null
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: Profile
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