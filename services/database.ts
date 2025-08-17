import { createClient } from '@/utils/supabase/client'
import { createClient as createServerClient } from '@/utils/supabase/server'

// Types for our database tables
export interface Profile {
  id: string
  name: string | null
  location: string | null
  created_at: string
  updated_at: string
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

// Client-side database functions
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

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
    
    if (error) {
      console.error('Error updating profile:', error)
      return false
    }
    return true
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

  // Community posts functions
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

  async addCommunityPost(post: Omit<CommunityPost, 'id' | 'likes_count' | 'comments_count' | 'created_at' | 'updated_at'>): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('community_posts')
      .insert([post])
    
    if (error) {
      console.error('Error adding community post:', error)
      return false
    }
    return true
  },

  // Comments functions
  async getComments(postId: string): Promise<Comment[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          location
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching comments:', error)
      return []
    }
    return data || []
  },

  async addComment(comment: Omit<Comment, 'id' | 'created_at'>): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('comments')
      .insert([comment])
    
    if (error) {
      console.error('Error adding comment:', error)
      return false
    }
    return true
  },

  // Likes functions
  async toggleLike(postId: string, userId: string): Promise<boolean> {
    const supabase = createClient()
    
    // Check if like exists
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()
    
    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
      
      if (error) {
        console.error('Error removing like:', error)
        return false
      }
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: userId }])
      
      if (error) {
        console.error('Error adding like:', error)
        return false
      }
    }
    
    return true
  }
}

// Server-side database functions (for server components)
export const serverDb = {
  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = await createServerClient()
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
