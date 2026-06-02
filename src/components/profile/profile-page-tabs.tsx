"use client";

import { useState } from "react";

import { ProfileForm } from "@/components/profile/profile-form";
import type { DashboardData, ProfileSnapshot } from "@/lib/dashboard-data";

type ProfilePageTabsProps = {
  profile: ProfileSnapshot;
  recommendation: DashboardData["recommendation"];
};

const tabButtonBase =
  "rounded-full border px-4 py-2 text-sm font-semibold transition-all";

export function ProfilePageTabs({ profile, recommendation }: ProfilePageTabsProps) {
  const [activeTab, setActiveTab] = useState<"update" | "guide">("update");

  return (
    <section className="glass-card rounded-4xl p-8 sm:p-10 border-emerald-500/20">
      <div>
        <p className="text-sm font-semibold tracking-[0.22em] text-slate-400 uppercase">Profile workspace</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-100">
          {activeTab === "update" ? "Update your profile" : "How to use Pathly profile"}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          {activeTab === "update"
            ? "Edit your role, focus style, and goal without the extra explanation crowding the form."
            : "See what each profile field changes, how Pathly reads it, and how to get better recommendations."}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("update")}
          aria-pressed={activeTab === "update"}
          className={`${tabButtonBase} ${
            activeTab === "update"
              ? "border-cyan-400/60 bg-cyan-500/12 text-cyan-100"
              : "border-slate-700/50 bg-slate-800/35 text-slate-300 hover:border-slate-500/70 hover:text-slate-100"
          }`}
        >
          Update profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("guide")}
          aria-pressed={activeTab === "guide"}
          className={`${tabButtonBase} ${
            activeTab === "guide"
              ? "border-cyan-400/60 bg-cyan-500/12 text-cyan-100"
              : "border-slate-700/50 bg-slate-800/35 text-slate-300 hover:border-slate-500/70 hover:text-slate-100"
          }`}
        >
          How to use
        </button>
      </div>

      {activeTab === "update" ? (
        <div className="mt-6">
          <ProfileForm profile={profile} showPreview={false} />
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-3xl border border-slate-700/40 bg-slate-800/30 p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Current roles</p>
              <p className="mt-2 text-base font-semibold text-slate-100">{profile.category}</p>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Toggle only the roles you actively live in. Too many role signals weakens prioritization.
              </p>
            </article>

            <article className="rounded-3xl border border-cyan-500/25 bg-cyan-500/10 p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-cyan-300 uppercase">Current recommendation</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-100">{recommendation.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{recommendation.reason}</p>
            </article>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-3xl border border-slate-700/40 bg-slate-800/30 p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Main goal</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Write the real outcome you care about this week. Pathly uses this to rank tasks by downstream impact.
              </p>
            </article>

            <article className="rounded-3xl border border-slate-700/40 bg-slate-800/30 p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Focus preference</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Describe how you work best: deep-work blocks, short sprints, calm mornings, or similar patterns.
              </p>
            </article>

            <article className="rounded-3xl border border-slate-700/40 bg-slate-800/30 p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Available focus time</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Keep this realistic. A smaller true number makes recommendations more actionable than an optimistic one.
              </p>
            </article>
          </div>

          <article className="rounded-4xl border border-emerald-500/25 bg-emerald-500/10 p-5 sm:p-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-emerald-300 uppercase">How to get better results</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-700/40 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300">
                Keep the goal specific to this week, not a vague long-term ambition.
              </div>
              <div className="rounded-2xl border border-slate-700/40 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300">
                Use one or two true roles. Only keep all three if your week genuinely spans all three contexts.
              </div>
              <div className="rounded-2xl border border-slate-700/40 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300">
                Update the profile when your schedule changes, not only when the recommendation feels wrong.
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}