export function getSupabaseEnv() {
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey,
  };
}

export function isSupabaseConfigured() {
  const { url, publishableKey } = getSupabaseEnv();
  return Boolean(url && publishableKey);
}

export function getSupabaseSetupMessage() {
  return "Add NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then run Docs/supabase-schema.sql to unlock auth, profiles, and saved tasks.";
}