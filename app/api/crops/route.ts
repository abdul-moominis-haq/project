import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cropService, cropTypeService } from '@/services/database'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const fieldId = searchParams.get('field_id')

    // Get crops for the user or specific field
    const crops = await cropService.getCrops(fieldId || undefined, user.id)
    
    return NextResponse.json({ crops })

  } catch (error) {
    console.error('Error in crops GET:', error)
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

    // Get the crop data from request body
    const cropData = await request.json()
    
    // Validate required fields
    if (!cropData.field_id || !cropData.crop_type_id || !cropData.planting_date) {
      return NextResponse.json({ 
        error: 'Missing required fields: field_id, crop_type_id, planting_date' 
      }, { status: 400 })
    }

    // Create crop
    const newCrop = await cropService.createCrop({
      field_id: cropData.field_id || '',
      crop_type_id: cropData.crop_type_id || 'dumm',
      variety: cropData.variety || '',
      planting_date: cropData.planting_date || '',
      expected_harvest_date: cropData.expected_harvest_date || '',
      quantity_planted: cropData.quantity_planted ? parseFloat(cropData.quantity_planted) : undefined,
      area_planted: cropData.area_planted ? parseFloat(cropData.area_planted) : undefined,
      status: cropData.status || 'planned',
      health_score: cropData.health_score || 100,
      growth_stage: cropData.growth_stage || '',
      progress_percentage: cropData.progress_percentage || 0,
      notes: cropData.notes || '',
      images: cropData.images || ''
    })

    if (newCrop) {
      return NextResponse.json({
        success: true,
        message: 'Crop created successfully',
        crop: newCrop
      })
    } else {
      return NextResponse.json({ error: 'Failed to create crop' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in crops POST:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
