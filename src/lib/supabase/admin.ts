import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Creates a Supabase client with service role privileges
 * This client bypasses Row Level Security (RLS) and should ONLY be used in server-side code
 *
 * Use this for:
 * - API routes that perform admin operations
 * - Server actions that need to bypass RLS
 * - Operations authenticated by NextAuth (not Supabase Auth)
 *
 * DO NOT expose this client to the browser or use in client components
 *
 * @returns Supabase admin client with service role privileges
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
