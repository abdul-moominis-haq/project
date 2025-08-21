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

    // Fallback to mock data if no profile in database
    console.log('No profile in database, returning default profile for user:', user.id)
    return NextResponse.json({
      profile: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        created_at: user.created_at,
        // Mock data for now
        location: null,
        phone: null,
        farm_name: null,
        farm_size: null,
        experience_years: null,
        specialization: null,
        bio: null,
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true,
            weather: true,
            harvest: true,
            community: false
          },
          privacy: {
            profileVisibility: 'public',
            contact_info: 'friends',
            activity_status: true
          }
        },
        stats: {
          totalCrops: 0,
          activeCrops: 0,
          communityPosts: 0,
          joinDate: user.created_at
        }
      }
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    
    console.log('Received update data:', updateData)
    
    // Validate the data (basic validation)
    const allowedFields = [
      'first_name', 'last_name', 'name', 'phone', 'farm_name', 'farm_size', 
      'experience_years', 'specialization', 'bio', 'location',
      'profile_image', 'avatar_url', 'role', 'preferences'
    ]
    
    // Filter out any fields not in the allowed list and handle field mapping
    const filteredData: any = {}
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        // Handle field mapping for compatibility
        if (key === 'name' && updateData[key]) {
          // Split name into first_name and last_name if it's a full name
          const nameParts = updateData[key].trim().split(' ')
          filteredData.first_name = nameParts[0] || ''
          filteredData.last_name = nameParts.slice(1).join(' ') || ''
        } else if (key === 'avatar_url') {
          // Map avatar_url to profile_image
          filteredData.profile_image = updateData[key]
        } else {
          filteredData[key] = updateData[key]
        }
      }
    })

    // Convert numeric fields
    // Convert numeric fields safely
if (filteredData.farm_size !== undefined) {
  filteredData.farm_size = filteredData.farm_size === '' 
    ? null 
    : parseFloat(filteredData.farm_size);
}

if (filteredData.experience_years !== undefined) {
  filteredData.experience_years = filteredData.experience_years === '' 
    ? null 
    : parseInt(filteredData.experience_years);
}


    // Update profile using the database service
    console.log('Filtered data to update:', filteredData)
    
    // First check if profile exists
    const existingProfile = await profileService.getProfile(user.id)
    
    let updatedProfile;
    if (!existingProfile) {
      console.log('No existing profile found, creating new profile')
      // Create a new profile if it doesn't exist
      const newProfileData = {
        id: user.id,
        email: user.email || '',
        first_name: filteredData.first_name || '',
        last_name: filteredData.last_name || '',
        role: 'farmer' as const,
        verified: false,
        experience_years: filteredData.experience_years || 0,
        ...filteredData
      }
      updatedProfile = await profileService.createProfile(newProfileData)
    } else {
      console.log('Updating existing profile')
      updatedProfile = await profileService.updateProfile(user.id, filteredData)
    }

    console.log('Profile operation result:', updatedProfile)

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
