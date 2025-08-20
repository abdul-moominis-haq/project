import { NextRequest, NextResponse } from 'next/server'
import { cropTypeService } from '@/services/database'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let cropTypes
    if (search) {
      cropTypes = await cropTypeService.searchCropTypes(search)
    } else {
      cropTypes = await cropTypeService.getCropTypes()
    }
    
    return NextResponse.json({ cropTypes })

  } catch (error) {
    console.error('Error in crop-types GET:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
