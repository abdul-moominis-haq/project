// Test script to verify Supabase profile functionality
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testSupabaseConnection() {
  console.log('🔐 Testing Supabase Connection and Profile Functionality\n');

  // Test 1: Basic connection
  console.log('1. Testing basic Supabase connection...');
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Supabase environment variables not found');
    console.log('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey);
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client created successfully');

  // Test 2: Check if profiles table exists
  console.log('\n2. Testing profiles table access...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Profiles table error:', error.message);
      if (error.message.includes('permission denied')) {
        console.log('   This might be due to RLS policies - this is expected for anonymous access');
      }
    } else {
      console.log('✅ Profiles table accessible');
      console.log('   Found', data?.length || 0, 'profile(s)');
    }
  } catch (error) {
    console.log('❌ Profiles table test failed:', error.message);
  }

  // Test 3: Test with service role key (if available)
  if (supabaseServiceKey) {
    console.log('\n3. Testing with service role key...');
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
      const { data, error } = await adminSupabase
        .from('profiles')
        .select('id, name, created_at')
        .limit(5);
      
      if (error) {
        console.log('❌ Service role test failed:', error.message);
      } else {
        console.log('✅ Service role access working');
        console.log('   Found', data?.length || 0, 'profile(s)');
        if (data && data.length > 0) {
          console.log('   Sample profile IDs:', data.map(p => p.id.substring(0, 8) + '...'));
        }
      }
    } catch (error) {
      console.log('❌ Service role test error:', error.message);
    }
  } else {
    console.log('\n3. Service role key not found - skipping admin tests');
  }

  // Test 4: Test API endpoint
  console.log('\n4. Testing profile API endpoint...');
  try {
    const response = await fetch('http://localhost:3000/api/profile');
    console.log('   API Response status:', response.status);
    
    if (response.status === 401) {
      console.log('✅ API correctly returns 401 (Unauthorized) - this is expected without authentication');
    } else if (response.ok) {
      const data = await response.json();
      console.log('✅ API response:', data);
    } else {
      const error = await response.json();
      console.log('❌ API error:', error);
    }
  } catch (error) {
    console.log('❌ API test failed:', error.message);
    console.log('   Make sure the development server is running on port 3000');
  }

  // Test 5: Check table structure
  if (supabaseServiceKey) {
    console.log('\n5. Checking profiles table structure...');
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
      // Try to get table info by attempting a select with all expected columns
      const { data, error } = await adminSupabase
        .from('profiles')
        .select('id, name, location, phone, farm_name, farm_size, experience_years, specialization, bio, avatar_url, preferences, created_at, updated_at')
        .limit(1);
      
      if (error) {
        console.log('❌ Table structure test failed:', error.message);
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          console.log('   Some expected columns might be missing from the profiles table');
        }
      } else {
        console.log('✅ Profiles table structure looks correct');
      }
    } catch (error) {
      console.log('❌ Table structure test error:', error.message);
    }
  }

  console.log('\n🎯 Test Summary:');
  console.log('- If you see "permission denied" errors, that\'s normal for anonymous access');
  console.log('- The API should return 401 without authentication');
  console.log('- The important thing is that the connection works and tables exist');
  console.log('\n💡 Next steps:');
  console.log('1. Make sure your development server is running: npm run dev');
  console.log('2. Try logging in to the application to test authenticated access');
  console.log('3. Check the browser console for any client-side errors');
}

// Helper function to create a test user (for testing purposes only)
async function createTestProfile() {
  if (!supabaseServiceKey) {
    console.log('❌ Service role key required to create test profile');
    return;
  }

  console.log('\n🧪 Creating test profile...');
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Generate a test UUID (in real app, this would come from auth.users)
  const testUserId = '550e8400-e29b-41d4-a716-446655440000';
  
  try {
    const { data, error } = await adminSupabase
      .from('profiles')
      .upsert([{
        id: testUserId,
        name: 'Test User',
        location: 'Accra, Ghana',
        farm_name: 'Test Farm',
        specialization: 'Mixed Farming'
      }])
      .select();
    
    if (error) {
      console.log('❌ Failed to create test profile:', error.message);
    } else {
      console.log('✅ Test profile created/updated:', data);
    }
  } catch (error) {
    console.log('❌ Test profile creation error:', error.message);
  }
}

// Run tests
if (require.main === module) {
  testSupabaseConnection().then(() => {
    // Uncomment the line below if you want to create a test profile
    // return createTestProfile();
  }).catch(error => {
    console.error('Test suite failed:', error);
  });
}

module.exports = {
  testSupabaseConnection,
  createTestProfile
};
