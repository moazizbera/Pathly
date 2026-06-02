"use client";

import { useActionState } from "react";

import { createTask, type TaskActionState } from "@/app/actions/dashboard";

import { AuthSubmitButton } from "@/components/auth/auth-submit-button";

const initialState: TaskActionState = {};

export function TaskForm() {
  const [state, action] = useActionState(createTask, initialState);
  const formState = state ?? initialState;

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-400 sm:col-span-2">
          Task title
          <input
            name="title"
            className="mt-2 w-full rounded-3xl border border-slate-700/50 bg-slate-800/30 px-4 py-3 text-slate-100 backdrop-blur-sm outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/50"
            placeholder="Finish the summary for tomorrow's check-in"
          />
        </label>

        <label className="text-sm font-medium text-slate-400 sm:col-span-2">
          Short description
          <textarea
            name="description"
            className="mt-2 min-h-24 w-full rounded-3xl border border-slate-700/50 bg-slate-800/30 px-4 py-3 text-slate-100 backdrop-blur-sm outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/50"
            placeholder="What makes this task matter right now?"
          />
        </label>

        <label className="text-sm font-medium text-slate-400">
          Due date
          <input
            name="dueDate"
            type="date"
            className="mt-2 w-full rounded-3xl border border-slate-700/50 bg-slate-800/30 px-4 py-3 text-slate-100 backdrop-blur-sm outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/50"
          />
        </label>

        <label className="text-sm font-medium text-slate-400">
          Estimated minutes
          <input
            name="estimatedMinutes"
            type="number"
            min="5"
            step="5"
            defaultValue="25"
            className="mt-2 w-full rounded-3xl border border-slate-700/50 bg-slate-800/30 px-4 py-3 text-slate-100 backdrop-blur-sm outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/50"
          />
        </label>

        <label className="text-sm font-medium text-slate-400 sm:col-span-2">
          Priority
          <select
            name="priority"
            defaultValue="medium"
            className="mt-2 w-full rounded-3xl border border-slate-700/50 bg-slate-800/30 px-4 py-3 text-slate-100 backdrop-blur-sm outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/50"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
      </div>

      {formState.error ? <p className="text-sm text-red-400">{formState.error}</p> : null}
      {formState.success ? <p className="text-sm text-emerald-400">{formState.success}</p> : null}

      <AuthSubmitButton idleLabel="Add task" pendingLabel="Saving task..." />
    </form>
  );
}
