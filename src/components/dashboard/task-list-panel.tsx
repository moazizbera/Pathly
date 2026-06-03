"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { completeTask, startTask } from "@/app/actions/dashboard";
import { Dialog } from "@/components/ui/dialog";
import { EditTaskDialog } from "@/components/dashboard/edit-task-dialog";
import { TaskHelpButton, type TaskSupportProfile } from "@/components/dashboard/task-resource-panel";
import { planLaneTitle, planLaneTone, type PlanLane } from "@/components/dashboard/plan-lanes";
import type { DashboardData, TaskRecord } from "@/lib/dashboard-data";
import type { ActiveRole, SupportedRole } from "@/lib/role-context";

function PriorityChip({ priority }: { priority: string }) {
  const cls =
    priority === "high"
      ? "badge-cyan"
      : priority === "medium"
        ? "badge-emerald"
        : "badge-indigo";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {priority}
    </span>
  );
}

function TaskRow({ task, profile, activeRole, availableRoles }: { task: TaskRecord; profile: TaskSupportProfile; activeRole: ActiveRole; availableRoles: SupportedRole[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isInProgress = task.status === "in_progress";

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await startTask(task.id);
      router.refresh();
    });
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const formData = new FormData();
    formData.set("taskId", task.id);

    startTransition(async () => {
      await completeTask(formData);
      router.refresh();
    });
  };

  return (
    <article
      className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
        isInProgress
          ? "border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/8"
          : "border-slate-700/30 bg-slate-800/20 hover:border-slate-600/50 hover:bg-slate-800/30"
      }`}
    >
      {/* Status indicator / complete button */}
      <div className="relative shrink-0">
        {isInProgress && (
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
        )}
        <button
          type="button"
          title="Mark done"
          disabled={isPending}
          className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs transition-all hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-300 ${
            isInProgress
              ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-400"
              : "border-slate-600/50 bg-slate-800/60 text-slate-500"
          } disabled:cursor-not-allowed disabled:opacity-60`}
          onClick={handleComplete}
        >
          ✓
        </button>
      </div>

      <TaskHelpButton task={task} profile={profile} />

      <EditTaskDialog
        task={task}
        activeRole={activeRole}
        availableRoles={availableRoles}
        trigger={
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
            title="Edit task"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-slate-100">{task.title}</p>
                {isInProgress && (
                  <span className="shrink-0 rounded-full bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400">
                    In progress
                  </span>
                )}
              </div>
              {task.description ? (
                <p className="mt-0.5 truncate text-xs text-slate-500">{task.description}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {task.due_date ? (
                <span className="text-xs text-slate-600">{task.due_date}</span>
              ) : null}
              <PriorityChip priority={task.priority} />
              <span className="text-[10px] text-slate-700 opacity-0 transition-opacity group-hover:opacity-100">✎</span>
            </div>
          </button>
        }
      />

      {/* Start button shown on hover when not in progress */}
      {!isInProgress && (
        <button
          onClick={handleStart}
          disabled={isPending}
          title="Mark as in progress"
          className="shrink-0 rounded-full border border-slate-700/40 px-2 py-0.5 text-[10px] font-semibold text-slate-500 opacity-0 transition-all group-hover:opacity-100 hover:border-cyan-500/40 hover:text-cyan-400 disabled:cursor-not-allowed"
        >
          ▶ Start
        </button>
      )}
    </article>
  );
}

function CompletedRow({ task, profile, activeRole, availableRoles }: { task: TaskRecord; profile: TaskSupportProfile; activeRole: ActiveRole; availableRoles: SupportedRole[] }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-3 opacity-60 transition-opacity hover:opacity-80">
      <span className="shrink-0 text-xs text-emerald-400">✓</span>
      <EditTaskDialog
        task={task}
        activeRole={activeRole}
        availableRoles={availableRoles}
        trigger={
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center text-left"
            title="View completed task"
          >
            <p className="min-w-0 flex-1 truncate text-xs text-slate-400 line-through">{task.title}</p>
          </button>
        }
      />
      <TaskHelpButton task={task} profile={profile} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-500/25 bg-cyan-500/10 text-[11px] font-semibold text-cyan-200 transition-all hover:border-cyan-400/60 hover:bg-cyan-500/20 hover:text-cyan-100" />
    </div>
  );
}

function buildTaskRoleMap(rolePlans: DashboardData["rolePlans"]) {
  const map = new Map<string, Array<"Student" | "Employee" | "Teacher">>();

  for (const rolePlan of rolePlans) {
    for (const task of rolePlan.tasks) {
      map.set(task.id, [...(map.get(task.id) ?? []), rolePlan.role]);
    }
  }

  return map;
}

