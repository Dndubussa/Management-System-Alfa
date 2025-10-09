import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('=== JWT Decoding Test ===');

const supabaseKey = process.env.SUPABASE_KEY;

console.log('SUPABASE_KEY length:', supabaseKey ? `${supabaseKey.length} characters` : 'NOT SET');

if (supabaseKey) {
  try {
    // Split the JWT into parts
    const parts = supabaseKey.split('.');
    if (parts.length === 3) {
      console.log('✅ Key is a valid JWT with 3 parts');
      
      // Decode the payload (second part)
      const payload = parts[1];
      // Add padding if needed
      const paddedPayload = payload.padEnd(payload.length + (4 - payload.length % 4) % 4, '=');
      const decodedPayload = Buffer.from(paddedPayload, 'base64').toString();
      
      console.log('Decoded payload:', decodedPayload);
      
      // Parse the JSON
      const payloadObj = JSON.parse(decodedPayload);
      console.log('Parsed payload:', JSON.stringify(payloadObj, null, 2));
      
      // Check the role
      if (payloadObj.role) {
        console.log('🔑 Key role:', payloadObj.role);
        if (payloadObj.role === 'service_role') {
          console.log('✅ This is a service role key - should have full access');
        } else if (payloadObj.role === 'anon') {
          console.log('⚠️ This is an anon key - may have limited access');
        } else {
          console.log('⚠️ Unknown role type');
        }
      } else {
        console.log('⚠️ No role found in payload');
      }
      
      // Check expiration
      if (payloadObj.exp) {
        const expDate = new Date(payloadObj.exp * 1000);
        console.log('📅 Key expiration:', expDate.toISOString());
        if (expDate < new Date()) {
          console.log('❌ Key has expired!');
        } else {
          console.log('✅ Key is still valid');
        }
      }
      
    } else {
      console.log('❌ Key does not appear to be a valid JWT');
    }
  } catch (error) {
    console.log('❌ Failed to decode JWT:', error.message);
  }
} else {
  console.log('❌ No SUPABASE_KEY found');
}