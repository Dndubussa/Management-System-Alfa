// Get a real nurse user ID for testing
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getNurseId() {
  try {
    console.log('🔍 Fetching nurse users...');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('role', 'nurse')
      .limit(1);
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }
    
    if (users && users.length > 0) {
      console.log('✅ Found nurse:', users[0]);
      console.log('📋 Nurse ID:', users[0].id);
      return users[0].id;
    } else {
      console.log('❌ No nurse users found');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getNurseId();
