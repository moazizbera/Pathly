type MaybeCloudflareEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
};

function getCloudflareRuntimeEnv(): MaybeCloudflareEnv | undefined {
  const contextSymbol = Symbol.for("__cloudflare-context__");
  const context = (globalThis as Record<symbol, { env?: MaybeCloudflareEnv } | undefined>)[contextSymbol];

  return context?.env;
}

export function getSupabaseEnv() {
  const runtimeEnv = getCloudflareRuntimeEnv();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    runtimeEnv?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    runtimeEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? runtimeEnv?.NEXT_PUBLIC_SUPABASE_URL,
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