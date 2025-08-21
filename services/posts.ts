import { createClient } from "@/utils/supabase/client";

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getPosts(limit: number = 10, offset: number = 0) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
    return data as Post[];
  } catch (error) {
    console.error("Error in getPosts:", error);
    return [];
  }
}

export async function createPost(post: Omit<Post, "id" | "created_at" | "updated_at">) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from("posts")
      .insert([post])
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error);
      return null;
    }
    return data as Post;
  } catch (error) {
    console.error("Error in createPost:", error);
    return null;
  }
}

export async function updatePost(postId: string, updates: Partial<Post>) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from("posts")
      .update(updates)
      .eq("id", postId)
      .select()
      .single();

    if (error) {
      console.error("Error updating post:", error);
      return null;
    }
    return data as Post;
  } catch (error) {
    console.error("Error in updatePost:", error);
    return null;
  }
}

export async function deletePost(postId: string) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) {
      console.error("Error deleting post:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in deletePost:", error);
    return false;
  }
}

export async function getPostsByUser(userId: string, limit: number = 10) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching user posts:", error);
      return [];
    }
    return data as Post[];
  } catch (error) {
    console.error("Error in getPostsByUser:", error);
    return [];
  }
}
