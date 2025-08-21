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
        .from("farms")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching farms:", error);
        return [];
      }
      return data as Farm[];
    } catch (error) {
      console.error("Error in getFarms:", error);
      return [];
    }
  }
};

export async function createFarm(
  farm: Omit<Farm, "id" | "created_at" | "updated_at">
): Promise<Farm | null> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from("farms")
      .insert(farm)
      .select()
      .single();

    if (error) {
      console.error("Error creating farm:", error);
      return null;
    }
    return data as Farm;
  } catch (error) {
    console.error("Error in createFarm:", error);
    return null;
  }
}

export async function updateFarm(farmId: string, updates: Partial<Farm>) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from("farms")
      .update(updates)
      .eq("id", farmId)
      .select()
      .single();

    if (error) {
      console.error("Error updating farm:", error);
      return null;
    }
    return data as Farm;
  } catch (error) {
    console.error("Error in updateFarm:", error);
    return null;
  }
}

export async function deleteFarm(farmId: string) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from("farms")
      .delete()
      .eq("id", farmId);

    if (error) {
      console.error("Error deleting farm:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in deleteFarm:", error);
    return false;
  }
}

