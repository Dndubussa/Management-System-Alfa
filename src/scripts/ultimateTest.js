// Ultimate test to diagnose Supabase connection issues
import fs from 'fs';
import path from 'path';

console.log('=== Ultimate Supabase Connection Diagnostic ===\n');

// 1. Check if .env file exists
const envPath = path.resolve('.env');
console.log('1. Checking .env file...');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('   .env content preview:');
  envContent.split('\n').slice(0, 10).forEach((line, i) => {
    if (line.trim()) console.log(`     ${i + 1}: ${line}`);
  });
} else {
  console.log('❌ .env file does not exist');
}

// 2. Load environment variables manually
console.log('\n2. Loading environment variables...');
const envVars = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      envVars[key.trim()] = value;
    }
  });
}

console.log('   SUPABASE_URL:', envVars.SUPABASE_URL || 'NOT SET');
console.log('   SUPABASE_KEY:', envVars.SUPABASE_KEY ? `${envVars.SUPABASE_KEY.substring(0, 20)}...` : 'NOT SET');

// 3. Test Supabase connection with explicit values
console.log('\n3. Testing Supabase connection...');
if (envVars.SUPABASE_URL && envVars.SUPABASE_KEY) {
  import('@supabase/supabase-js').then(({ createClient }) => {
    const supabase = createClient(envVars.SUPABASE_URL, envVars.SUPABASE_KEY);
    
    console.log('   Testing with explicit client...');
    supabase
      .from('patients')
      .select('id')
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.log('   ❌ Connection failed:', error.message);
          console.log('   Error details:', JSON.stringify(error, null, 2));
          
          // Try to decode the error further
          if (error.message.includes('permission denied')) {
            console.log('   🔍 This is a permissions issue. The service role key should have full access.');
            console.log('   💡 Possible causes:');
            console.log('      - Row Level Security (RLS) is enabled without proper policies');
            console.log('      - Database permissions are not set correctly');
            console.log('      - The service role key is not properly configured in Supabase');
          }
        } else {
          console.log('   ✅ Connection successful!');
          console.log('   Data:', data);
        }
      })
      .catch(error => {
        console.log('   ❌ Unexpected error:', error.message);
      });
  }).catch(err => {
    console.log('   ❌ Failed to import Supabase client:', err.message);
  });
} else {
  console.log('   ❌ Missing environment variables. Cannot test connection.');
}