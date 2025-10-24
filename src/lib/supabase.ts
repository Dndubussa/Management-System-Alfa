// Shared Supabase client to ensure authentication state is consistent
import { createClient } from '@supabase/supabase-js';

let supabaseInstance: any = null;
let supabaseServiceInstance: any = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}

export function getSupabaseServiceClient() {
  if (!supabaseServiceInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    // Use service role key for database operations that require elevated permissions
    const supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Suppress the multiple GoTrueClient warning for service role client
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes?.('Multiple GoTrueClient instances')) {
        return; // Suppress this specific warning
      }
      originalWarn.apply(console, args);
    };
    
    console.log('🔍 Supabase Service Client Configuration:', {
      supabaseUrl: supabaseUrl ? 'SET' : 'MISSING',
      supabaseKey: supabaseKey ? 'SET' : 'MISSING',
      keyType: supabaseKey === import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON',
      timestamp: new Date().toISOString()
    });
    
    supabaseServiceInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Restore original console.warn
    console.warn = originalWarn;
  }
  return supabaseServiceInstance;
}

export const supabase = getSupabaseClient();
export const supabaseService = getSupabaseServiceClient();