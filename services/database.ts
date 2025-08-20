// Supabase Database Service - Main API Interface
// services/database.ts

import { createClient } from '@/utils/supabase/client';
import type { 
  Profile, 
  Farm, 
  Field, 
  CropType, 
  DatabaseCrop, 
  IoTDevice, 
  SensorReading, 
  Post, 
  Comment, 
  Recommendation, 
  WeatherAlert, 
  Notification, 
  UserPreferences 
} from '@/types';

// Get supabase client
const supabase = createClient();

// Profile Services
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    console.log('Updating profile for user:', userId, 'with data:', updates);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        ...updates, 
        specialization: Array.isArray(updates.specialization) 
          ? updates.specialization 
          : [updates.specialization], // Ensure it's always an array
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      console.error('Update data that caused error:', updates);
      return null;
    }
    
    console.log('Profile updated successfully:', data);
    return data;
  },

  async createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }
    return data;
  }
};

// Farm Services
export const farmService = {
  async getFarms(userId: string): Promise<Farm[]> {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching farms:', error);
      return [];
    }
    return data || [];
  },

  async createFarm(farm: Omit<Farm, 'id' | 'created_at' | 'updated_at'>): Promise<Farm | null> {
    const { data, error } = await supabase
      .from('farms')
      .insert(farm)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating farm:', error);
      return null;
    }
    return data;
  },

  async updateFarm(farmId: string, updates: Partial<Farm>): Promise<Farm | null> {
    const { data, error } = await supabase
      .from('farms')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', farmId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating farm:', error);
      return null;
    }
    return data;
  },

  async deleteFarm(farmId: string): Promise<boolean> {
    const { error } = await supabase
      .from('farms')
      .delete()
      .eq('id', farmId);
    
    if (error) {
      console.error('Error deleting farm:', error);
      return false;
    }
    return true;
  }
};

// Field Services
export const fieldService = {
  async getFields(farmId: string): Promise<Field[]> {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching fields:', error);
      return [];
    }
    return data || [];
  },

  async createField(field: Omit<Field, 'id' | 'created_at' | 'updated_at'>): Promise<Field | null> {
    const { data, error } = await supabase
      .from('fields')
      .insert(field)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating field:', error);
      return null;
    }
    return data;
  },

  async updateField(fieldId: string, updates: Partial<Field>): Promise<Field | null> {
    const { data, error } = await supabase
      .from('fields')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', fieldId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating field:', error);
      return null;
    }
    return data;
  },

  async deleteField(fieldId: string): Promise<boolean> {
    const { error } = await supabase
      .from('fields')
      .delete()
      .eq('id', fieldId);
    
    if (error) {
      console.error('Error deleting field:', error);
      return false;
    }
    return true;
  }
};

// Crop Type Services
export const cropTypeService = {
  async getCropTypes(): Promise<CropType[]> {
    const { data, error } = await supabase
      .from('crop_types')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching crop types:', error);
      return [];
    }
    return data || [];
  },

  async getCropTypeById(id: string): Promise<CropType | null> {
    const { data, error } = await supabase
      .from('crop_types')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching crop type:', error);
      return null;
    }
    return data;
  },

  async searchCropTypes(query: string): Promise<CropType[]> {
    const { data, error } = await supabase
      .from('crop_types')
      .select('*')
      .or(`name.ilike.%${query}%,category.ilike.%${query}%,scientific_name.ilike.%${query}%`)
      .order('name');
    
    if (error) {
      console.error('Error searching crop types:', error);
      return [];
    }
    return data || [];
  }
};

