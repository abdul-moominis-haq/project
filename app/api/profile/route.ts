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

      return NextResponse.json({
        profile: {
          ...profile,
          email: user.email,
          stats: {
            totalCrops: crops.length,
            activeCrops: activeCrops.length,
            totalFarms: farms.length,
            communityPosts: userPosts.length,
            farmEfficiency: profile.experience_years ? Math.min(95, 60 + profile.experience_years * 2) : 75,
            joinDate: profile.created_at || user.created_at
          }
        }
      })
    }

    // No profile found, return default profile
    console.log('No profile in database, returning default profile for user:', user.id)
    return NextResponse.json({
      profile: {
        id: user.id,
        email: user.email,
        first_name: user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User',
        last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        role: 'farmer',
        created_at: user.created_at,
        updated_at: user.created_at,
        // Default values
        phone: null,
        profile_image: null,
        farm_name: null,
        farm_size: null,
        location: null,
        bio: null,
        experience_years: 0,
        specialization: [],
        verified: false,
        stats: {
          totalCrops: 0,
          activeCrops: 0,
          totalFarms: 0,
          communityPosts: 0,
          farmEfficiency: 75,
          joinDate: user.created_at
        }
      }
    })

  } catch (error) {
    console.error('Error in profile GET:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Updating profile for user:', user.id)

    // Get the update data from request body
    const updateData = await request.json()
    
    // Validate the data (basic validation)
    const allowedFields = [
      'first_name', 'last_name', 'phone', 'farm_name', 'farm_size', 
      'experience_years', 'specialization', 'bio', 'location',
      'profile_image', 'role'
    ]
    
    // Filter out any fields not in the allowed list
    const filteredData: any = {}
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key]
      }
    })

    // Convert numeric fields
    if (filteredData.farm_size) {
      filteredData.farm_size = parseFloat(filteredData.farm_size) || null
    }
    if (filteredData.experience_years) {
      filteredData.experience_years = parseInt(filteredData.experience_years) || null
    }

    // Ensure email is set
    filteredData.email = user.email

    // Update profile using the database service
    const updatedProfile = await profileService.updateProfile(user.id, filteredData)

    if (updatedProfile) {
      // Get additional stats for the response
      const [crops, farms] = await Promise.all([
        cropService.getCrops(undefined, user.id),
        farmService.getFarms(user.id)
      ]);

      const activeCrops = crops.filter(crop => 
        ['planted', 'growing', 'flowering'].includes(crop.status)
      );

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        profile: {
          ...updatedProfile,
          email: user.email,
          stats: {
            totalCrops: crops.length,
            activeCrops: activeCrops.length,
            totalFarms: farms.length,
            farmEfficiency: updatedProfile.experience_years ? Math.min(95, 60 + updatedProfile.experience_years * 2) : 75,
            joinDate: updatedProfile.created_at || user.created_at
          }
        }
      })
    } else {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in profile PUT:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
