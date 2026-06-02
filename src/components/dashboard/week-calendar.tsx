"use client";

import { useMemo, useState, useTransition } from "react";
import type { DragEvent } from "react";

import { moveTaskToDate } from "@/app/actions/dashboard";
import { AddTaskDialog } from "@/components/dashboard/add-task-dialog";
import { EditTaskDialog } from "@/components/dashboard/edit-task-dialog";
import { planLaneTone, planLaneTitle, type PlanLane } from "@/components/dashboard/plan-lanes";
import type { DashboardData, TaskRecord } from "@/lib/dashboard-data";

interface WeekCalendarProps {
  tasks: TaskRecord[];
  category?: string;
  rolePlans?: DashboardData["rolePlans"];
  weekOffset?: number;
  onWeekOffsetChange?: (weekOffset: number) => void;
  highlightedTaskTitles?: string[];
}

const SUBJECT_COLORS = [
  { bg: "bg-cyan-500/20", border: "border-cyan-500/40", text: "text-cyan-300", dot: "bg-cyan-400" },
  { bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-300", dot: "bg-emerald-400" },
  { bg: "bg-indigo-500/20", border: "border-indigo-500/40", text: "text-indigo-300", dot: "bg-indigo-400" },
  { bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-300", dot: "bg-amber-400" },
  { bg: "bg-rose-500/20", border: "border-rose-500/40", text: "text-rose-300", dot: "bg-rose-400" },
  { bg: "bg-violet-500/20", border: "border-violet-500/40", text: "text-violet-300", dot: "bg-violet-400" },
];

function hashSubject(subject: string): number {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = (hash * 31 + subject.charCodeAt(i)) & 0xffff;
  }
  return hash % SUBJECT_COLORS.length;
}

function getSubjectColor(subject: string | null | undefined) {
  if (!subject) return SUBJECT_COLORS[0];
  return SUBJECT_COLORS[hashSubject(subject)];
}

function formatDay(date: Date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

function isoDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatRangeLabel(days: Date[]) {
  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  const sameMonth = firstDay.getMonth() === lastDay.getMonth() && firstDay.getFullYear() === lastDay.getFullYear();

  const firstLabel = firstDay.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const lastLabel = lastDay.toLocaleDateString("en-US", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
  });

  return `${firstLabel} - ${lastLabel}`;
}

export function WeekCalendar({
  tasks,
  rolePlans = [],
  weekOffset: controlledWeekOffset,
  onWeekOffsetChange,
  highlightedTaskTitles = [],
}: WeekCalendarProps) {
  const [internalWeekOffset, setInternalWeekOffset] = useState(0);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [isMoving, startMoveTransition] = useTransition();

  const weekOffset = controlledWeekOffset ?? internalWeekOffset;

  const updateWeekOffset = (nextWeekOffset: number) => {
    if (controlledWeekOffset === undefined) {
      setInternalWeekOffset(nextWeekOffset);
    }
    onWeekOffsetChange?.(nextWeekOffset);
  };

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + weekOffset * 7 + i);
      return d;
    });
  }, [today, weekOffset]);

  const nextWeekTaskCount = useMemo(() => {
    const nextMon = new Date(today);
    const d = today.getDay();
    nextMon.setDate(today.getDate() + (d === 0 ? 1 : 8 - d));
    const nextSun = new Date(nextMon);
    nextSun.setDate(nextMon.getDate() + 6);
    return tasks.filter((t) => {
      if (!t.due_date || t.status === "completed") return false;
      return t.due_date >= isoDate(nextMon) && t.due_date <= isoDate(nextSun);
    }).length;
  }, [tasks, today]);

  const { scheduledTasks, unscheduledOpen, completedTasks, subjects } = useMemo(() => {
    const scheduled: Record<string, TaskRecord[]> = {};
    const unscheduledOpen: TaskRecord[] = [];
    const completedTasks: TaskRecord[] = [];
    const subjectSet = new Set<string>();

    for (const task of tasks) {
      if (task.subject) subjectSet.add(task.subject);
      if (task.status === "completed") {
        completedTasks.push(task);
        continue;
      }
      if (!task.due_date) {
        unscheduledOpen.push(task);
        continue;
      }
      const key = task.due_date.split("T")[0];
      scheduled[key] = scheduled[key] ?? [];
      scheduled[key].push(task);
    }

    return { scheduledTasks: scheduled, unscheduledOpen, completedTasks, subjects: [...subjectSet] };
  }, [tasks]);

  const highlightedTaskSet = useMemo(
    () => new Set(highlightedTaskTitles.map((title) => title.trim().toLowerCase())),
    [highlightedTaskTitles],
  );

  const taskLaneMap = useMemo(() => {
    const map = new Map<string, PlanLane>();

    for (const rolePlan of rolePlans) {
      for (const task of rolePlan.tasks) {
        const current = map.get(task.id);
        if (!current) {
          map.set(task.id, rolePlan.role);
        } else if (current !== rolePlan.role) {
          map.set(task.id, "shared");
        }
      }
    }

    return map;
  }, [rolePlans]);

  const getTaskLane = (taskId: string) => taskLaneMap.get(taskId) ?? "general";

  // AI overlap warning: subject with tasks on 3+ different days
  const subjectOverlapWarning = useMemo(() => {
    if (subjects.length === 0) return null;

    const visibleDayKeys = new Set(days.map((day) => isoDate(day)));
    const subjectDays: Record<string, Set<string>> = {};
    for (const [day, dayTasks] of Object.entries(scheduledTasks)) {
      if (!visibleDayKeys.has(day)) continue;
      for (const t of dayTasks) {
        if (!t.subject) continue;
        subjectDays[t.subject] = subjectDays[t.subject] ?? new Set();
        subjectDays[t.subject].add(day);
      }
    }
    const spread = Object.entries(subjectDays).find(([, days]) => days.size >= 3);
    if (!spread) return null;
    return `"${spread[0]}" is scattered across ${spread[1].size} days. Group same-subject work to reduce context switching.`;
  }, [days, scheduledTasks, subjects]);

  const todayKey = isoDate(today);
  const rangeLabel = useMemo(() => formatRangeLabel(days), [days]);

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, taskId: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", taskId);
    setDraggingTaskId(taskId);
    setMoveError(null);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDropTargetKey(null);
  };

  const handleDrop = (event: DragEvent<HTMLElement>, dueDate: string | null) => {
    event.preventDefault();

    const taskId = event.dataTransfer.getData("text/plain") || draggingTaskId;
    setDropTargetKey(null);
    setDraggingTaskId(null);

    if (!taskId) {
      return;
    }

    startMoveTransition(async () => {
      const result = await moveTaskToDate(taskId, dueDate);
      if (result?.error) {
        setMoveError(result.error);
      }
    });
  };

  const handleDragOver = (event: DragEvent<HTMLElement>, targetKey: string) => {
    if (!draggingTaskId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dropTargetKey !== targetKey) {
      setDropTargetKey(targetKey);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700/30 bg-slate-950/30 px-3 py-2.5">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">Visible week</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">{rangeLabel}</p>
          <p className="mt-1 text-xs text-slate-500">Drag open tasks between days, or drop them into Unscheduled.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateWeekOffset(weekOffset - 1)}
            className="rounded-full border border-slate-700/40 px-3 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => updateWeekOffset(0)}
            className="rounded-full border border-slate-700/40 px-3 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
          >
            This week
          </button>
          <button
            type="button"
            onClick={() => updateWeekOffset(weekOffset + 1)}
            className="relative rounded-full border border-slate-700/40 px-3 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
          >
            Next week
            {weekOffset === 0 && nextWeekTaskCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-bold text-slate-950">
                {nextWeekTaskCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Subject legend */}
      <div className="flex flex-wrap gap-2">
        {([
          "Student",
          "Employee",
          "Teacher",
          "shared",
          "general",
        ] as PlanLane[]).map((lane) => {
          const tone = planLaneTone(lane);

          return (
            <span
              key={lane}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tone.bg} ${tone.border} ${tone.text}`}
            >
              <span className={`h-2 w-2 rounded-full ${tone.pill.split(" ")[0]}`} />
              {planLaneTitle(lane)}
            </span>
          );
        })}
      </div>

      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {subjects.map((subj) => {
            const color = getSubjectColor(subj);
            return (
              <span
                key={subj}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${color.bg} ${color.border} ${color.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                {subj}
              </span>
            );
          })}
          {subjects.length === 0 && (
            <span className="text-xs text-slate-500 italic">No subjects yet — tag tasks by subject to see grouping.</span>
          )}
        </div>
      )}

      {/* AI overlap warning */}
      {subjectOverlapWarning && (
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <span className="text-amber-400 text-sm mt-0.5">⚠</span>
          <p className="text-xs text-amber-300 leading-relaxed">{subjectOverlapWarning}</p>
        </div>
      )}

      {moveError ? <p className="text-xs text-red-400">{moveError}</p> : null}

      {/* Empty state when no tasks at all */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-700/40 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10">
            <span className="text-xl">📅</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">No tasks scheduled yet</p>
            <p className="mt-1 text-xs text-slate-500">Add a task with a due date and it will appear on the calendar.</p>
          </div>
        </div>
      )}

      {/* 7-day grid */}
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-max auto-cols-[minmax(140px,1fr)] grid-flow-col gap-2 md:min-w-0 md:grid-cols-7 md:grid-flow-row md:auto-cols-auto">
        {days.map((day) => {
          const key = isoDate(day);
          const isToday = key === todayKey;
          const dayTasks = scheduledTasks[key] ?? [];
          const isPast = day < today;

          return (
            <div
              key={key}
              onDragOver={(event) => handleDragOver(event, key)}
              onDragLeave={() => {
                if (dropTargetKey === key) {
                  setDropTargetKey(null);
                }
              }}
              onDrop={(event) => handleDrop(event, key)}
              className={`min-h-30 w-35 rounded-xl p-2 flex flex-col gap-1.5 border transition-colors md:w-auto ${
                isToday
                  ? "bg-cyan-500/10 border-cyan-500/40"
                  : isPast
                    ? "bg-white/2 border-white/5"
                    : "bg-white/3 border-white/10"
              } ${dropTargetKey === key ? "ring-2 ring-cyan-400/60 ring-inset" : ""} ${isMoving ? "opacity-90" : ""}`}
            >
              {/* Day header */}
              <div className="pb-1 border-b border-white/10">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col items-start">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wide ${isToday ? "text-cyan-400" : "text-slate-500"}`}
                    >
                      {formatDay(day)}
                    </span>
                    <span
                      className={`text-sm font-bold leading-none ${isToday ? "text-cyan-300" : isPast ? "text-slate-600" : "text-slate-300"}`}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                  <AddTaskDialog
                    defaultDueDate={key}
                    title={`Add task for ${formatDay(day)} ${day.getDate()}`}
                    trigger={
                      <button
                        type="button"
                        className="rounded-full border border-slate-700/40 px-2 py-0.5 text-[10px] font-semibold text-slate-400 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
                        aria-label={`Add task for ${formatDay(day)} ${day.getDate()}`}
                      >
                        Add
                      </button>
                    }
                  />
                </div>
              </div>

              {/* Task chips */}
              <div className="flex flex-col gap-1 flex-1">
                {dayTasks.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center">
                    <AddTaskDialog
                      defaultDueDate={key}
                      title={`Add task for ${formatDay(day)} ${day.getDate()}`}
                      trigger={
                        <button
                          type="button"
                          className="rounded-xl border border-dashed border-slate-700/40 px-3 py-2 text-[10px] font-semibold text-slate-500 transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/5 hover:text-cyan-300"
                        >
                          + Add task
                        </button>
                      }
                    />
                  </div>
                ) : (
                  dayTasks.map((task) => {
                    const color = getSubjectColor(task.subject);
                    const lane = getTaskLane(task.id);
                    const laneTone = planLaneTone(lane);
                    const isHighlighted = highlightedTaskSet.has(task.title.trim().toLowerCase());
                    return (
                      <EditTaskDialog
                        key={task.id}
                        task={task}
                        trigger={
                          <button
                            type="button"
                            draggable
                            onDragStart={(event) => handleDragStart(event, task.id)}
                            onDragEnd={handleDragEnd}
                            className={`w-full rounded-lg border px-1.5 py-1 text-left text-[10px] leading-snug font-medium wrap-break-word transition-all ${laneTone.bg} ${laneTone.border} ${laneTone.text} ${isHighlighted ? "ring-2 ring-emerald-300/70 shadow-[0_0_18px_rgba(16,185,129,0.28)] animate-pulse" : ""} ${draggingTaskId === task.id ? "opacity-30 cursor-grabbing" : "cursor-grab hover:opacity-80"}`}
                            title={`Edit ${task.title}`}
                          >
                            <span className="flex flex-col gap-1">
                              <span className="flex items-start justify-between gap-2">
                                <span className="min-w-0 flex-1">{task.title}</span>
                                {isHighlighted ? (
                                  <span className="shrink-0 rounded-full border border-emerald-300/40 bg-emerald-400/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-100">
                                    New
                                  </span>
                                ) : null}
                              </span>
                              <span className="flex flex-wrap items-center gap-1.5">
                                <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${laneTone.pill}`}>
                                  {planLaneTitle(lane)}
                                </span>
                                {task.subject ? (
                                  <span className="inline-flex items-center gap-1 text-[8px] text-slate-200/80">
                                    <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                                    {task.subject}
                                  </span>
                                ) : null}
                              </span>
                            </span>
                          </button>
                        }
                      />
                    );
                  })
                )}
              </div>

              {dayTasks.length > 0 && (
                <div className="text-[9px] text-slate-600 text-center">
                  {dayTasks.length} task{dayTasks.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>

      {/* Unscheduled open tasks */}
      {unscheduledOpen.length > 0 && (
        <div
          className={`space-y-2 rounded-2xl border px-3 py-3 transition-colors ${dropTargetKey === "unscheduled" ? "border-cyan-500/50 bg-cyan-500/8" : "border-slate-800/40 bg-slate-950/20"}`}
          onDragOver={(event) => handleDragOver(event, "unscheduled")}
          onDragLeave={() => {
            if (dropTargetKey === "unscheduled") {
              setDropTargetKey(null);
            }
          }}
          onDrop={(event) => handleDrop(event, null)}
        >
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unscheduled</h4>
          <div className="flex flex-wrap gap-2">
            {unscheduledOpen.map((task) => {
              const color = getSubjectColor(task.subject);
              const lane = getTaskLane(task.id);
              const laneTone = planLaneTone(lane);
              return (
                <EditTaskDialog
                  key={task.id}
                  task={task}
                  trigger={
                    <button
                      type="button"
                      draggable
                      onDragStart={(event) => handleDragStart(event, task.id)}
                      onDragEnd={handleDragEnd}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-opacity ${laneTone.bg} ${laneTone.border} ${laneTone.text} ${draggingTaskId === task.id ? "opacity-30 cursor-grabbing" : "cursor-grab hover:opacity-80"}`}
                      title={task.subject ?? undefined}
                    >
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${laneTone.pill}`}>{planLaneTitle(lane)}</span>
                      {task.subject && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color.dot}`} />}
                      {task.title}
                    </button>
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Completed history */}
      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</h4>
          <div className="flex flex-wrap gap-2">
            {completedTasks.map((task) => {
              const color = getSubjectColor(task.subject);
              const lane = getTaskLane(task.id);
              const laneTone = planLaneTone(lane);
              return (
                <EditTaskDialog
                  key={task.id}
                  task={task}
                  trigger={
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium opacity-50 ${laneTone.bg} ${laneTone.border} ${laneTone.text}`}
                      title={task.subject ?? undefined}
                    >
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${laneTone.pill}`}>{planLaneTitle(lane)}</span>
                      {task.subject && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color.dot}`} />}
                      <span className="line-through">{task.title}</span>
                    </button>
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
