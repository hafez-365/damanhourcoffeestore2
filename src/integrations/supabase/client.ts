// src/integrations/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// التحقق من وجود المتغيرات
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(`
    Missing Supabase environment variables. Check .env file.
    Required variables:
    - VITE_SUPABASE_URL
    - VITE_SUPABASE_ANON_KEY
  `);
}

// التحقق من صحة URL
try {
  new URL(SUPABASE_URL);
} catch (error) {
  throw new Error(`
    Invalid Supabase URL: ${SUPABASE_URL}
    URL must be in the format: https://your-project-id.supabase.co
  `);
}

export const supabase = createBrowserClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      flowType: 'pkce'
    }
  }
);
