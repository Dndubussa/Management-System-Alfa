const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runWorkflowSQL() {
  try {
    const sql = fs.readFileSync('add-patient-workflow-status.sql', 'utf8');
    
    // Split SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement.trim() });
        if (error) {
          console.error('Error:', error);
        } else {
          console.log('Success:', data);
        }
      }
    }
    
    console.log('✅ Workflow status SQL executed successfully');
  } catch (error) {
    console.error('Error running SQL:', error);
  }
}

runWorkflowSQL();
