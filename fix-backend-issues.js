import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY;

console.log('🔧 Fixing Backend Issues...\n');

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials!');
  console.log('Please run: npm run setup:env');
  console.log('Then update .env.local with your actual Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL fixes for common issues
const fixes = [
  {
    name: 'Update users table role constraint',
    sql: `
      ALTER TABLE public.users 
      DROP CONSTRAINT IF EXISTS users_role_check;
      
      ALTER TABLE public.users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN (
        'receptionist', 'doctor', 'lab', 'pharmacy', 'radiologist', 
        'ophthalmologist', 'admin', 'ot-coordinator', 'insurance-officer', 
        'cashier', 'physical-therapist', 'nurse', 'hr'
      ));
    `
  },
  {
    name: 'Grant permissions to authenticated users',
    sql: `
      GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
      GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
      
      GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
      GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
    `
  },
  {
    name: 'Enable RLS and create policies for patients table',
    sql: `
      ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.patients;
      CREATE POLICY "Allow read access for authenticated users" ON public.patients
        FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
      
      DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.patients;
      CREATE POLICY "Allow insert for authenticated users" ON public.patients
        FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
      
      DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.patients;
      CREATE POLICY "Allow update for authenticated users" ON public.patients
        FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
    `
  },
  {
    name: 'Enable RLS and create policies for medical_records table',
    sql: `
      ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.medical_records;
      CREATE POLICY "Allow read access for authenticated users" ON public.medical_records
        FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
      
      DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.medical_records;
      CREATE POLICY "Allow insert for authenticated users" ON public.medical_records
        FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
    `
  },
  {
    name: 'Enable RLS and create policies for appointments table',
    sql: `
      ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.appointments;
      CREATE POLICY "Allow read access for authenticated users" ON public.appointments
        FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
      
      DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.appointments;
      CREATE POLICY "Allow insert for authenticated users" ON public.appointments
        FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
    `
  },
  {
    name: 'Enable RLS and create policies for prescriptions table',
    sql: `
      ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.prescriptions;
      CREATE POLICY "Allow read access for authenticated users" ON public.prescriptions
        FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
      
      DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.prescriptions;
      CREATE POLICY "Allow insert for authenticated users" ON public.prescriptions
        FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
    `
  },
  {
    name: 'Enable RLS and create policies for lab_orders table',
    sql: `
      ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.lab_orders;
      CREATE POLICY "Allow read access for authenticated users" ON public.lab_orders
        FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
      
      DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.lab_orders;
      CREATE POLICY "Allow insert for authenticated users" ON public.lab_orders
        FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
    `
  },
  {
    name: 'Enable RLS and create policies for bills table',
    sql: `
      ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.bills;
      CREATE POLICY "Allow read access for authenticated users" ON public.bills
        FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
      
      DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.bills;
      CREATE POLICY "Allow insert for authenticated users" ON public.bills
        FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
    `
  }
];

async function applyFix(fix) {
  try {
    console.log(`🔧 Applying: ${fix.name}`);
    const { error } = await supabase.rpc('exec_sql', { sql: fix.sql });
    
    if (error) {
      console.log(`⚠️  ${fix.name}: ${error.message}`);
      return false;
    }
    
    console.log(`✅ ${fix.name}: Applied successfully`);
    return true;
  } catch (err) {
    console.log(`❌ ${fix.name}: ${err.message}`);
    return false;
  }
}

async function fixBackendIssues() {
  console.log('🔍 Testing initial connection...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Initial connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful\n');
  } catch (err) {
    console.log('❌ Connection test failed:', err.message);
    return false;
  }
  
  let successCount = 0;
  
  for (const fix of fixes) {
    const success = await applyFix(fix);
    if (success) successCount++;
  }
  
  console.log(`\n📊 Fix Summary: ${successCount}/${fixes.length} fixes applied successfully`);
  
  if (successCount === fixes.length) {
    console.log('🎉 All fixes applied successfully!');
    console.log('\n✅ Next steps:');
    console.log('1. Restart your server: npm run server');
    console.log('2. Test the admin dashboard');
    console.log('3. Verify data is loading properly');
  } else {
    console.log('⚠️  Some fixes failed. You may need to apply them manually in the Supabase SQL editor.');
  }
  
  return successCount === fixes.length;
}

fixBackendIssues().then(success => {
  process.exit(success ? 0 : 1);
});
