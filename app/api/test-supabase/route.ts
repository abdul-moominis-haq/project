import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasAnonKey: !!supabaseAnonKey
        }
      }, { status: 500 });
    }

    // Test Supabase connection
    const supabase = await createClient();
    
    // Test auth connection
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Test database connection by trying to query profiles table
    const { data: profiles, error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      details: {
        url: supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        authWorking: !authError,
        databaseWorking: !dbError,
        currentUser: user?.id || 'No user authenticated',
        profilesTableExists: !dbError
      }
    });

  } catch (error: any) {
    console.error('Supabase connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Supabase connection failed',
      details: error.message
    }, { status: 500 });
  }
}