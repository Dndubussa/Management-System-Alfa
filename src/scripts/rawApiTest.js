import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('=== Raw Supabase API Test ===');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('SUPABASE_URL:', supabaseUrl);

// Test the Supabase REST API directly
const testUrl = `${supabaseUrl}/rest/v1/`;

console.log('\nTesting Supabase REST API endpoint:', testUrl);

try {
  const response = await fetch(testUrl, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    }
  });
  
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers));
  
  const text = await response.text();
  console.log('Response body:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
  
  if (response.ok) {
    console.log('✅ REST API is accessible');
  } else {
    console.log('❌ REST API access failed');
  }
} catch (error) {
  console.log('❌ REST API test failed:', error.message);
}

// Also test the Supabase auth endpoint
const authUrl = `${supabaseUrl}/auth/v1/settings`;
console.log('\nTesting Supabase Auth endpoint:', authUrl);

try {
  const response = await fetch(authUrl, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
    }
  });
  
  console.log('Auth response status:', response.status);
  if (response.ok) {
    const data = await response.json();
    console.log('Auth settings:', JSON.stringify(data, null, 2));
    console.log('✅ Auth API is accessible');
  } else {
    console.log('❌ Auth API access failed');
    const text = await response.text();
    console.log('Auth error response:', text.substring(0, 500));
  }
} catch (error) {
  console.log('❌ Auth API test failed:', error.message);
}