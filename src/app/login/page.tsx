import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { SetupPanel } from "@/components/setup/setup-panel";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams?: Promise<{
    message?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const message = Array.isArray(resolvedSearchParams.message)
    ? resolvedSearchParams.message[0]
    : resolvedSearchParams.message;

  if (!isSupabaseConfigured()) {
    return (
      <SetupPanel
        eyebrow="Authentication setup"
        title="Connect Supabase before signing in."
        description="Pathly is ready for live auth, but this sign-in route stays in setup mode until Supabase credentials are available."
        backHref="/"
        backLabel="Back to home"
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="hero-grid min-h-screen px-6 py-6 sm:px-10 lg:px-14">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="animate-rise-in glass-card rounded-4xl p-8 sm:p-10 border-cyan-500/20">
          <Link href="/" className="text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors">
            Back to home
          </Link>
          <p className="mt-8 text-sm font-semibold tracking-[0.22em] text-cyan-300 uppercase">
            Welcome back
          </p>
          <h1 className="font-display mt-3 text-5xl leading-[0.95] text-slate-100 sm:text-6xl">
            Return to the role-aware dashboard that keeps your week clear.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
            Sign in to restore your Pathly session, refresh your priorities, and continue from the next
            best action waiting for you.
          </p>
        </section>

        <section className="animate-rise-in-delayed glass-card rounded-4xl p-8 sm:p-10 border-emerald-500/20">
          <div className="mx-auto max-w-xl">
            <p className="text-sm font-semibold tracking-[0.22em] text-slate-400 uppercase">
              Sign in
            </p>
            <div className="mt-6">
              <LoginForm message={message} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
