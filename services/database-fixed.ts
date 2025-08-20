import { createClient } from '@/utils/supabase/client'
import { createClient as createServerClient } from '@/utils/supabase/server'

// Types for our database tables
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
  preferences?: {
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
  };
  created_at?: string;
  updated_at?: string;
}
export interface Crop {
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

export interface CommunityPost {
  id: string
  user_id: string
  title: string
  content: string
  image_url: string | null
  likes: number
  comments: number
  created_at: string
  updated_at: string
}

// Database service object
export const db = {
  // Profile functions
  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return data
  },

  async createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .insert([profile])
    
    if (error) {
      console.error('Error creating profile:', error)
      return false
    }
    return true
  },

  async updateProfile(userId: string, updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) {
      console.error('Error updating profile:', error)
      return false
    }
    return true
  },

  // Server-side profile functions
  async getExtendedProfile(userId: string): Promise<any> {
    // For client-side, we should use the API endpoint instead of direct database access
    // This ensures proper authentication and authorization
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        return data.profile;
      } else {
        console.error('Failed to fetch profile from API:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching profile via API:', error);
      return null;
    }
  },

  // Crop functions
  async getCrops(userId: string): Promise<Crop[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching crops:', error)
      return []
    }
    return data || []
  },

  async addCrop(crop: Omit<Crop, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('crops')
      .insert([crop])
    
    if (error) {
      console.error('Error adding crop:', error)
      return false
    }
    return true
  },

  async updateCrop(cropId: string, updates: Partial<Crop>): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('crops')
      .update(updates)
      .eq('id', cropId)
    
    if (error) {
      console.error('Error updating crop:', error)
      return false
    }
    return true
  },

  async deleteCrop(cropId: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('crops')
      .delete()
      .eq('id', cropId)
    
    if (error) {
      console.error('Error deleting crop:', error)
      return false
    }
    return true
  },

  // Weather data functions
  async addWeatherData(weatherData: Omit<WeatherData, 'id' | 'created_at'>): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('weather_data')
      .insert([weatherData])
    
    if (error) {
      console.error('Error adding weather data:', error)
      return false
    }
    return true
  },

  async getWeatherData(userId: string, limit = 10): Promise<WeatherData[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('weather_data')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching weather data:', error)
      return []
    }
    return data || []
  },

  // Community functions
  async getCommunityPosts(limit = 20): Promise<CommunityPost[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          location
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching community posts:', error)
      return []
    }
    return data || []
  },

  async createCommunityPost(post: Omit<CommunityPost, 'id' | 'created_at' | 'updated_at' | 'likes' | 'comments'>): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('community_posts')
      .insert([{
        ...post,
        likes: 0,
        comments: 0
      }])
    
    if (error) {
      console.error('Error creating community post:', error)
      return false
    }
    return true
  }
}

// Server-side database functions that can only be used in API routes
export const serverDb = {
  async getExtendedProfile(userId: string): Promise<any> {
    try {
      const supabase = await createServerClient()
      
      // Get the user's auth data first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('User not found in auth:', userError)
        throw new Error('User not found in auth')
      }

      // Try to get existing profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        throw error
      }

      // If no profile exists, create one
      if (!profile) {
        console.log('No profile found for user', userId, 'creating basic profile...')
        
        // Create basic profile with just the user ID
        // The name and other details will be filled in when the user edits their profile
        const newProfile = {
          id: userId,
          name: 'New User', // Default name
          location: null,
          phone: null,
          farm_name: null,
          farm_size: null,
          experience_years: null,
          specialization: null,
          bio: null,
          preferences: {}
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select('*')
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
          throw createError
        }

        // Return the newly created profile with empty stats
        const stats = {
          totalCrops: 0,
          activeCrops: 0,
          communityPosts: 0,
          joinDate: createdProfile.created_at
        }

        return {
          ...createdProfile,
          stats
        }
      }

      // Get user stats for existing profile
      const [cropsData, postsData] = await Promise.all([
        supabase
          .from('crops')
          .select('id, status')
          .eq('user_id', userId),
        supabase
          .from('community_posts')
          .select('id')
          .eq('user_id', userId)
      ])

      const stats = {
        totalCrops: cropsData.data?.length || 0,
        activeCrops: cropsData.data?.filter((c: any) => c.status === 'growing').length || 0,
        communityPosts: postsData.data?.length || 0,
        joinDate: profile.created_at
      }

      return {
        ...profile,
        stats
      }
    } catch (error) {
      console.error('Error in serverDb.getExtendedProfile:', error)
      throw error
    }
  },

  async getCrops(userId: string): Promise<Crop[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching crops:', error)
      return []
    }
    return data || []
  },

  async getCommunityPosts(limit = 20): Promise<CommunityPost[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          location
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching community posts:', error)
      return []
    }
    return data || []
  }
}
