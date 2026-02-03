import { createClient, type SupabaseClient } from '@supabase/supabase-js';

interface RuntimeEnvResponse {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
}

interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

let clientPromise: Promise<SupabaseClient> | null = null;
let cachedBrowserConfig: SupabaseConfig | null = null;

const loadConfig = async (): Promise<SupabaseConfig> => {
  if (typeof window === 'undefined') {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured.');
    }
    return { supabaseUrl, supabaseAnonKey };
  }

  if (cachedBrowserConfig) {
    return cachedBrowserConfig;
  }

  const response = await fetch('/api/runtime-env');
  if (!response.ok) {
    throw new Error('Unable to load Supabase runtime configuration.');
  }
  const { supabaseUrl, supabaseAnonKey } =
    (await response.json()) as RuntimeEnvResponse;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase runtime configuration is missing.');
  }
  cachedBrowserConfig = { supabaseUrl, supabaseAnonKey };
  return cachedBrowserConfig;
};

export const getSupabase = async (): Promise<SupabaseClient> => {
  if (!clientPromise) {
    clientPromise = loadConfig().then(({ supabaseUrl, supabaseAnonKey }) =>
      createClient(supabaseUrl, supabaseAnonKey),
    );
  }
  return clientPromise;
};

export const resetSupabaseClient = () => {
  clientPromise = null;
  cachedBrowserConfig = null;
};
