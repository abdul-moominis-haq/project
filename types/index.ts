// SmartAgri Database Types - Updated for Supabase Schema

export interface ProfilePreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    weather: boolean;
    harvest: boolean;
    community: boolean;
  };
  privacy: {
    profileVisibility: string;
    contact_info: string;
    activity_status: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
}

// Core Database types (Supabase)
export interface Profile {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  role?: 'farmer' | 'expert' | 'admin';
  location?: string | null;
  farm_name?: string | null;
  farm_size?: number | null;
  experience_years?: number | null;
  specialization?: string;  // PostgreSQL TEXT[] 
  bio?: string | null;
  profile_image?: string | null;
  verified?: boolean;
  preferences?: ProfilePreferences;
  created_at?: string;
  updated_at?: string;
}

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  total_area: number;
  soil_type?: string;
  irrigation_type?: string;
  elevation?: number;
  farm_type?: 'crop' | 'livestock' | 'mixed';
  created_at: string;
  updated_at: string;
}

export interface Field {
  id: string;
  farm_id: string;
  name: string;
  area: number;
  soil_ph?: number;
  field_boundaries?: any; // polygon coordinates
  field_type: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CropType {
  id: string;
  name: string;
  scientific_name?: string;
  category: string; // vegetable, fruit, grain, legume, etc.
  growing_season: string[];
  avg_growing_period?: number; // days
  water_requirements?: string;
  temperature_range?: {
    min: number;
    max: number;
    optimal: number;
  };
  spacing_requirements?: {
    row_spacing: number;
    plant_spacing: number;
  };
  harvest_indicators?: string[];
  common_diseases?: string[];
  common_pests?: string[];
  created_at: string;
}

export interface DatabaseCrop {
  id: string;
  field_id: string;
  crop_type_id: string;
  variety?: string;
  planting_date: string;
  expected_harvest_date?: string;
  actual_harvest_date?: string;
  quantity_planted?: number;
  quantity_harvested?: number;
  area_planted?: number;
  status: 'planned' | 'planted' | 'growing' | 'flowering' | 'harvesting' | 'harvested' | 'failed';
  health_score: number;
  growth_stage?: string;
  progress_percentage: number;
  notes?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
  // Joined data
  crop_type?: CropType;
  field?: Field;
}

export interface IoTDevice {
  id: string;
  field_id?: string;
  farm_id?: string;
  device_name: string;
  device_type: string; // soil_moisture, temperature, humidity, ph, light, etc.
  device_id: string;
  model?: string;
  manufacturer?: string;
  location?: {
    lat: number;
    lng: number;
    description: string;
  };
  battery_level: number;
  signal_strength: number;
  last_communication?: string;
  is_active: boolean;
  firmware_version?: string;
  installation_date: string;
  maintenance_schedule?: any;
  created_at: string;
  updated_at: string;
}

export interface SensorReading {
  id: string;
  device_id: string;
  reading_type: string;
  value: number;
  unit: string;
  quality_score: number;
  recorded_at: string;
}

export interface WeatherData {
  id: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  temperature?: number;
  humidity?: number;
  pressure?: number;
  wind_speed?: number;
  wind_direction?: number;
  precipitation?: number;
  uv_index?: number;
  weather_condition?: string;
  weather_code?: number;
  visibility?: number;
  cloud_cover?: number;
  recorded_at: string;
  source: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  post_type: 'question' | 'tip' | 'discussion' | 'showcase' | 'marketplace';
  tags?: string[];
  images?: string[];
  location?: any;
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_featured: boolean;
  is_published: boolean;
  crop_related?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  profile?: Profile;
  crop_type?: CropType;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  likes_count: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  profile?: Profile;
  replies?: Comment[];
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface CommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}

export interface Recommendation {
  id: string;
  user_id: string;
  farm_id?: string;
  field_id?: string;
  crop_id?: string;
  type: 'irrigation' | 'planting' | 'harvesting' | 'disease' | 'pest' | 'fertilizer';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  confidence_score?: number;
  data_sources?: any;
  action_required: boolean;
  is_acknowledged: boolean;
  acknowledged_at?: string;
  valid_until?: string;
  metadata?: any;
  created_at: string;
}

export interface WeatherAlert {
  id: string;
  user_id: string;
  location: any;
  alert_type: 'rain' | 'storm' | 'drought' | 'frost' | 'heat_wave';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  title: string;
  description: string;
  start_time: string;
  end_time?: string;
  is_active: boolean;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'recommendation' | 'weather_alert' | 'community' | 'system';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  weather_alerts: boolean;
  recommendation_notifications: boolean;
  community_notifications: boolean;
  data_sharing: boolean;
  location_sharing: boolean;
  profile_visibility: 'public' | 'friends' | 'private';
  measurement_units: 'metric' | 'imperial';
  language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

// Legacy types for compatibility (will be migrated)
export interface DatabaseCommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
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
  user_id: string;
  name: string;
  type: string;
  variety?: string;
  dateplanted?: string;
  expectedharvest?: string;
  stage?: string;
  health?: number;
  progress?: number;
  location?: string;
  area?: number;
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

// Weather prediction data format for AI recommendations
export interface WeatherPredictionData {
  Average_Relative_Humidity: number;
  Minimum_Temperature: number;
  Maximum_Temperature: number;
  Cloud_Cover: number;
  Station_Level_Pressure: number;
  Date: string;
}

// Extended weather prediction with additional fields if needed
export interface ExtendedWeatherPrediction extends WeatherPredictionData {
  location?: string;
  region?: string;
  predicted_rainfall?: number;
  weather_condition?: string;
  farming_recommendations?: string[];
}