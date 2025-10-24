// Test script to check authentication status
import { supabase } from './src/lib/supabase.js';

async function testAuth() {
  console.log('🔍 Testing Supabase authentication...');
  
  try {
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session status:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      error: sessionError?.message 
    });
    
    // Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('User status:', { 
      hasUser: !!user, 
      userId: user?.id,
      userEmail: user?.email,
      error: userError?.message 
    });
    
    // Test a simple query
    const { data, error } = await supabase
      .from('users')
      .select('id, name, role')
      .limit(1);
      
    console.log('Query test:', { 
      hasData: !!data, 
      dataLength: data?.length,
      error: error?.message 
    });
    
  } catch (error) {
    console.error('❌ Auth test failed:', error);
  }
}

testAuth();
