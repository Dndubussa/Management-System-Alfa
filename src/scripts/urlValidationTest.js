import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('=== Supabase URL Validation Test ===');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_KEY length:', supabaseKey ? `${supabaseKey.length} characters` : 'NOT SET');

// Validate URL format
try {
  const url = new URL(supabaseUrl);
  console.log('✅ URL format is valid');
  console.log('Protocol:', url.protocol);
  console.log('Hostname:', url.hostname);
  console.log('Pathname:', url.pathname);
} catch (error) {
  console.log('❌ URL format is invalid:', error.message);
  process.exit(1);
}

// Check if key looks like a JWT
if (supabaseKey) {
  try {
    const parts = supabaseKey.split('.');
    if (parts.length === 3) {
      console.log('✅ Key appears to be a valid JWT');
      // Decode the header (first part) to check key type
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      console.log('Key header:', header);
      
      if (header.typ === 'JWT') {
        console.log('✅ Key is a valid JWT token');
      } else {
        console.log('⚠️ Key is a JWT but may not be the correct type');
      }
    } else {
      console.log('⚠️ Key does not appear to be a JWT token');
    }
  } catch (error) {
    console.log('⚠️ Could not parse key as JWT:', error.message);
  }
}

console.log('\n🎉 URL validation test completed!');