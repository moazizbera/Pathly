"use client";

import { useActionState, useState } from "react";

import { updateProfile, type ProfileActionState } from "@/app/actions/dashboard";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { categoryOptions } from "@/lib/auth/schema";
import { buildProfilePreview, type ProfileSnapshot } from "@/lib/dashboard-data";
import type { RoleProfileSnapshot, SupportedRole } from "@/lib/role-context";

type ProfileFormProps = {
  profile: ProfileSnapshot;
  roleProfiles?: RoleProfileSnapshot[];
  availableRoles?: SupportedRole[];
  showPreview?: boolean;
};

const initialState: ProfileActionState = {};

export function ProfileForm({ profile, roleProfiles = [], availableRoles = [], showPreview = true }: ProfileFormProps) {
  const [state, action] = useActionState(updateProfile, initialState);
  const formState = state ?? initialState;
  const [draftProfile, setDraftProfile] = useState(profile);
  const preview = buildProfilePreview(draftProfile);

  function updateDraftProfile<Key extends keyof ProfileSnapshot>(key: Key, value: ProfileSnapshot[Key]) {
    setDraftProfile((currentProfile) => ({
      ...currentProfile,
      [key]: value,
    }));
  }

  const selectedCategories = draftProfile.category
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  function toggleCategory(category: string, checked: boolean) {
    const next = checked
      ? [...new Set([...selectedCategories, category])]
      : selectedCategories.filter((item) => item !== category);
    updateDraftProfile("category", next.join(","));
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-700/40 bg-slate-800/25 p-4 text-xs font-medium text-slate-400">
            Roles
            <input type="hidden" name="category" value={draftProfile.category} />
            <p className="mt-1.5 text-[11px] tracking-[0.16em] text-slate-500 uppercase">Three roles only</p>
            <div className="mt-3 space-y-3">
              {categoryOptions.map((category) => {
                const isSelected = selectedCategories.includes(category);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category, !isSelected)}
                    aria-pressed={isSelected}
                    className={`w-full rounded-3xl border px-4 py-4 text-left transition-all ${
                      isSelected
                        ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]"
                        : "border-slate-700/50 bg-slate-800/40 text-slate-300 hover:border-slate-500/60 hover:bg-slate-800/55"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className={`text-base font-semibold ${isSelected ? "text-slate-50" : "text-slate-200"}`}>{category}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {category === "Student"
                            ? "Study and exams"
                            : category === "Employee"
                              ? "Projects and meetings"
                              : "Lessons and grading"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${
                          isSelected
                            ? "border-cyan-300/70 bg-cyan-400/20 text-cyan-100"
                            : "border-slate-600/60 bg-slate-900/80 text-transparent"
                        }`}
                      >
                        <span className="text-xs font-bold">{isSelected ? "✓" : ""}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedCategories.map((category) => (
              <input key={category} type="hidden" name="categories" value={category} />
            ))}
          </div>

          <label className="block text-xs font-medium text-slate-400">
            Full name
            <input
              name="fullName"
              value={draftProfile.fullName}
              onChange={(event) => updateDraftProfile("fullName", event.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/60"
            />
          </label>
        </div>

        <div className="grid gap-4 content-start sm:grid-cols-1">
          <label className="text-xs font-medium text-slate-400">
            Focus preference
            <input
              name="focusPreference"
              value={draftProfile.focusPreference}
              onChange={(event) => updateDraftProfile("focusPreference", event.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/60"
            />
          </label>
          <label className="text-xs font-medium text-slate-400">
            Available focus time
            <input
              name="availability"
              value={draftProfile.availability}
              onChange={(event) => updateDraftProfile("availability", event.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/60"
            />
          </label>
        </div>
      </div>

      <label className="block text-xs font-medium text-slate-400">
        Main goal
        <textarea
          name="mainGoal"
          value={draftProfile.mainGoal}
          onChange={(event) => updateDraftProfile("mainGoal", event.target.value)}
          className="mt-1.5 min-h-28 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/60"
        />
      </label>

      {availableRoles.length > 0 ? (
        <section className="rounded-4xl border border-slate-700/30 bg-slate-900/40 p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-cyan-400 uppercase">Default dashboard role</p>
                <p className="mt-2 text-sm leading-7 text-slate-400">Choose whether Pathly should open in a focused role dashboard or in the merged All Roles view.</p>
              </div>
              <label className="block text-xs font-medium text-slate-400">
                Default active role
                <select
                  name="activeRole"
                  defaultValue={profile.activeRole}
                  className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/60"
                >
                  <option value="all">All Roles</option>
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-cyan-400 uppercase">Role contexts</p>
                <p className="mt-2 text-sm leading-7 text-slate-400">Each role keeps its own goal, focus preference, and availability so recommendations do not collapse into one blended profile.</p>
              </div>
              <div className="space-y-4">
                {availableRoles.map((role) => {
                  const roleProfile = roleProfiles.find((item) => item.role === role);

                  return (
                    <article key={role} className="rounded-3xl border border-slate-700/40 bg-slate-800/30 p-4">
                      <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">{role}</p>
                      <div className="mt-3 grid gap-3">
                        <label className="text-xs font-medium text-slate-400">
                          Role goal
                          <textarea
                            name={`roleMainGoal_${role}`}
                            defaultValue={roleProfile?.mainGoal ?? profile.mainGoal}
                            className="mt-1.5 min-h-20 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/60"
                          />
                        </label>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="text-xs font-medium text-slate-400">
                            Focus preference
                            <input
                              name={`roleFocusPreference_${role}`}
                              defaultValue={roleProfile?.focusPreference ?? profile.focusPreference}
                              className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/60"
                            />
                          </label>
                          <label className="text-xs font-medium text-slate-400">
                            Availability
                            <input
                              name={`roleAvailability_${role}`}
                              defaultValue={roleProfile?.availability ?? profile.availability}
                              className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/60"
                            />
                          </label>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {showPreview ? (
      <section className="rounded-4xl border border-slate-700/30 bg-slate-900/40 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-cyan-400 uppercase">Live guidance preview</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-100">What Pathly would prioritize with this profile</h3>
          </div>
          <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300">
            {preview.recommendation.estimatedMinutes} min next move
          </span>
        </div>

        <div className="mt-5 rounded-3xl border border-indigo-500/30 bg-indigo-500/10 p-5">
          <p className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">Likely recommendation</p>
          <h4 className="mt-3 text-2xl font-semibold text-slate-100">{preview.recommendation.title}</h4>
          <p className="mt-3 text-sm leading-7 text-slate-300">{preview.recommendation.reason}</p>
          <p className="mt-4 rounded-2xl border border-slate-700/40 bg-slate-800/60 px-4 py-3 text-sm leading-7 text-slate-300">
            {preview.recommendation.coachMessage}
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {preview.insights.map((insight, index) => {
            const tone =
              index === 0
                ? "border border-rose-500/25 bg-rose-500/10"
                : index === 1
                  ? "border border-emerald-500/25 bg-emerald-500/10"
                  : "border border-indigo-500/25 bg-indigo-500/10";

            return (
              <article key={insight.label} className={`rounded-3xl p-4 ${tone}`}>
                <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">{insight.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-100">{insight.value}</p>
                <p className="mt-2 text-sm leading-7 text-slate-400">{insight.detail}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-700/40 bg-slate-800/30 p-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Preview playbook</p>
            <div className="mt-4 space-y-3">
              {preview.playbook.map((item, index) => (
                <div key={item.title} className="rounded-2xl border border-slate-700/40 bg-slate-900/50 p-4">
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-600 uppercase">Step 0{index + 1}</p>
                  <h4 className="mt-2 text-sm font-semibold text-slate-200">{item.title}</h4>
                  <p className="mt-2 text-xs leading-6 text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700/40 bg-slate-800/30 p-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Starter priorities Pathly would seed</p>
            <div className="mt-4 space-y-3">
              {preview.previewTasks.slice(0, 3).map((task) => (
                <article key={task.id} className="rounded-2xl border border-slate-700/40 bg-slate-900/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-slate-200">{task.title}</h4>
                    <span className="rounded-full border border-slate-700/50 px-2.5 py-0.5 text-xs font-semibold uppercase text-slate-400">
                      {task.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-slate-500">{task.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {formState.error ? <p className="text-sm text-red-400">{formState.error}</p> : null}
      {formState.success ? <p className="text-sm text-emerald-400">{formState.success}</p> : null}

      <AuthSubmitButton idleLabel="Save profile" pendingLabel="Saving profile..." />
    </form>
  );
}
