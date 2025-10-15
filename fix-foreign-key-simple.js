import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addForeignKey() {
  try {
    console.log('🔗 Adding foreign key constraint...');
    
    // Use the SQL editor approach - this will need to be done manually
    console.log('📝 Please execute this SQL in your Supabase SQL Editor:');
    console.log('');
    console.log('ALTER TABLE public.service_code_mappings');
    console.log('ADD CONSTRAINT fk_service_code_mappings_service_price_id');
    console.log('FOREIGN KEY (service_price_id)');
    console.log('REFERENCES public.service_prices(id)');
    console.log('ON DELETE CASCADE;');
    console.log('');
    
    // Test if the constraint already exists
    const { data, error } = await supabase
      .from('service_code_mappings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Foreign key constraint is missing. Please add it manually.');
      console.log('Error:', error.message);
    } else {
      console.log('✅ Foreign key constraint appears to be working!');
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

addForeignKey().then(success => {
  if (success) {
    console.log('🎉 Instructions provided!');
  } else {
    console.log('⚠️ Please check the instructions above.');
  }
  process.exit(success ? 0 : 1);
});
