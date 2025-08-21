import { createClient } from '@/utils/supabase/client';
import { Profile, Farm, Post, Comment } from '@/types';
import {ProfilePreferences} from '@/database/index';
export const profileService = {
  async getProfile(userId: string, options?: {
    includeFarms?: boolean,
    includePosts?: boolean,
    includeComments?: boolean
  }): Promise<Profile | null> {
    const supabase = createClient();
    
    try {
      let query = supabase
        .from('profiles')
        .select([
          '*',
          ...(options?.includeFarms ? ['farms(*)'] : []),
          ...(options?.includePosts ? ['posts(*)'] : []),
          ...(options?.includeComments ? ['comments(*)'] : [])
        ].join(','))
        .eq('id', userId)
        .single();
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as unknown as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  async updateProfile(
    userId: string, 
    updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Profile | null> {
    const supabase = createClient();
    
    try {
      // Validate phone number format if provided
      if (updates.phone && !this.isValidPhoneNumber(updates.phone)) {
        throw new Error('Invalid phone number format');
      }

      // Validate experience years if provided
      if (updates.experience_years && updates.experience_years < 0) {
        throw new Error('Experience years cannot be negative');
      }

      // Validate farm size if provided
      if (updates.farm_size && updates.farm_size <= 0) {
        throw new Error('Farm size must be greater than 0');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  },

  async setPreferences(
    userId: string, 
    preferences: ProfilePreferences
  ): Promise<Profile | null> {
    const supabase = createClient();
    
    try {
      // Validate preference settings
      if (!this.isValidPreferences(preferences)) {
        throw new Error('Invalid preferences format');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error setting preferences:', error);
      return null;
    }
  },

  async updateLocation(
    userId: string,
    location: { lat: number; lng: number; address: string }
  ): Promise<Profile | null> {
    const supabase = createClient();
    
    try {
      // Validate coordinates
      if (!this.isValidCoordinates(location.lat, location.lng)) {
        throw new Error('Invalid coordinates');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          location,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating location:', error);
      return null;
    }
  },

  async updateProfileImage(
    userId: string,
    imageUrl: string
  ): Promise<Profile | null> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          avatar_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile image:', error);
      return null;
    }
  },

  async getProfileStats(userId: string): Promise<{
    totalPosts: number;
    totalComments: number;
    totalFarms: number;
    totalLikes: number;
  } | null> {
    const supabase = createClient();
    
    try {
      const [posts, comments, farms, likes] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('comments').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('farms').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('post_likes').select('id', { count: 'exact' }).eq('user_id', userId)
      ]);

      return {
        totalPosts: posts.count || 0,
        totalComments: comments.count || 0,
        totalFarms: farms.count || 0,
        totalLikes: likes.count || 0
      };
    } catch (error) {
      console.error('Error fetching profile stats:', error);
      return null;
    }
  },

  async searchProfiles(query: string, options?: {
    limit?: number;
    page?: number;
    specialization?: string[];
  }): Promise<Profile[]> {
    const supabase = createClient();
    
    try {
      let dbQuery = supabase
        .from('profiles')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,farm_name.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (options?.specialization?.length) {
        dbQuery = dbQuery.contains('specialization', options.specialization);
      }

      if (options?.limit) {
        const offset = (options.page || 0) * options.limit;
        dbQuery = dbQuery.range(offset, offset + options.limit - 1);
      }

      const { data, error } = await dbQuery;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching profiles:', error);
      return [];
    }
  },

  // Utility methods for validation
  isValidPhoneNumber(phone: string): boolean {
    // Basic phone validation - can be enhanced based on requirements
    return /^\+?[\d\s-]{10,}$/.test(phone);
  },

  isValidCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  },

  isValidPreferences(preferences: ProfilePreferences): boolean {
    // Add validation logic based on your requirements
    if (!preferences) return false;
    
    // Check for required properties
    const hasRequiredProps = 
      preferences.notifications &&
      preferences.privacy &&
      typeof preferences.notifications.weather === 'boolean' &&
      typeof preferences.notifications.harvest === 'boolean' &&
      typeof preferences.notifications.community === 'boolean' &&
      typeof preferences.privacy.profileVisibility === 'string' &&
      typeof preferences.privacy.contact_info === 'string' &&
      typeof preferences.privacy.activity_status === 'boolean';

    return hasRequiredProps;
  }
};
