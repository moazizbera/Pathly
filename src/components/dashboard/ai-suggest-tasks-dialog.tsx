"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { suggestTasksForNextWeek, createTask, type SuggestedTask } from "@/app/actions/dashboard";
import { planLaneTitle, planLaneTone, rolesToPlanLane, type PlanLane } from "@/components/dashboard/plan-lanes";
import type { ActiveRole } from "@/lib/role-context";

function makeClientRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface AISuggestTasksDialogProps {
  open: boolean;
  onClose: () => void;
  onTasksAdded?: (payload: { count: number; titles: string[] }) => void;
  userCategory?: string;
  mainGoal?: string;
  activeRole?: ActiveRole;
  existingTasks?: Array<{ title: string; subject?: string }>;
}

export function AISuggestTasksDialog({
  open,
  onClose,
  onTasksAdded,
  userCategory,
  mainGoal,
  activeRole,
  existingTasks = [],
}: AISuggestTasksDialogProps) {
  const router = useRouter();
  const [stage, setStage] = useState<"loading" | "review" | "creating" | "done">("loading");
  const [suggestions, setSuggestions] = useState<SuggestedTask[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string>("");
  const [createdTasks, setCreatedTasks] = useState<Array<{ title: string; subject?: string }>>([]);

  const groupedSuggestions = [
    {
      key: "student",
      lane: "Student" as PlanLane,
      items: suggestions
        .map((task, index) => ({ task, index }))
        .filter(({ task }) => task.roles?.length === 1 && task.roles[0] === "Student"),
    },
    {
      key: "employee",
      lane: "Employee" as PlanLane,
      items: suggestions
        .map((task, index) => ({ task, index }))
        .filter(({ task }) => task.roles?.length === 1 && task.roles[0] === "Employee"),
    },
    {
      key: "teacher",
      lane: "Teacher" as PlanLane,
      items: suggestions
        .map((task, index) => ({ task, index }))
        .filter(({ task }) => task.roles?.length === 1 && task.roles[0] === "Teacher"),
    },
    {
      key: "overlap",
      lane: "shared" as PlanLane,
      items: suggestions
        .map((task, index) => ({ task, index }))
        .filter(({ task }) => (task.roles?.length ?? 0) > 1),
    },
    {
      key: "general",
      lane: "general" as PlanLane,
      items: suggestions
        .map((task, index) => ({ task, index }))
        .filter(({ task }) => !task.roles || task.roles.length === 0),
    },
  ].filter((group) => group.items.length > 0);

  const describeSuggestionLane = (task: SuggestedTask) => {
    if (task.roles && task.roles.length > 0) {
      return task.roles.length === 1 ? `${task.roles[0]} plan` : `${task.roles.join(" + ")} overlap`;
    }

    return "General plan";
  };

  // Generate suggestions when dialog opens
  useEffect(() => {
    if (!open) return;

    const generateSuggestions = async () => {
      try {
        setStage("loading");
        setError("");
        const result = await suggestTasksForNextWeek(userCategory, mainGoal, activeRole, [...existingTasks, ...createdTasks]);
        if (result.error) {
          setError(result.error);
          setStage("review");
        } else {
          setSuggestions(result.tasks);
          setSelectedIndices(new Set(result.tasks.map((_, i) => i))); // Select all by default
          setStage("review");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate suggestions");
        setStage("review");
      }
    };

    generateSuggestions();
  }, [open, userCategory, mainGoal, activeRole, existingTasks, createdTasks]);

  const toggleTask = (index: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedIndices(newSet);
  };

  const handleCreateTasks = async () => {
    if (selectedIndices.size === 0) {
      onClose();
      return;
    }

    setStage("creating");

    try {
      // Spread tasks across Mon–Fri of next week
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
      const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilNextMonday);

      // Next-week weekdays: Mon(0), Tue(1), Wed(2), Thu(3), Fri(4)
      const nextWeekDays = [0, 1, 2, 3, 4].map((offset) => {
        const d = new Date(nextMonday);
        d.setDate(nextMonday.getDate() + offset);
        return d.toISOString().split("T")[0];
      });

      const selectedTasks = Array.from(selectedIndices).map((i) => suggestions[i]);
      const createdTaskSummaries: Array<{ title: string; subject?: string }> = [];
      const failedTaskTitles: string[] = [];
      let firstError: string | null = null;

      for (let i = 0; i < selectedTasks.length; i++) {
        const task = selectedTasks[i];
        const dateString = nextWeekDays[i % nextWeekDays.length];
        const formData = new FormData();
        formData.append("title", task.title);
        formData.append("description", task.description);
        formData.append("clientRequestId", makeClientRequestId());
        formData.append("dueDate", dateString);
        formData.append("estimatedMinutes", String(task.estimatedMinutes));
        formData.append("priority", task.priority);
        if (task.roles && task.roles.length === 1) {
          formData.append("taskContext", `role:${task.roles[0]}`);
        } else if ((task.roles?.length ?? 0) > 1) {
          formData.append("taskContext", "shared");
        } else if (activeRole && activeRole !== "all") {
          formData.append("taskContext", `role:${activeRole}`);
        } else {
          formData.append("taskContext", "general");
        }
        if (task.subject) {
          formData.append("subject", task.subject);
        }

        const result = await createTask(undefined, formData);
        if (result?.error) {
          failedTaskTitles.push(task.title);
          firstError = firstError ?? result.error;
          continue;
        }

        createdTaskSummaries.push({ title: task.title, subject: task.subject });
      }

      if (createdTaskSummaries.length > 0) {
        setCreatedTasks((current) => [...current, ...createdTaskSummaries]);
        onTasksAdded?.({ count: createdTaskSummaries.length, titles: createdTaskSummaries.map((task) => task.title) });
        router.refresh();
      }

      if (failedTaskTitles.length > 0) {
        setError(
          createdTaskSummaries.length > 0
            ? `Added ${createdTaskSummaries.length} task${createdTaskSummaries.length === 1 ? "" : "s"}, but ${failedTaskTitles.length} failed. ${firstError ?? "Please try again."}`
            : firstError ?? "None of the suggested tasks could be added.",
        );
        setStage("review");
        return;
      }

      setStage("done");
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tasks");
      setStage("review");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Next Week's Priorities"
      panelClassName="max-w-5xl max-h-[94vh]"
      bodyClassName="px-6 py-6"
    >
      <div className="space-y-4">
        {stage === "loading" && (
          <div className="space-y-3 text-center py-6">
            <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
            <p className="text-sm text-slate-400">Analyzing your profile...</p>
          </div>
        )}

        {stage === "review" && (
          <>
            {error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : (
              <>
                <p className="text-sm text-slate-300">
                  {suggestions.length === 0
                    ? "No suggestions at this time."
                    : activeRole && activeRole !== "all"
                      ? `Here are ${suggestions.length} priorities for next week in your ${activeRole} context. Pick which ones fit this focused plan.`
                      : `Here are ${suggestions.length} priorities for next week across your roles and general planning. Pick which ones fit your plan.`}
                </p>

                <div className="max-h-[72vh] space-y-4 overflow-y-auto pr-2">
                  {groupedSuggestions.map((group) => (
                    <section
                      key={group.key}
                      className={`rounded-2xl border p-3 ${planLaneTone(group.lane).border} ${planLaneTone(group.lane).bg}`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${planLaneTone(group.lane).text}`}>
                          {planLaneTitle(group.lane)}
                        </p>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${planLaneTone(group.lane).pill}`}>
                          {group.items.length}
                        </span>
                      </div>

                      <div className="grid gap-3 xl:grid-cols-2">
                        {group.items.map(({ task, index }) => (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => toggleTask(index)}
                            aria-pressed={selectedIndices.has(index)}
                            className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-all ${
                              selectedIndices.has(index)
                                ? "border-cyan-400/45 bg-cyan-500/10"
                                : "border-slate-700/30 bg-slate-800/20 hover:border-slate-600/50 hover:bg-slate-800/40"
                            }`}
                          >
                            <span
                              className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full border transition-all ${
                                selectedIndices.has(index)
                                  ? "border-cyan-300/70 bg-cyan-400/25"
                                  : "border-slate-600/60 bg-slate-900/80"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition-all ${
                                  selectedIndices.has(index) ? "left-5.5" : "left-0.5"
                                }`}
                              />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                {(() => {
                                  const lane = rolesToPlanLane(task.roles);

                                  return (
                                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${planLaneTone(lane).pill}`}>
                                      {describeSuggestionLane(task)}
                                    </span>
                                  );
                                })()}
                                <span
                                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${planLaneTone("general").subtlePill}`}
                                >
                                  {task.lane === "general" ? "General task" : "Role-aware task"}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-slate-200">{task.title}</p>
                              {task.description && <p className="mt-0.5 text-xs text-slate-500">{task.description}</p>}
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                {task.subject && (
                                  <span className="rounded-full bg-slate-700/40 px-2 py-1 text-xs text-slate-400">
                                    {task.subject}
                                  </span>
                                )}
                                <span className="text-xs text-slate-500">{task.estimatedMinutes} min</span>
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                    task.priority === "high"
                                      ? "bg-rose-500/20 text-rose-300"
                                      : task.priority === "medium"
                                        ? "bg-amber-500/20 text-amber-300"
                                        : "bg-slate-700/40 text-slate-400"
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                              {task.reasoning && <p className="mt-1 text-xs italic text-cyan-400/70">💡 {task.reasoning}</p>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                {suggestions.length > 0 && (
                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={onClose}
                      className="flex-1 rounded-full border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-800/40"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateTasks}
                      disabled={selectedIndices.size === 0}
                      className="flex-1 rounded-full bg-linear-to-r from-cyan-500 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all hover:shadow-[0_0_32px_rgba(34,211,238,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add {selectedIndices.size} {selectedIndices.size === 1 ? "priority" : "priorities"}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {stage === "creating" && (
          <div className="space-y-3 text-center py-6">
            <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
            <p className="text-sm text-slate-400">Adding priorities to next week...</p>
          </div>
        )}

        {stage === "done" && (
          <div className="space-y-3 text-center py-6">
            <p className="text-lg font-semibold text-emerald-400">✓ All set!</p>
            <p className="text-sm text-slate-400">
              {selectedIndices.size} {selectedIndices.size === 1 ? "priority" : "priorities"} added to next week's agenda.
            </p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
