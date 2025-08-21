import { createClient } from '@/utils/supabase/client';
import { Post, Profile, CropType } from '@/types';

export const postService = {
  async getPosts(options?: { 
    limit?: number, 
    page?: number, 
    userId?: string,
    postType?: Post['post_type'],
    withProfile?: boolean,
    withCropType?: boolean,
    searchQuery?: string
  }): Promise<Post[]> {
    const supabase = createClient();
    
    try {
      let query = supabase
        .from('posts')
        .select(
          ['*']
            .concat(options?.withProfile ? ['profiles:profile(*)'] : [])
            .concat(options?.withCropType ? ['crop_types:crop_type(*)'] : [])
            .join(',')
        )
        .order('created_at', { ascending: false });
      
      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }
      
      if (options?.postType) {
        query = query.eq('post_type', options.postType);
      }
      
      if (options?.searchQuery) {
        query = query.or(`title.ilike.%${options.searchQuery}%,content.ilike.%${options.searchQuery}%`);
      }
      
      if (options?.limit) {
        const offset = (options.page || 0) * options.limit;
        query = query.range(offset, offset + options.limit - 1);
      }
      
      const { data, error } = await query as { data: Post[] | null, error: any };
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  async getPostById(id: string, options?: {
    withProfile?: boolean,
    withCropType?: boolean
  }): Promise<Post | null> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(
          ['*']
            .concat(options?.withProfile ? ['profiles:profile(*)'] : [])
            .concat(options?.withCropType ? ['crop_types:crop_type(*)'] : [])
            .join(',')
        )
        .eq('id', id)
        .single() as { data: Post | null, error: any };
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  },

  async createPost(postData: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'views_count'>): Promise<Post | null> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postData,
          likes_count: 0,
          comments_count: 0,
          views_count: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  },

  async updatePost(postId: string, updates: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<Post | null> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      return null;
    }
  },

  async deletePost(postId: string): Promise<boolean> {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  },

  async incrementViews(postId: string): Promise<boolean> {
    const supabase = createClient();
    
    try {
      const { error } = await supabase.rpc('increment_post_views', { post_id: postId });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error incrementing post views:', error);
      return false;
    }
  },

  async toggleLike(postId: string, userId: string): Promise<boolean> {
    const supabase = createClient();
    
    try {
      // First check if the user has already liked the post
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike the post
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;

        // Decrement likes count
        await supabase.rpc('decrement_post_likes', { post_id: postId });
      } else {
        // Like the post
        const { error: insertError } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: userId });

        if (insertError) throw insertError;

        // Increment likes count
        await supabase.rpc('increment_post_likes', { post_id: postId });
      }

      return true;
    } catch (error) {
      console.error('Error toggling post like:', error);
      return false;
    }
  },

  async isLikedByUser(postId: string, userId: string): Promise<boolean> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (error) return false;
      return !!data;
    } catch {
      return false;
    }
  },

  async getPostsByTag(tag: string, options?: {
    limit?: number,
    page?: number,
    withProfile?: boolean
  }): Promise<Post[]> {
    const supabase = createClient();
    
    try {
      let query = supabase
        .from('posts')
        .select(
          ['*']
            .concat(options?.withProfile ? ['profiles:profile(*)'] : [])
            .join(',')
        )
        .contains('tags', [tag])
        .order('created_at', { ascending: false });

      if (options?.limit) {
        const offset = (options.page || 0) * options.limit;
        query = query.range(offset, offset + options.limit - 1);
      }

      const { data, error } = await query as { data: Post[] | null, error: any };
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching posts by tag:', error);
      return [];
    }
  },

  async getTrendingPosts(limit: number = 5): Promise<Post[]> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('views_count', { ascending: false })
        .order('likes_count', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      return [];
    }
  }
};