// Crop Services
export const cropService = {
  async getCrops(fieldId?: string, userId?: string): Promise<DatabaseCrop[]> {
    let query = supabase
      .from('crops')
      .select(`
        *,
        crop_type:crop_types(*),
        field:fields(*)
      `)
      .order('created_at', { ascending: false });

    if (fieldId) {
      query = query.eq('field_id', fieldId);
    } else if (userId) {
      // Get crops for all user's fields
      const { data: farms, error: farmsError } = await supabase
        .from('farms')
        .select('id')
        .eq('user_id', userId);

      if (farmsError || !farms || farms.length === 0) {
        return [];
      }
      const farmIds = farms.map((f: { id: string }) => f.id);

      const { data: fields, error: fieldsError } = await supabase
        .from('fields')
        .select('id')
        .in('farm_id', farmIds);

      if (fieldsError || !fields || fields.length === 0) {
        return [];
      }
      const fieldIds = fields.map((f: { id: string }) => f.id);

      query = query.in('field_id', fieldIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching crops:', error);
      return [];
    }
    return data || [];
  },

  async createCrop(crop: Omit<DatabaseCrop, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseCrop | null> {
    const { data, error } = await supabase
      .from('crops')
      .insert(crop)
      .select(`
        *,
        crop_type:crop_types(*),
        field:fields(*)
      `)
      .single();
    
    if (error) {
      console.error('Error creating crop:', error);
      return null;
    }
    return data;
  },

  async updateCrop(cropId: string, updates: Partial<DatabaseCrop>): Promise<DatabaseCrop | null> {
    const { data, error } = await supabase
      .from('crops')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', cropId)
      .select(`
        *,
        crop_type:crop_types(*),
        field:fields(*)
      `)
      .single();
    
    if (error) {
      console.error('Error updating crop:', error);
      return null;
    }
    return data;
  },

  async deleteCrop(cropId: string): Promise<boolean> {
    const { error } = await supabase
      .from('crops')
      .delete()
      .eq('id', cropId);
    
    if (error) {
      console.error('Error deleting crop:', error);
      return false;
    }
    return true;
  }
};

// IoT Device Services
export const iotDeviceService = {
  async getDevices(farmId?: string, fieldId?: string, userId?: string): Promise<IoTDevice[]> {
    let query = supabase
      .from('iot_devices')
      .select('*')
      .order('created_at', { ascending: false });

    if (farmId) {
      query = query.eq('farm_id', farmId);
    }
    if (fieldId) {
      query = query.eq('field_id', fieldId);
    }
    if (userId) {
      // Get devices for all user's farms/fields
      const farms = await farmService.getFarms(userId);
      if (farms && farms.length > 0) {
        const farmIds = farms.map((f: Farm) => f.id);
        query = query.in('farm_id', farmIds);
      } else {
        return [];
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching IoT devices:', error);
      return [];
    }
    return data || [];
  },

  async createDevice(device: Omit<IoTDevice, 'id' | 'created_at' | 'updated_at'>): Promise<IoTDevice | null> {
    const { data, error } = await supabase
      .from('iot_devices')
      .insert(device)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating IoT device:', error);
      return null;
    }
    return data;
  },

  async updateDevice(deviceId: string, updates: Partial<IoTDevice>): Promise<IoTDevice | null> {
    const { data, error } = await supabase
      .from('iot_devices')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', deviceId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating IoT device:', error);
      return null;
    }
    return data;
  },

  async deleteDevice(deviceId: string): Promise<boolean> {
    const { error } = await supabase
      .from('iot_devices')
      .delete()
      .eq('id', deviceId);
    
    if (error) {
      console.error('Error deleting IoT device:', error);
      return false;
    }
    return true;
  }
};

// Community Services
export const communityService = {
  async getPosts(limit: number = 20, offset: number = 0): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profile:profiles(id, first_name, last_name, profile_image, verified),
        crop_type:crop_types(*)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
    return data || [];
  },

  async createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'views_count'>): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select(`
        *,
        profile:profiles(id, first_name, last_name, profile_image, verified)
      `)
      .single();
    
    if (error) {
      console.error('Error creating post:', error);
      return null;
    }
    return data;
  },

  async getComments(postId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles(id, first_name, last_name, profile_image, verified)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
    return data || [];
  },

  async createComment(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'likes_count'>): Promise<Comment | null> {
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select(`
        *,
        profile:profiles(id, first_name, last_name, profile_image, verified)
      `)
      .single();
    
    if (error) {
      console.error('Error creating comment:', error);
      return null;
    }
    return data;
  }
};

// Legacy compatibility - keeping the old db export temporarily
export const db = {
  getProfile: profileService.getProfile,
  createProfile: profileService.createProfile,
  updateProfile: profileService.updateProfile,
};
