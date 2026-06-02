"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { resendVerificationEmail, signUp } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/auth/schema";
import { categoryOptions } from "@/lib/auth/schema";

import { AuthSubmitButton } from "./auth-submit-button";

const initialState: AuthFormState = {};

function FieldError({ error }: { error?: string[] }) {
  if (!error?.length) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-400">{error[0]}</p>;
}

function roleHint(category: string) {
  if (category === "Student") return "Assignments and exams";
  if (category === "Employee") return "Meetings and delivery";
  return "Lessons and grading";
}

export function SignupForm() {
  const [state, action] = useActionState(signUp, initialState);
  const [resendState, resendAction] = useActionState(resendVerificationEmail, initialState);
  const formState = state ?? initialState;
  const verificationState = resendState ?? initialState;
  const verificationEmail = formState.verificationEmail ?? verificationState.verificationEmail ?? formState.values?.email ?? "";
  const emailInputRef = useRef<HTMLInputElement>(null);
  const formCategories = (formState.values?.category ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const [draftValues, setDraftValues] = useState({
    fullName: formState.values?.fullName ?? "",
    email: formState.values?.email ?? "",
    password: "",
    mainGoal: formState.values?.mainGoal ?? "",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(formCategories);

  useEffect(() => {
    setDraftValues((current) => ({
      ...current,
      fullName: formState.values?.fullName ?? current.fullName,
      email: formState.values?.email ?? current.email,
      mainGoal: formState.values?.mainGoal ?? current.mainGoal,
    }));
    setSelectedCategories(formCategories);
  }, [formState.values?.category, formState.values?.email, formState.values?.fullName, formState.values?.mainGoal]);

  function updateDraftValue(field: "fullName" | "email" | "password" | "mainGoal", value: string) {
    setDraftValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleCategory(category: string) {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  }

  const focusEmailField = () => {
    emailInputRef.current?.focus();
    emailInputRef.current?.select();
  };

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-400">
            Choose your roles and profile details <span className="text-xs text-slate-500">(3 aligned rows)</span>
          </p>

          {categoryOptions.map((category, index) => {
            const isSelected = selectedCategories.includes(category);
            const fieldKey = index === 0 ? "fullName" : index === 1 ? "email" : "password";

            return (
              <div key={category} className="grid gap-3 sm:grid-cols-[0.95fr_1.05fr]">
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  aria-pressed={isSelected}
                  className={`w-full rounded-3xl border px-4 py-4 text-left transition-all ${
                    isSelected
                      ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]"
                      : "border-slate-700/40 bg-slate-800/20 hover:border-slate-500/70 hover:bg-slate-800/35"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className={`text-base font-semibold ${isSelected ? "text-slate-50" : "text-slate-200"}`}>{category}</span>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{roleHint(category)}</p>
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

                {fieldKey === "fullName" ? (
                  <label className="block rounded-3xl border border-slate-700/40 bg-slate-800/20 px-4 py-4 text-sm font-medium text-slate-400 transition-all focus-within:border-cyan-500/40 focus-within:bg-slate-800/35">
                    Full name
                    <input
                      name="fullName"
                      value={draftValues.fullName}
                      onChange={(event) => updateDraftValue("fullName", event.target.value)}
                      className="mt-2 w-full border-0 bg-transparent px-0 py-0 text-base text-slate-100 outline-none placeholder:text-slate-500"
                      placeholder="Amina Noor"
                    />
                    <FieldError error={formState.fieldErrors?.fullName} />
                  </label>
                ) : fieldKey === "email" ? (
                  <label className="block rounded-3xl border border-slate-700/40 bg-slate-800/20 px-4 py-4 text-sm font-medium text-slate-400 transition-all focus-within:border-cyan-500/40 focus-within:bg-slate-800/35">
                    Email address
                    <input
                      ref={emailInputRef}
                      name="email"
                      type="email"
                      value={draftValues.email}
                      onChange={(event) => updateDraftValue("email", event.target.value)}
                      className="mt-2 w-full border-0 bg-transparent px-0 py-0 text-base text-slate-100 outline-none placeholder:text-slate-500"
                      placeholder="amina@pathly.app"
                    />
                    <FieldError error={formState.fieldErrors?.email} />
                  </label>
                ) : (
                  <label className="block rounded-3xl border border-slate-700/40 bg-slate-800/20 px-4 py-4 text-sm font-medium text-slate-400 transition-all focus-within:border-cyan-500/40 focus-within:bg-slate-800/35">
                    Password
                    <input
                      name="password"
                      type="password"
                      value={draftValues.password}
                      onChange={(event) => updateDraftValue("password", event.target.value)}
                      className="mt-2 w-full border-0 bg-transparent px-0 py-0 text-base text-slate-100 outline-none placeholder:text-slate-500"
                      placeholder="At least 8 chars, 1 uppercase letter + 1 number"
                    />
                    <FieldError error={formState.fieldErrors?.password} />
                  </label>
                )}
              </div>
            );
          })}

          {selectedCategories.map((category) => (
            <input key={category} type="hidden" name="categories" value={category} />
          ))}
          <FieldError error={formState.fieldErrors?.category} />
        </div>

        <label className="block text-sm font-medium text-slate-400">
          Main goal for this week
          <textarea
            name="mainGoal"
            value={draftValues.mainGoal}
            onChange={(event) => updateDraftValue("mainGoal", event.target.value)}
            className="mt-2 min-h-30 w-full rounded-3xl border border-slate-700/50 bg-slate-800/30 px-4 py-3 text-slate-100 backdrop-blur-sm outline-none focus:border-cyan-500/40 focus:bg-slate-800/50 transition-all"
            placeholder="Finish the launch brief, protect two deep-work sessions, and clear overdue admin tasks."
          />
          <FieldError error={formState.fieldErrors?.mainGoal} />
        </label>

        {formState.error ? <p className="text-sm text-red-400">{formState.error}</p> : null}
        {formState.success ? (
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <p>{formState.success}</p>
            <p className="mt-2 text-xs text-emerald-100/80">
              If it does not arrive, resend the verification email below or update the address above and submit again.
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <AuthSubmitButton idleLabel="Create profile" pendingLabel="Creating account..." />
          <p className="text-sm text-slate-400">Pathly stores your role and goal to personalize the dashboard.</p>
        </div>
      </form>

      {verificationEmail ? (
        <div className="rounded-3xl border border-slate-700/50 bg-slate-900/40 px-4 py-4">
          <p className="text-sm text-slate-300">
            Verification address: <span className="font-semibold text-cyan-300">{verificationEmail}</span>
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <form action={resendAction}>
              <input type="hidden" name="email" value={verificationEmail} />
              <button
                type="submit"
                className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition-colors hover:border-cyan-300/70 hover:text-cyan-100"
              >
                Resend verification email
              </button>
            </form>
            <button
              type="button"
              onClick={focusEmailField}
              className="rounded-full border border-slate-600/40 bg-slate-800/50 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-500/70 hover:text-slate-100"
            >
              Use a different email
            </button>
          </div>
          {verificationState.success ? <p className="mt-3 text-sm text-emerald-400">{verificationState.success}</p> : null}
          {verificationState.error ? <p className="mt-3 text-sm text-red-400">{verificationState.error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
