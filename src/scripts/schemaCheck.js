import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

console.log('=== Supabase Schema Check ===');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_KEY length:', supabaseKey ? `${supabaseKey.length} characters` : 'NOT SET');

try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client created successfully');
  
  // Try to get table information from pg_tables
  console.log('\nChecking pg_tables...');
  const { data: tables, error: tablesError } = await supabase
    .from('pg_tables')
    .select('tablename')
    .eq('schemaname', 'public')
    .limit(10);
  
  if (tablesError) {
    console.log('❌ pg_tables query failed:', tablesError.message);
    
    // Try a different approach - check if we can access pg_class
    console.log('\nChecking pg_class...');
    const { data: classes, error: classesError } = await supabase
      .from('pg_class')
      .select('relname')
      .limit(5);
    
    if (classesError) {
      console.log('❌ pg_class query failed:', classesError.message);
      console.log('This suggests the database may not be properly set up or there are permission issues');
    } else {
      console.log('✅ pg_class query successful!');
      console.log('Found classes:', classes.map(c => c.relname));
    }
  } else {
    console.log('✅ pg_tables query successful!');
    console.log('Tables found in public schema:');
    tables.forEach(table => {
      console.log(`  - ${table.tablename}`);
    });
  }
  
} catch (error) {
  console.log('❌ Schema check failed:', error.message);
  console.log('Error details:', error);
}