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
    const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    // In production (Vercel), use the anon key instead of service role key for security
    const isProduction = import.meta.env.PROD;
    const keyToUse = isProduction ? import.meta.env.VITE_SUPABASE_KEY : supabaseServiceKey;
    
    if (!supabaseUrl || !keyToUse) {
      throw new Error(`Missing Supabase ${isProduction ? 'anon' : 'service role'} key`);
    }
    
    // Suppress the multiple GoTrueClient warning for service role client
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes?.('Multiple GoTrueClient instances')) {
        return; // Suppress this specific warning
      }
      originalWarn.apply(console, args);
    };
    
    supabaseServiceInstance = createClient(supabaseUrl, keyToUse, {
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
