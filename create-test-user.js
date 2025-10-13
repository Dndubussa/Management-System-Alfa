import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUser() {
  console.log('=== Creating Test User ===');
  
  const testEmail = 'test@alfahospital.com';
  const testPassword = 'TestPassword123!';
  
  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        full_name: 'Test User',
        role: 'ophthalmologist'
      }
    });
    
    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      return;
    }
    
    console.log('✅ Auth user created:', authData.user.email);
    
    // Create profile in public.users table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name: 'Test User',
        email: testEmail,
        role: 'ophthalmologist',
        department: 'Ophthalmology'
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Error creating user profile:', profileError.message);
      return;
    }
    
    console.log('✅ User profile created:', profileData);
    console.log('\n=== Test User Created Successfully ===');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    console.log('Role: ophthalmologist');
    console.log('\nYou can now use these credentials to log in!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

createTestUser().catch(console.error);
