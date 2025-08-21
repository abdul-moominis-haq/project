import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { profileService, cropService, farmService, communityService } from '@/services/database'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Getting profile for user:', user.id)

    // Get profile from database
    const profile = await profileService.getProfile(user.id)
    
    if (profile) {
      // Get additional stats
      const [crops, farms, posts] = await Promise.all([
        cropService.getCrops(undefined, user.id),
        farmService.getFarms(user.id),
        communityService.getPosts(100, 0) // Get user's posts
      ]);

      const userPosts = posts.filter((post: { user_id: any }) => post.user_id === user.id);
      const activeCrops = crops.filter((crop: { status: string }) => 
        ['planted', 'growing', 'flowering'].includes(crop.status)
      );

      return NextResponse.json({ profile });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      
      // If it's a database error, try to create a basic profile
      if (error?.message?.includes('PGRST116') || error?.code === 'PGRST116') {
        console.log('Profile not found, this should have been handled by getExtendedProfile');
        return NextResponse.json(
          { error: 'Profile not found and could not be created' },
          { status: 404 }
        );
      }
      
      throw error;
    }

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      location,
      phone,
      farm_name,
      farm_size,
      experience_years,
      specialization,
      bio,
      avatar_url,
      preferences
    } = body;

    const updates = {
      name,
      location,
      phone,
      farm_name,
      farm_size: farm_size ? parseFloat(farm_size) : null,
      experience_years: experience_years ? parseInt(experience_years) : null,
      specialization,
      bio,
      avatar_url,
      preferences
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof typeof updates] === undefined) {
        delete updates[key as keyof typeof updates];
      }
    });

    const success = await db.updateProfile(user.id, updates);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Fetch updated profile
    const updatedProfile = await db.getProfile(user.id);

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      location,
      phone,
      farm_name,
      farm_size,
      experience_years,
      specialization,
      bio,
      avatar_url,
      preferences
    } = body;

    const profileData = {
      id: user.id,
      email: user.email || '',
      name: name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      location,
      phone,
      farm_name,
      farm_size: farm_size ? parseFloat(farm_size) : null,
      experience_years: experience_years ? parseInt(experience_years) : null,
      specialization,
      bio,
      avatar_url,
      preferences: preferences || {}
    };

    const success = await db.createProfile(profileData);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    const profile = await db.getProfile(user.id);

    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
