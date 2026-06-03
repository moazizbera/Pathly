"use client";

import { cloneElement, isValidElement, useEffect, useId, useState } from "react";
import { useActionState } from "react";
import type { MouseEventHandler, ReactElement, ReactNode } from "react";

import { createTask, type TaskActionState } from "@/app/actions/dashboard";
import { Dialog } from "@/components/ui/dialog";
import type { ActiveRole, SupportedRole } from "@/lib/role-context";

const initialState: TaskActionState = {};

interface AddTaskDialogProps {
  defaultDueDate?: string;
  title?: string;
  trigger?: ReactNode;
  activeRole?: ActiveRole;
  availableRoles?: SupportedRole[];
}

export function AddTaskDialog({
  defaultDueDate,
  title = "New priority",
  trigger,
  activeRole = "all",
  availableRoles = [],
}: AddTaskDialogProps = {}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(createTask, initialState);
  const formState = state ?? initialState;
  const dueDateInputId = useId();

  useEffect(() => {
    if (formState.success) {
      const timer = globalThis.setTimeout(() => setOpen(false), 900);
      return () => clearTimeout(timer);
    }
  }, [formState.success]);

  const openDialog: MouseEventHandler = (event) => {
    event.preventDefault();
    setOpen(true);
  };

  const defaultTaskContext = activeRole !== "all"
    ? `role:${activeRole}`
    : availableRoles.length === 1
      ? `role:${availableRoles[0]}`
      : "general";

  return (
    <>
      {trigger ? (
        isValidElement(trigger) ? (
          cloneElement(trigger as ReactElement<{ onClick?: MouseEventHandler }>, {
            onClick: openDialog,
          })
        ) : (
          <div onClick={openDialog}>{trigger}</div>
        )
      ) : (
        <button
          onClick={openDialog}
          className="w-full rounded-3xl border border-dashed border-slate-700/40 py-4 text-xs font-semibold text-slate-500 transition-all hover:border-cyan-500/35 hover:bg-cyan-500/5 hover:text-cyan-400"
        >
          + Add priority
        </button>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title={title}>
        {formState.success ? (
          <div className="space-y-4 py-2 text-center">
            <p className="text-sm font-semibold text-emerald-400">✓ Priority added</p>
            <p className="text-xs text-slate-500">Your agenda has been updated.</p>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300"
            >
              Close
            </button>
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <label className="block text-xs font-medium text-slate-400">
              What needs to happen?
              <input
                name="title"
                autoFocus
                className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/60"
                placeholder="Prepare project milestone brief"
              />
            </label>

            <label className="block text-xs font-medium text-slate-400">
              Why does it matter right now?
              <textarea
                name="description"
                rows={2}
                className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/60"
                placeholder="Context helps AI sequence this correctly."
              />
            </label>

            <label className="block text-xs font-medium text-slate-400">
              Subject or project (optional)
              <input
                name="subject"
                className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/60"
                placeholder="e.g. Physics, Project Alpha, Class 10A"
              />
            </label>

            <div className="grid grid-cols-3 gap-3">
              <label className="text-xs font-medium text-slate-400">
                Due date
                <input
                  id={dueDateInputId}
                  name="dueDate"
                  type="date"
                  defaultValue={defaultDueDate}
                  className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500/40"
                />
              </label>
              <label className="text-xs font-medium text-slate-400">
                Minutes
                <input
                  name="estimatedMinutes"
                  type="number"
                  min="5"
                  step="5"
                  defaultValue="25"
                  className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500/40"
                />
              </label>
              <label className="text-xs font-medium text-slate-400">
                Priority
                <select
                  name="priority"
                  defaultValue="medium"
                  className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500/40"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
            </div>

            {availableRoles.length > 0 ? (
              <label className="block text-xs font-medium text-slate-400">
                Task context
                <select
                  name="taskContext"
                  defaultValue={defaultTaskContext}
                  className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/60"
                >
                  {availableRoles.map((role) => (
                    <option key={role} value={`role:${role}`}>
                      {role}
                    </option>
                  ))}
                  {availableRoles.length > 1 ? <option value="shared">Shared across roles</option> : null}
                  <option value="general">General</option>
                </select>
              </label>
            ) : null}

            {formState.error ? <p className="text-xs text-red-400">{formState.error}</p> : null}

            <button
              type="submit"
              className="w-full rounded-full bg-linear-to-r from-cyan-500 to-cyan-600 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all hover:shadow-[0_0_32px_rgba(34,211,238,0.5)]"
            >
              Save priority
            </button>
          </form>
        )}
      </Dialog>
    </>
  );
}
