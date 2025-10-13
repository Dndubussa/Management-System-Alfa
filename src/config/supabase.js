import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Get Supabase URL and key from environment variables
// Use service role key for backend operations (has full permissions)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || 'YOUR_SUPABASE_KEY';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);