"use client";

import { cloneElement, isValidElement, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import type { MouseEventHandler, ReactElement, ReactNode } from "react";

import { deleteTask, updateTask, completeTask, type TaskActionState } from "@/app/actions/dashboard";
import { Dialog } from "@/components/ui/dialog";
import type { TaskRecord } from "@/lib/dashboard-data";
import type { ActiveRole, SupportedRole } from "@/lib/role-context";

const initialState: TaskActionState = {};

type EditTaskDialogProps = {
  task: TaskRecord;
  trigger: ReactNode;
  activeRole?: ActiveRole;
  availableRoles?: SupportedRole[];
};

export function EditTaskDialog({ task, trigger, activeRole = "all", availableRoles = [] }: EditTaskDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(updateTask, initialState);
  const formState = state ?? initialState;
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isCompleting, startCompleteTransition] = useTransition();

  useEffect(() => {
    if (formState.success) {
      const timer = globalThis.setTimeout(() => setOpen(false), 900);
      return () => clearTimeout(timer);
    }
  }, [formState.success]);

  useEffect(() => {
    if (!open) {
      setDeleteError(null);
    }
  }, [open]);

  const openDialog: MouseEventHandler = (event) => {
    event.preventDefault();
    setOpen(true);
  };

  const defaultTaskContext = task.task_lane === "shared"
    ? "shared"
    : task.task_lane === "general"
      ? "general"
      : task.resolved_role
        ? `role:${task.resolved_role}`
        : activeRole !== "all"
          ? `role:${activeRole}`
          : availableRoles.length === 1
            ? `role:${availableRoles[0]}`
            : "general";

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    setDeleteError(null);

    startDeleteTransition(async () => {
      const result = await deleteTask(task.id);
      if (result?.error) {
        setDeleteError(result.error);
        return;
      }

      router.refresh();
      setOpen(false);
    });
  };

  const handleComplete: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    setDeleteError(null);

    startCompleteTransition(async () => {
      const formData = new FormData();
      formData.set("taskId", task.id);
      await completeTask(formData);
      router.refresh();
      setOpen(false);
    });
  };

  return (
    <>
      {isValidElement(trigger)
        ? cloneElement(trigger as ReactElement<{ onClick?: MouseEventHandler }>, {
            onClick: openDialog,
          })
        : <div onClick={openDialog}>{trigger}</div>}

      <Dialog open={open} onClose={() => setOpen(false)} title="Edit task">
        {formState.success ? (
          <div className="space-y-4 py-2 text-center">
            <p className="text-sm font-semibold text-emerald-400">✓ Task updated</p>
            <p className="text-xs text-slate-500">Your calendar and agenda have been refreshed.</p>
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <input type="hidden" name="taskId" value={task.id} />

            <label className="block text-xs font-medium text-slate-400">
              What needs to happen?
              <input
                name="title"
                autoFocus
                defaultValue={task.title}
                className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/60"
              />
            </label>

            <label className="block text-xs font-medium text-slate-400">
              Why does it matter right now?
              <textarea
                name="description"
                rows={2}
                defaultValue={task.description ?? ""}
                className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/60"
              />
            </label>

            <label className="block text-xs font-medium text-slate-400">
              Subject or project (optional)
              <input
                name="subject"
                defaultValue={task.subject ?? ""}
                className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-cyan-500/40 focus:bg-slate-800/60"
              />
            </label>

            <div className="grid grid-cols-3 gap-3">
              <label className="text-xs font-medium text-slate-400">
                Due date
                <input
                  name="dueDate"
                  type="date"
                  defaultValue={task.due_date ?? ""}
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
                  defaultValue={task.estimated_minutes ?? 25}
                  className="mt-1.5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500/40"
                />
              </label>
              <label className="text-xs font-medium text-slate-400">
                Priority
                <select
                  name="priority"
                  defaultValue={task.priority}
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
            {deleteError ? <p className="text-xs text-red-400">{deleteError}</p> : null}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isCompleting}
                className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition-colors hover:border-red-500/50 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                onClick={handleComplete}
                disabled={isCompleting || isDeleting || task.status === "completed"}
                className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:border-emerald-500/60 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCompleting ? "Marking..." : "Mark done"}
              </button>
              <button
                type="submit"
                disabled={isDeleting || isCompleting}
                className="flex-1 rounded-full bg-linear-to-r from-cyan-500 to-cyan-600 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all hover:shadow-[0_0_32px_rgba(34,211,238,0.5)] disabled:opacity-60"
              >
                Save changes
              </button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}