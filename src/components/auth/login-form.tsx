"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signIn } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/auth/schema";

import { AuthSubmitButton } from "./auth-submit-button";

const initialState: AuthFormState = {};

function FieldError({ error }: { error?: string[] }) {
  if (!error?.length) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-400">{error[0]}</p>;
}

export function LoginForm({ message }: { message?: string }) {
  const [state, action] = useActionState(signIn, initialState);
  const formState = state ?? initialState;

  return (
    <form action={action} className="space-y-4">
      {message ? <p className="rounded-3xl badge-cyan px-4 py-3 text-sm">{message}</p> : null}

      <label className="block text-sm font-medium text-slate-400">
        Email address
        <input
          name="email"
          type="email"
          defaultValue={formState.values?.email || ""}
          className="mt-2 w-full rounded-3xl border border-slate-700/50 bg-slate-800/30 px-4 py-3 text-slate-100 backdrop-blur-sm outline-none focus:border-cyan-500/40 focus:bg-slate-800/50 transition-all"
          placeholder="amina@pathly.app"
        />
        <FieldError error={formState.fieldErrors?.email} />
      </label>

      <label className="block text-sm font-medium text-slate-400">
        Password
        <input
          name="password"
          type="password"
          className="mt-2 w-full rounded-3xl border border-slate-700/50 bg-slate-800/30 px-4 py-3 text-slate-100 backdrop-blur-sm outline-none focus:border-cyan-500/40 focus:bg-slate-800/50 transition-all"
          placeholder="Your password"
        />
        <FieldError error={formState.fieldErrors?.password} />
      </label>

      {formState.error ? <p className="text-sm text-red-400">{formState.error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AuthSubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />
        <Link href="/signup" className="text-sm font-semibold text-slate-400 underline-offset-4 hover:text-cyan-300 transition-colors">
          Need an account?
        </Link>
      </div>
    </form>
  );
}
