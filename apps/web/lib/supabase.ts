import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const SUPABASE_READY = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
export const SUPABASE_CONFIG_ERROR =
  'Supabase env missing (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)';

export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'product-images';
export const SUPABASE_PUBLIC_PREFIX = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/`
  : null;

function ensureConfig() {
  if (!SUPABASE_READY) {
    throw new Error(SUPABASE_CONFIG_ERROR);
  }
}

export function getSupabaseServerClient(): SupabaseClient {
  ensureConfig();
  return createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
