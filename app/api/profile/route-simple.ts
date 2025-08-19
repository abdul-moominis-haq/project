import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Getting profile for user:', user.id)

    // Return basic user info without trying to access profiles table for now
    // This will help us test the authentication flow without database schema issues
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
        preferences: {},
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
