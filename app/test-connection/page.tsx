import { createClient } from '@/utils/supabase/server'

export default async function TestConnection() {
  const supabase = await createClient()

  // Test the connection by attempting to fetch user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  // Test database connection
  let connectionTest = null;
  let connectionError = null;
  
  try {
    const { data, error } = await supabase
      .from('test')
      .select('*')
      .limit(1)
    
    if (error && error.code === '42P01') {
      connectionTest = 'Database connected successfully (table does not exist yet)'
    } else if (error) {
      connectionError = error.message
    } else {
      connectionTest = 'Database connected and table accessible'
    }
  } catch (err) {
    connectionError = 'Failed to connect to database'
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Supabase URL:</span>{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
            </p>
            <p>
              <span className="font-medium">Supabase Anon Key:</span>{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
            </p>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
          <div className="text-sm">
            {userError ? (
              <p className="text-red-600">❌ Auth Error: {userError.message}</p>
            ) : user ? (
              <p className="text-green-600">✅ User authenticated: {user.email}</p>
            ) : (
              <p className="text-yellow-600">⚠️ No user currently authenticated</p>
            )}
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Database Connection</h2>
          <div className="text-sm">
            {connectionError ? (
              <p className="text-red-600">❌ Connection Error: {connectionError}</p>
            ) : connectionTest ? (
              <p className="text-green-600">✅ {connectionTest}</p>
            ) : (
              <p className="text-yellow-600">⚠️ Testing connection...</p>
            )}
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Next Steps</h2>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Create your database tables in Supabase Dashboard</li>
            <li>Set up authentication (sign up/login pages)</li>
            <li>Configure Row Level Security (RLS) policies</li>
            <li>Start building your app features</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
