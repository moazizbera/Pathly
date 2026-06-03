import Link from "next/link";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { SetupPanel } from "@/components/setup/setup-panel";
import { isSupabaseConfiguredAsync } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const roleCards = [
  {
    title: "Student",
    detail: "Assignments, revision windows, and exam countdowns.",
    tone: "badge-cyan",
  },
  {
    title: "Employee",
    detail: "Meetings, deliverables, and focus blocks.",
    tone: "badge-emerald",
  },
  {
    title: "Teacher",
    detail: "Lesson plans, grading, and class readiness.",
    tone: "badge-indigo",
  },
];

export default async function SignUpPage() {
  if (!(await isSupabaseConfiguredAsync())) {
    return (
      <SetupPanel
        eyebrow="Onboarding setup"
        title="Wire Supabase before creating real accounts."
        description="The Pathly onboarding experience is built, but account creation and saved personalization are intentionally paused until the backend is configured."
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
            Sign up flow
          </p>
          <h1 className="font-display mt-3 text-5xl leading-[0.95] text-slate-100 sm:text-6xl">
            Start with the role you actually live in.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
            Pathly does not start with a generic to-do list. It starts with who you are, what you are
            responsible for, and how your week really works.
          </p>

          <div className="mt-10 grid gap-4">
            {roleCards.map((role) => (
              <div key={role.title} className="rounded-3xl border border-slate-700/50 bg-slate-800/30 p-5 hover:border-slate-600/80 hover:bg-slate-800/50 transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-100">{role.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-400">{role.detail}</p>
                  </div>
                  <span className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${role.tone}`}>
                    Active profile
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="animate-rise-in-delayed glass-card rounded-4xl p-8 sm:p-10 border-emerald-500/20">
          <div className="mx-auto max-w-xl">
            <p className="text-sm font-semibold tracking-[0.22em] text-slate-400 uppercase">
              Create account
            </p>
            <div className="mt-6">
              <SignupForm />
            </div>
            <p className="mt-6 text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-cyan-400 underline-offset-4 hover:underline">
                Sign in instead
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}