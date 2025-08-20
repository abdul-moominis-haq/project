import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { farmService } from '@/services/database'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get farms for the user
    const farms = await farmService.getFarms(user.id)
    
    return NextResponse.json({ farms })

  } catch (error) {
    console.error('Error in farms GET:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get the farm data from request body
    const farmData = await request.json()
    
    // Validate required fields
    if (!farmData.name || !farmData.location || !farmData.total_area) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, location, total_area' 
      }, { status: 400 })
    }

    // Create farm
    const newFarm = await farmService.createFarm({
      user_id: user.id,
      name: farmData.name,
      description: farmData.description,
      location: farmData.location,
      total_area: parseFloat(farmData.total_area),
      soil_type: farmData.soil_type,
      irrigation_type: farmData.irrigation_type,
      elevation: farmData.elevation ? parseInt(farmData.elevation) : undefined,
      farm_type: farmData.farm_type || 'crop'
    })

    if (newFarm) {
      return NextResponse.json({
        success: true,
        message: 'Farm created successfully',
        farm: newFarm
      })
    } else {
      return NextResponse.json({ error: 'Failed to create farm' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in farms POST:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
