"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeTask, moveTaskToDate, startTask } from "@/app/actions/dashboard";
import type { TaskRecord } from "@/lib/dashboard-data";

interface TaskIntelPanelProps {
  tasks: TaskRecord[];
}

type AlertLevel = "critical" | "warning" | "info";

interface TaskAlert {
  taskId: string;
  title: string;
  subject: string | null;
  level: AlertLevel;
  message: string;
  suggestion: string;
  dueDate: string | null;
  status: string;
  priority: string;
}

function classifyTasks(tasks: TaskRecord[]): {
  alerts: TaskAlert[];
  overdueCount: number;
  todayCount: number;
  inProgressCount: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const activeTasks = tasks.filter((t) => t.status !== "completed");

  const alerts: TaskAlert[] = [];
  let overdueCount = 0;
  let todayCount = 0;
  let inProgressCount = 0;

  for (const task of activeTasks) {
    if (task.status === "in_progress") inProgressCount++;

    if (!task.due_date) continue;

    const due = new Date(task.due_date + "T00:00:00");
    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      overdueCount++;
      const daysLate = Math.abs(diffDays);
      alerts.push({
        taskId: task.id,
        title: task.title,
        subject: task.subject,
        level: "critical",
        message: `${daysLate} day${daysLate > 1 ? "s" : ""} overdue`,
        suggestion:
          task.priority === "high"
            ? "This is high priority — start it now or move to today."
            : "Reschedule to today or this week to clear the backlog.",
        dueDate: task.due_date,
        status: task.status,
        priority: task.priority,
      });
    } else if (diffDays === 0) {
      todayCount++;
      alerts.push({
        taskId: task.id,
        title: task.title,
        subject: task.subject,
        level: task.status === "in_progress" ? "info" : "warning",
        message: task.status === "in_progress" ? "In progress — due today" : "Due today — not started",
        suggestion:
          task.status === "in_progress"
            ? "You're on it. Mark done when finished."
            : "Start this now to stay on track.",
        dueDate: task.due_date,
        status: task.status,
        priority: task.priority,
      });
    } else if (diffDays === 1) {
      alerts.push({
        taskId: task.id,
        title: task.title,
        subject: task.subject,
        level: "info",
        message: "Due tomorrow",
        suggestion: "Get a head start today if your schedule allows.",
        dueDate: task.due_date,
        status: task.status,
        priority: task.priority,
      });
    }
  }

  // Sort: critical first, then warning, then info
  alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.level] - order[b.level];
  });

  return { alerts, overdueCount, todayCount, inProgressCount };
}

function AlertRow({ alert, onActionDone }: { alert: TaskAlert; onActionDone: () => void }) {
  const [isPending, startTransition] = useTransition();

  const handleMoveToToday = () => {
    const today = new Date().toISOString().split("T")[0];
    startTransition(async () => {
      await moveTaskToDate(alert.taskId, today);
      onActionDone();
    });
  };

  const handleStart = () => {
    startTransition(async () => {
      await startTask(alert.taskId);
      onActionDone();
    });
  };

  const handleComplete = () => {
    const formData = new FormData();
    formData.append("taskId", alert.taskId);
    startTransition(async () => {
      await completeTask(formData);
      onActionDone();
    });
  };

  const levelStyles = {
    critical: "border-rose-500/30 bg-rose-500/8",
    warning: "border-amber-500/30 bg-amber-500/8",
    info: "border-cyan-500/20 bg-cyan-500/5",
  };

  const badgeStyles = {
    critical: "bg-rose-500/20 text-rose-300",
    warning: "bg-amber-500/20 text-amber-300",
    info: "bg-cyan-500/15 text-cyan-400",
  };

  const dotStyles = {
    critical: "bg-rose-400 animate-pulse",
    warning: "bg-amber-400 animate-pulse",
    info: "bg-cyan-400",
  };

  return (
    <div className={`rounded-2xl border p-3 ${levelStyles[alert.level]}`}>
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotStyles[alert.level]}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-1">
            <p className="text-sm font-medium text-slate-100">{alert.title}</p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeStyles[alert.level]}`}>
              {alert.message}
            </span>
          </div>
          {alert.subject && (
            <p className="mt-0.5 text-xs text-slate-500">{alert.subject}</p>
          )}
          <p className="mt-1 text-xs text-slate-400 italic">💡 {alert.suggestion}</p>

          {/* Quick actions */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {alert.status !== "in_progress" && alert.level !== "info" && (
              <button
                onClick={handleStart}
                disabled={isPending}
                className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20 disabled:opacity-50"
              >
                ▶ Start now
              </button>
            )}
            {alert.level === "critical" && (
              <button
                onClick={handleMoveToToday}
                disabled={isPending}
                className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300 transition-all hover:bg-amber-500/20 disabled:opacity-50"
              >
                📅 Move to today
              </button>
            )}
            <button
              onClick={handleComplete}
              disabled={isPending}
              className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
            >
              ✓ Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TaskIntelPanel({ tasks }: TaskIntelPanelProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { alerts, overdueCount, todayCount, inProgressCount } = classifyTasks(tasks);

  const hasUrgent = overdueCount > 0 || todayCount > 0;

  if (alerts.length === 0) {
    return (
      <section className="rounded-3xl border border-emerald-500/25 bg-emerald-500/5 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <p className="text-sm font-semibold text-emerald-300">All clear — no overdue or urgent tasks</p>
          {inProgressCount > 0 && (
            <span className="ml-auto rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
              {inProgressCount} in progress
            </span>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`rounded-3xl border px-5 py-4 transition-all ${
        overdueCount > 0
          ? "border-rose-500/30 bg-rose-500/5"
          : "border-amber-500/30 bg-amber-500/5"
      }`}
    >
      {/* Header / Summary bar */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 text-left"
      >
        {hasUrgent && (
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full animate-pulse ${
              overdueCount > 0 ? "bg-rose-400" : "bg-amber-400"
            }`}
          />
        )}

        <div className="flex flex-1 flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-100">
            AI Progress Pulse
          </p>
          {overdueCount > 0 && (
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
              {overdueCount} overdue
            </span>
          )}
          {todayCount > 0 && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
              {todayCount} due today
            </span>
          )}
          {inProgressCount > 0 && (
            <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
              {inProgressCount} in progress
            </span>
          )}
        </div>

        <span className="shrink-0 text-xs text-slate-500 transition-transform" style={{ transform: expanded ? "rotate(180deg)" : undefined }}>
          ▾
        </span>
      </button>

      {/* AI coaching message */}
      {!expanded && (
        <p className="mt-2 text-xs text-slate-400">
          {overdueCount > 0
            ? `You have ${overdueCount} overdue ${overdueCount === 1 ? "task" : "tasks"} — tap to review and act.`
            : `${todayCount} ${todayCount === 1 ? "task" : "tasks"} need attention today.`}
        </p>
      )}

      {/* Expanded alerts */}
      {expanded && (
        <div className="mt-3 space-y-2">
          {alerts.map((alert) => (
            <AlertRow
              key={alert.taskId + refreshKey}
              alert={alert}
              onActionDone={() => {
                setRefreshKey((k) => k + 1);
                router.refresh();
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
