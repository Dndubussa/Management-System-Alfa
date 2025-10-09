import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fetch from 'node-fetch';

console.log('=== Supabase HTTP Test ===');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_KEY length:', supabaseKey ? `${supabaseKey.length} characters` : 'NOT SET');

try {
  // Test a simple HTTP request to the Supabase REST API
  const url = `${supabaseUrl}/rest/v1/patients?select=id&limit=1`;
  
  console.log('\nMaking HTTP request to:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers));
  
  const text = await response.text();
  console.log('Response body:', text);
  
  if (response.ok) {
    console.log('✅ HTTP request successful!');
  } else {
    console.log('❌ HTTP request failed with status:', response.status);
  }
  
} catch (error) {
  console.log('❌ HTTP test failed:', error.message);
  console.log('Error stack:', error.stack);
}