function groupTasksByRole(tasks: TaskRecord[], rolePlans: DashboardData["rolePlans"]) {
  const roleMap = buildTaskRoleMap(rolePlans);
  const ordered = tasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) => {
      if (a.status === "in_progress" && b.status !== "in_progress") return -1;
      if (b.status === "in_progress" && a.status !== "in_progress") return 1;
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return 0;
    });

  const sections = [
    {
      key: "student",
      lane: "Student" as PlanLane,
      tasks: ordered.filter((task) => {
        const roles = roleMap.get(task.id) ?? [];
        return roles.length === 1 && roles[0] === "Student";
      }),
    },
    {
      key: "employee",
      lane: "Employee" as PlanLane,
      tasks: ordered.filter((task) => {
        const roles = roleMap.get(task.id) ?? [];
        return roles.length === 1 && roles[0] === "Employee";
      }),
    },
    {
      key: "teacher",
      lane: "Teacher" as PlanLane,
      tasks: ordered.filter((task) => {
        const roles = roleMap.get(task.id) ?? [];
        return roles.length === 1 && roles[0] === "Teacher";
      }),
    },
    {
      key: "shared",
      lane: "shared" as PlanLane,
      tasks: ordered.filter((task) => (roleMap.get(task.id)?.length ?? 0) > 1),
    },
    {
      key: "general",
      lane: "general" as PlanLane,
      tasks: ordered.filter((task) => (roleMap.get(task.id)?.length ?? 0) === 0),
    },
  ];

  return sections.filter((section) => section.tasks.length > 0);
}

export function TaskListPanel({
  tasks,
  profile,
  activeRole,
  availableRoles,
  rolePlans,
}: {
  tasks: TaskRecord[];
  profile: TaskSupportProfile;
  activeRole: ActiveRole;
  availableRoles: SupportedRole[];
  rolePlans: DashboardData["rolePlans"];
}) {
  const [showAll, setShowAll] = useState(false);

  const open = tasks.filter((t) => t.status !== "completed");
  const done = tasks.filter((t) => t.status === "completed");
  const groupedOpen = groupTasksByRole(tasks, rolePlans);
  const previewGroups = groupedOpen.map((group) => ({
    ...group,
    tasks: group.tasks.slice(0, 2),
    remaining: Math.max(group.tasks.length - 2, 0),
  }));

  return (
    <>
      <div className="space-y-2">
        {groupedOpen.length === 0 ? (
          <p className="py-3 text-center text-xs text-slate-600">No open tasks. Add one below.</p>
        ) : (
          previewGroups.map((group) => (
            <section key={group.key} className={`rounded-2xl border p-3 ${planLaneTone(group.lane).border} ${planLaneTone(group.lane).bg}`}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${planLaneTone(group.lane).text}`}>{planLaneTitle(group.lane)}</p>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${planLaneTone(group.lane).pill}`}>
                  {group.tasks.length + group.remaining}
                </span>
              </div>
              <div className="space-y-2">
                {group.tasks.map((task) => <TaskRow key={task.id} task={task} profile={profile} activeRole={activeRole} availableRoles={availableRoles} />)}
              </div>
              {group.remaining > 0 ? (
                <p className="mt-2 text-xs text-slate-500">+ {group.remaining} more in this lane</p>
              ) : null}
            </section>
          ))
        )}

        {open.length > 0 ? (
          <button
            onClick={() => setShowAll(true)}
            className="w-full rounded-2xl border border-dashed border-slate-700/40 py-2.5 text-xs font-semibold text-slate-500 transition-colors hover:border-cyan-500/30 hover:text-cyan-400"
          >
            Show all {open.length} tasks →
          </button>
        ) : null}

        {done.length > 0 && open.length === 0 ? (
          <button
            onClick={() => setShowAll(true)}
            className="w-full rounded-2xl border border-dashed border-emerald-700/30 py-2.5 text-xs font-semibold text-slate-500 transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
          >
            View {done.length} completed →
          </button>
        ) : null}
      </div>

      <Dialog
        open={showAll}
        onClose={() => setShowAll(false)}
        title={`Tasks · ${open.length} open`}
      >
        <div className="space-y-2">
          {groupedOpen.length === 0 ? (
            <p className="text-xs text-slate-500">All tasks are done.</p>
          ) : (
            groupedOpen.map((group) => (
              <section key={group.key} className={`rounded-2xl border p-3 ${planLaneTone(group.lane).border} ${planLaneTone(group.lane).bg}`}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${planLaneTone(group.lane).text}`}>{planLaneTitle(group.lane)}</p>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${planLaneTone(group.lane).pill}`}>
                    {group.tasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.tasks.map((task) => <TaskRow key={task.id} task={task} profile={profile} activeRole={activeRole} availableRoles={availableRoles} />)}
                </div>
              </section>
            ))
          )}

          {done.length > 0 ? (
            <div className="pt-3">
              <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-slate-600 uppercase">
                Completed · {done.length}
              </p>
              <div className="space-y-2">
                {done.map((task) => (
                  <CompletedRow key={task.id} task={task} profile={profile} activeRole={activeRole} availableRoles={availableRoles} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Dialog>
    </>
  );
}
