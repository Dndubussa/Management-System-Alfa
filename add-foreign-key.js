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

async function addForeignKeyConstraint() {
  try {
    console.log('🔗 Adding foreign key constraint...');
    
    // Use raw SQL to add the foreign key constraint
    const { error } = await supabase.rpc('exec', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_service_code_mappings_service_price_id'
            AND table_name = 'service_code_mappings'
          ) THEN
            ALTER TABLE public.service_code_mappings 
            ADD CONSTRAINT fk_service_code_mappings_service_price_id 
            FOREIGN KEY (service_price_id) 
            REFERENCES public.service_prices(id) 
            ON DELETE CASCADE;
          END IF;
        END $$;
      `
    });
    
    if (error) {
      console.error('❌ Error adding foreign key:', error);
      return false;
    }
    
    console.log('✅ Foreign key constraint added successfully!');
    
    // Test the service code mappings endpoint
    console.log('🧪 Testing service code mappings endpoint...');
    const { data, error: testError } = await supabase
      .from('service_code_mappings')
      .select('*')
      .limit(5);
    
    if (testError) {
      console.error('❌ Error testing endpoint:', testError);
      return false;
    }
    
    console.log(`✅ Service code mappings endpoint working! Found ${data?.length || 0} mappings`);
    
    return true;
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

addForeignKeyConstraint().then(success => {
  if (success) {
    console.log('🎉 Foreign key constraint setup complete!');
  } else {
    console.log('⚠️ Setup incomplete. Please check the errors above.');
  }
  process.exit(success ? 0 : 1);
});
