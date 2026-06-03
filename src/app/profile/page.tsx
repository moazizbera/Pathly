import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfilePageTabs } from "@/components/profile/profile-page-tabs";
import { SetupPanel } from "@/components/setup/setup-panel";
import { getDashboardData } from "@/lib/dashboard-data";
import { isSupabaseConfiguredAsync } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default function ProfilePage() {
  return <ProfileContent />;
}

async function ProfileContent() {
  if (!(await isSupabaseConfiguredAsync())) {
    return (
      <SetupPanel
        eyebrow="Profile setup"
        title="Finish Supabase setup before editing live profiles."
        description="Pathly can already render the profile editor shell, but saved role updates need the auth and database connection first."
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dashboardData = await getDashboardData(supabase, user);

  return (
    <main className="hero-grid min-h-screen px-6 py-6 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="glass-card rounded-4xl p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link href="/dashboard" className="text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors">
                Back to dashboard
              </Link>
              <p className="mt-6 text-sm font-semibold tracking-[0.22em] text-rose-400 uppercase">
                Personalization settings
              </p>
              <h1 className="font-display mt-3 text-4xl leading-tight text-slate-100 sm:text-5xl">
                Update your profile without the extra noise.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
                Use the tabs below to switch between editing your profile and seeing how Pathly uses those settings.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-slate-600/40 bg-slate-800/40 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-500/70 hover:text-slate-100"
              >
                Close
              </Link>
              <div className="rounded-3xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-sm text-slate-200">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-cyan-300 uppercase">Current focus</p>
                <p className="mt-2">
                  <span className="font-semibold text-cyan-200">{dashboardData.recommendation.title}</span>
                  {" · "}
                  {dashboardData.recommendation.estimatedMinutes} min
                </p>
              </div>
            </div>
          </div>
        </section>

        <ProfilePageTabs profile={dashboardData.profile} recommendation={dashboardData.recommendation} />
      </div>
    </main>
  );
}
