import { createClient } from '@/utils/supabase/client';
import { createClient as createServerClient } from '@/utils/supabase/server';
import type { 
  Profile, 
  Farm, 
  Field, 
  CropType, 
  Crop, 
  IoTDevice, 
  CommunityPost} from '@/types';

// Profile Service
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = createClient();
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

  async createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .insert([profile]);
    
    if (error) {
      console.error('Error creating profile:', error);
      return false;
    }
    return true;
  },

  async updateProfile(userId: string, updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }
    return true;
  }
};

// Farm Service
export const farmService = {
  async getFarms(userId: string): Promise<Farm[]> {
    const supabase = createClient();
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

  async createFarm(farm: Omit<Farm, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('farms')
      .insert([farm]);
    
    if (error) {
      console.error('Error creating farm:', error);
      return false;
    }
    return true;
  },

  async updateFarm(farmId: string, updates: Partial<Farm>): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('farms')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', farmId);
    
    if (error) {
      console.error('Error updating farm:', error);
      return false;
    }
    return true;
  },

  async deleteFarm(farmId: string): Promise<boolean> {
    const supabase = createClient();
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

// Field Service
export const fieldService = {
  async getFields(farmId: string): Promise<Field[]> {
    const supabase = createClient();
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

  async getUserFields(userId: string): Promise<Field[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('fields')
      .select(`
        *,
        farms!inner (
          user_id
        )
      `)
      .eq('farms.user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user fields:', error);
      return [];
    }
    return data || [];
  },

  async createField(field: Omit<Field, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('fields')
      .insert([field]);
    
    if (error) {
      console.error('Error creating field:', error);
      return false;
    }
    return true;
  },

  async updateField(fieldId: string, updates: Partial<Field>): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('fields')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', fieldId);
    
    if (error) {
      console.error('Error updating field:', error);
      return false;
    }
    return true;
  },

  async deleteField(fieldId: string): Promise<boolean> {
    const supabase = createClient();
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

// Crop Type Service
export const cropTypeService = {
  async getCropTypes(): Promise<CropType[]> {
    const supabase = createClient();
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

  async getCropType(id: string): Promise<CropType | null> {
    const supabase = createClient();
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
  }
};

// Crop Service
export const cropService = {
  async getCrops(userId: string): Promise<Crop[]> {
    const supabase = createClient();
    
    // Get user's fields first
    const userFields = await fieldService.getUserFields(userId);
    if (!userFields.length) return [];
    
    const fieldIds = userFields.map((f: Field) => f.id);
    
    const { data, error } = await supabase
      .from('crops')
      .select(`
        *,
        crop_types (
          id,
          name,
          category,
          planting_season,
          harvest_season,
          growth_duration_days
        ),
        fields (
          id,
          name,
          size,
          farms (
            id,
            name
          )
        )
      `)
      .in('field_id', fieldIds)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching crops:', error);
      return [];
    }
    return data || [];
  },

  async createCrop(crop: Omit<Crop, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('crops')
      .insert([crop]);
    
    if (error) {
      console.error('Error creating crop:', error);
      return false;
    }
    return true;
  },

  async updateCrop(cropId: string, updates: Partial<Crop>): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('crops')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', cropId);
    
    if (error) {
      console.error('Error updating crop:', error);
      return false;
    }
    return true;
  },

  async deleteCrop(cropId: string): Promise<boolean> {
    const supabase = createClient();
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

// IoT Device Service
export const iotDeviceService = {
  async getDevices(userId: string): Promise<IoTDevice[]> {
    const supabase = createClient();
    
    // Get user's fields first
    const userFields = await fieldService.getUserFields(userId);
    if (!userFields.length) return [];
    
    const fieldIds = userFields.map((f: Field) => f.id);
    
    const { data, error } = await supabase
      .from('iot_devices')
      .select(`
        *,
        fields (
          id,
          name,
          farms (
            id,
            name
          )
        )
      `)
      .in('field_id', fieldIds)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching IoT devices:', error);
      return [];
    }
    return data || [];
  },

  async createDevice(device: Omit<IoTDevice, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('iot_devices')
      .insert([device]);
    
    if (error) {
      console.error('Error creating IoT device:', error);
      return false;
    }
    return true;
  },

  async updateDevice(deviceId: string, updates: Partial<IoTDevice>): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('iot_devices')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', deviceId);
    
    if (error) {
      console.error('Error updating IoT device:', error);
      return false;
    }
    return true;
  },

  async deleteDevice(deviceId: string): Promise<boolean> {
    const supabase = createClient();
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

// Community Service
export const communityService = {
  async getPosts(limit = 20): Promise<CommunityPost[]> {
    const supabase = createClient();
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
      .limit(limit);
    
    if (error) {
      console.error('Error fetching community posts:', error);
      return [];
    }
    return data || [];
  },

  async createPost(post: Omit<CommunityPost, 'id' | 'created_at' | 'updated_at' | 'likes' | 'comments'>): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('community_posts')
      .insert([{
        ...post,
        likes: 0,
        comments: 0
      }]);
    
    if (error) {
      console.error('Error creating community post:', error);
      return false;
    }
    return true;
  },

  async updatePost(postId: string, updates: Partial<CommunityPost>): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('community_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);
    
    if (error) {
      console.error('Error updating community post:', error);
      return false;
    }
    return true;
  },

  async deletePost(postId: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId);
    
    if (error) {
      console.error('Error deleting community post:', error);
      return false;
    }
    return true;
  }
};

// Legacy compatibility - keeping the old db export temporarily
export const db = {
  getProfile: profileService.getProfile,
  createProfile: profileService.createProfile,
  updateProfile: profileService.updateProfile,
};

// Server-side database functions that can only be used in API routes
export const serverDb = {
  async getExtendedProfile(userId: string): Promise<any> {
    try {
      const supabase = await createServerClient();
      
      // Get the user's auth data first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not found in auth:', userError);
        throw new Error('User not found in auth');
      }

      // Try to get existing profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        throw error;
      }

      // If no profile exists, create one
      if (!profile) {
        console.log('No profile found for user', userId, 'creating basic profile...');
        
        // Create basic profile with just the user ID
        const newProfile = {
          id: userId
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select('*')
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }

        // Return the newly created profile with empty stats
        const stats = {
          totalCrops: 0,
          activeCrops: 0,
          communityPosts: 0,
          joinDate: createdProfile.created_at
        };

        return {
          ...createdProfile,
          stats
        };
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
      ]);

      const stats = {
        totalCrops: cropsData.data?.length || 0,
        activeCrops: cropsData.data?.filter((c: any) => c.status === 'growing').length || 0,
        communityPosts: postsData.data?.length || 0,
        joinDate: profile.created_at
      };

      return {
        ...profile,
        stats
      };
    } catch (error) {
      console.error('Error in serverDb.getExtendedProfile:', error);
      throw error;
    }
  }
};
