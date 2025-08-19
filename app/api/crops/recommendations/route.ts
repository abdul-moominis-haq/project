import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basic crop recommendations based on Ghana's agricultural zones
    const recommendations = [
      {
        id: '1',
        cropName: 'Maize',
        variety: 'Obatanpa',
        season: 'Major Season (March-July)',
        region: 'All regions',
        expectedYield: '3-4 tons/hectare',
        duration: '90-100 days',
        description: 'High-yielding variety suitable for all ecological zones in Ghana'
      },
      {
        id: '2',
        cropName: 'Rice',
        variety: 'Jasmine 85',
        season: 'Major Season (April-August)',
        region: 'Northern regions',
        expectedYield: '4-5 tons/hectare',
        duration: '120-130 days',
        description: 'Aromatic rice variety well-adapted to northern Ghana conditions'
      },
      {
        id: '3',
        cropName: 'Cassava',
        variety: 'Bankye Hmaa',
        season: 'Year-round',
        region: 'All regions',
        expectedYield: '15-20 tons/hectare',
        duration: '8-12 months',
        description: 'High-yielding cassava variety with good disease resistance'
      },
      {
        id: '4',
        cropName: 'Tomato',
        variety: 'Pectomech',
        season: 'Dry Season (November-March)',
        region: 'All regions with irrigation',
        expectedYield: '20-25 tons/hectare',
        duration: '75-85 days',
        description: 'Determinate variety suitable for processing and fresh market'
      }
    ];

    return NextResponse.json({
      success: true,
      data: recommendations,
      message: 'Crop recommendations retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching crop recommendations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch crop recommendations'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, soilType, season, farmSize } = body;

    // Simple recommendation logic based on input parameters
    let recommendations = [];

    if (location?.toLowerCase().includes('northern')) {
      recommendations.push({
        cropName: 'Millet',
        variety: 'Local variety',
        reason: 'Well-suited for northern Ghana climate',
        expectedYield: '1-2 tons/hectare'
      });
    }

    if (soilType?.toLowerCase().includes('clay')) {
      recommendations.push({
        cropName: 'Rice',
        variety: 'Jasmine 85',
        reason: 'Clay soil retains water well for rice cultivation',
        expectedYield: '4-5 tons/hectare'
      });
    }

    if (season?.toLowerCase().includes('dry')) {
      recommendations.push({
        cropName: 'Onion',
        variety: 'Red Creole',
        reason: 'Dry season crop with good market demand',
        expectedYield: '15-20 tons/hectare'
      });
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
      message: 'Personalized recommendations generated successfully'
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate recommendations'
      },
      { status: 500 }
    );
  }
}
