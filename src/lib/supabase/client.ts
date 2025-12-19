import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

/**
 * Creates a Supabase client for client-side usage
 * This client should only be used in Client Components
 *
 * @returns Supabase browser client instance
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
