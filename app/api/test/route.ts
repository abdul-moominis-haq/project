import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'Test API endpoint working',
    timestamp: new Date().toISOString()
  });
}
