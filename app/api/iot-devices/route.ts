import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { iotDeviceService } from '@/services/database'

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
    const farmId = searchParams.get('farm_id')
    const fieldId = searchParams.get('field_id')

    // Get devices for the user
    const devices = await iotDeviceService.getDevices(farmId || undefined, fieldId || undefined, user.id)
    
    return NextResponse.json({ devices })

  } catch (error) {
    console.error('Error in iot-devices GET:', error)
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

    // Get the device data from request body
    const deviceData = await request.json()
    
    // Validate required fields
    if (!deviceData.device_name || !deviceData.device_type || !deviceData.device_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: device_name, device_type, device_id' 
      }, { status: 400 })
    }

    // Create device
    const newDevice = await iotDeviceService.createDevice({
      field_id: deviceData.field_id,
      farm_id: deviceData.farm_id,
      device_name: deviceData.device_name,
      device_type: deviceData.device_type,
      device_id: deviceData.device_id,
      model: deviceData.model,
      manufacturer: deviceData.manufacturer,
      location: deviceData.location,
      battery_level: deviceData.battery_level || 100,
      signal_strength: deviceData.signal_strength || 100,
      is_active: deviceData.is_active !== false,
      firmware_version: deviceData.firmware_version,
      installation_date: deviceData.installation_date || new Date().toISOString().split('T')[0],
      maintenance_schedule: deviceData.maintenance_schedule
    })

    if (newDevice) {
      return NextResponse.json({
        success: true,
        message: 'IoT device created successfully',
        device: newDevice
      })
    } else {
      return NextResponse.json({ error: 'Failed to create IoT device' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in iot-devices POST:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
