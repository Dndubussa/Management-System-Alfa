// Vercel serverless function for authentication
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Auth request received:', {
      method: req.method,
      headers: req.headers,
      bodyType: typeof req.body,
      body: req.body
    });
    
    // In Vercel functions, the body should already be parsed if Content-Type is application/json
    // But let's add some defensive parsing
    let body = req.body;
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch (parseError) {
        console.error('❌ Error parsing request body:', parseError);
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    }
    
    const { createClient } = await import('@supabase/supabase-js');
    
    // Try to get environment variables - Vercel functions need non-VITE variables
    // But we'll fallback to VITE variables for compatibility
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('🔍 Auth environment variables check:');
    console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
    console.log('VITE_SUPABASE_KEY:', process.env.VITE_SUPABASE_KEY ? 'SET' : 'MISSING');
    console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials for auth');
      return res.status(500).json({ 
        error: 'Missing Supabase credentials for authentication.',
        details: {
          supabaseUrl: supabaseUrl ? 'SET' : 'MISSING',
          supabaseKey: supabaseKey ? 'SET' : 'MISSING'
        }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { email, password } = body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) {
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
    
    return res.status(200).json({ 
      success: true, 
      user: profile,
      message: 'Login successful' 
    });
    
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}