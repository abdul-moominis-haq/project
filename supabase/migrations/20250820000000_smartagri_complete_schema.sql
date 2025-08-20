-- SmartAgri Complete Database Schema for Supabase
-- Migration: 20250820000000_smartagri_complete_schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful in production)
DROP TABLE IF EXISTS public.comment_likes CASCADE;
DROP TABLE IF EXISTS public.post_likes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.weather_alerts CASCADE;
DROP TABLE IF EXISTS public.recommendations CASCADE;
DROP TABLE IF EXISTS public.sensor_readings CASCADE;
DROP TABLE IF EXISTS public.iot_devices CASCADE;
DROP TABLE IF EXISTS public.weather_data CASCADE;
DROP TABLE IF EXISTS public.crops CASCADE;
DROP TABLE IF EXISTS public.crop_types CASCADE;
DROP TABLE IF EXISTS public.fields CASCADE;
DROP TABLE IF EXISTS public.farms CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;

-- Update profiles table to match new schema
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS farm_name TEXT,
ADD COLUMN IF NOT EXISTS farm_size DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS location JSONB,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS specialization TEXT[],
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- Farms table
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    location JSONB NOT NULL, -- {lat, lng, address}
    total_area DECIMAL(10,2) NOT NULL,
    soil_type TEXT,
    irrigation_type TEXT,
    elevation INTEGER,
    farm_type TEXT, -- crop, livestock, mixed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fields within farms
CREATE TABLE IF NOT EXISTS public.fields (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    area DECIMAL(10,2) NOT NULL,
    soil_ph DECIMAL(3,1),
    field_boundaries JSONB, -- polygon coordinates
    field_type TEXT DEFAULT 'crop',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crop types reference table
CREATE TABLE IF NOT EXISTS public.crop_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    scientific_name TEXT,
    category TEXT NOT NULL, -- vegetable, fruit, grain, legume, etc.
    growing_season TEXT[],
    avg_growing_period INTEGER, -- days
    water_requirements TEXT,
    temperature_range JSONB, -- {min, max, optimal}
    spacing_requirements JSONB, -- {row_spacing, plant_spacing}
    harvest_indicators TEXT[],
    common_diseases TEXT[],
    common_pests TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crops table
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE NOT NULL,
    crop_type_id UUID REFERENCES public.crop_types(id) NOT NULL,
    variety TEXT,
    planting_date DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    quantity_planted DECIMAL(10,2),
    quantity_harvested DECIMAL(10,2),
    area_planted DECIMAL(8,2),
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'planted', 'growing', 'flowering', 'harvesting', 'harvested', 'failed')),
    health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
    growth_stage TEXT,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    notes TEXT,
    images TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IoT Devices table
CREATE TABLE IF NOT EXISTS public.iot_devices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL, -- soil_moisture, temperature, humidity, ph, light, etc.
    device_id TEXT UNIQUE NOT NULL,
    model TEXT,
    manufacturer TEXT,
    location JSONB, -- {lat, lng, description}
    battery_level INTEGER DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
    signal_strength INTEGER DEFAULT 100 CHECK (signal_strength >= 0 AND signal_strength <= 100),
    last_communication TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    firmware_version TEXT,
    installation_date DATE DEFAULT CURRENT_DATE,
    maintenance_schedule JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sensor readings (time-series data)
CREATE TABLE IF NOT EXISTS public.sensor_readings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_id UUID REFERENCES public.iot_devices(id) ON DELETE CASCADE NOT NULL,
    reading_type TEXT NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    unit TEXT NOT NULL,
    quality_score INTEGER DEFAULT 100 CHECK (quality_score >= 0 AND quality_score <= 100),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weather data table
CREATE TABLE IF NOT EXISTS public.weather_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location JSONB NOT NULL, -- {lat, lng, name}
    temperature DECIMAL(5,2),
    humidity INTEGER,
    pressure DECIMAL(7,2),
    wind_speed DECIMAL(5,2),
    wind_direction INTEGER,
    precipitation DECIMAL(5,2),
    uv_index INTEGER,
    weather_condition TEXT,
    weather_code INTEGER,
    visibility DECIMAL(5,2),
    cloud_cover INTEGER,
    recorded_at TIMESTAMPTZ NOT NULL,
    source TEXT DEFAULT 'open-meteo'
);

-- Community posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT DEFAULT 'discussion' CHECK (post_type IN ('question', 'tip', 'discussion', 'showcase', 'marketplace')),
    tags TEXT[],
    images TEXT[],
    location JSONB,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    crop_related UUID REFERENCES public.crop_types(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(post_id, user_id)
);

-- Comment likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(comment_id, user_id)
);

-- AI Recommendations table
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- irrigation, planting, harvesting, disease, pest, fertilizer
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
    data_sources JSONB, -- what data was used for the recommendation
    action_required BOOLEAN DEFAULT FALSE,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weather alerts table
CREATE TABLE IF NOT EXISTS public.weather_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    location JSONB NOT NULL,
    alert_type TEXT NOT NULL, -- rain, storm, drought, frost, heat_wave
    severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'severe', 'extreme')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- recommendation, weather_alert, community, system
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    weather_alerts BOOLEAN DEFAULT TRUE,
    recommendation_notifications BOOLEAN DEFAULT TRUE,
    community_notifications BOOLEAN DEFAULT TRUE,
    data_sharing BOOLEAN DEFAULT FALSE,
    location_sharing BOOLEAN DEFAULT TRUE,
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
    measurement_units TEXT DEFAULT 'metric' CHECK (measurement_units IN ('metric', 'imperial')),
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING GIN(location);
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_farms_location ON public.farms USING GIN(location);
CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON public.fields(farm_id);
CREATE INDEX IF NOT EXISTS idx_crops_field_id ON public.crops(field_id);
CREATE INDEX IF NOT EXISTS idx_crops_status ON public.crops(status);
CREATE INDEX IF NOT EXISTS idx_crops_planting_date ON public.crops(planting_date);
CREATE INDEX IF NOT EXISTS idx_iot_devices_farm_id ON public.iot_devices(farm_id);
CREATE INDEX IF NOT EXISTS idx_iot_devices_field_id ON public.iot_devices(field_id);
CREATE INDEX IF NOT EXISTS idx_iot_devices_type ON public.iot_devices(device_type);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_time ON public.sensor_readings(device_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_type_time ON public.sensor_readings(reading_type, recorded_at);
CREATE INDEX IF NOT EXISTS idx_weather_location_time ON public.weather_data USING GIN(location);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON public.posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_type ON public.recommendations(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
