import { createClient } from '@/utils/supabase/client';
import { Farm } from '@/types';

/**
 * Farm Service - Handles all farm-related operations
 */
export const farmService = {
  /**
   * Get all farms for a specific user
   */
  async getFarms(userId: string): Promise<Farm[]> {
    const supabase = createClient();
    
    try {
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
    } catch (error) {
      console.error('Error in getFarms:', error);
      return [];
    }
  },

  /**
   * Get a specific farm by ID
   */
  async getFarmById(farmId: string): Promise<Farm | null> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('id', farmId)
        .single();
      
      if (error) {
        console.error('Error fetching farm:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error in getFarmById:', error);
      return null;
    }
  },

  /**
   * Create a new farm
   */
  async createFarm(farmData: Omit<Farm, 'id' | 'created_at' | 'updated_at'>): Promise<Farm | null> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('farms')
        .insert([{
          ...farmData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating farm:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error in createFarm:', error);
      return null;
    }
  },

  /**
   * Update an existing farm
   */
  async updateFarm(farmId: string, updates: Partial<Omit<Farm, 'id' | 'created_at' | 'updated_at'>>): Promise<Farm | null> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('farms')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', farmId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating farm:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error in updateFarm:', error);
      return null;
    }
  },

  /**
   * Delete a farm
   */
  async deleteFarm(farmId: string): Promise<boolean> {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', farmId);
      
      if (error) {
        console.error('Error deleting farm:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in deleteFarm:', error);
      return false;
    }
  },

  /**
   * Search farms by name or location
   */
  async searchFarms(userId: string, query: string): Promise<Farm[]> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error searching farms:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error in searchFarms:', error);
      return [];
    }
  },

  /**
   * Get total farm area for a user
   */
  async getTotalFarmArea(userId: string): Promise<number> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('size')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error calculating total farm area:', error);
        return 0;
      }
      
      return data.reduce((total, farm) => total + (farm.size || 0), 0);
    } catch (error) {
      console.error('Error in getTotalFarmArea:', error);
      return 0;
    }
  }
};
