// Get a real user ID from the database
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('VITE_SUPABASE_KEY:', supabaseKey ? 'SET' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getRealUserId() {
  try {
    console.log('🔍 Fetching users from database...');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, role')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }
    
    if (users && users.length > 0) {
      console.log('✅ Found users:');
      users.forEach(user => {
        console.log(`📋 ${user.role}: ${user.name} (${user.id})`);
      });
      
      // Get a nurse user specifically
      const nurse = users.find(u => u.role === 'nurse');
      if (nurse) {
        console.log(`\n🎯 Nurse ID for testing: ${nurse.id}`);
        return nurse.id;
      } else {
        console.log(`\n🎯 Using first user ID: ${users[0].id}`);
        return users[0].id;
      }
    } else {
      console.log('❌ No users found');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getRealUserId();
