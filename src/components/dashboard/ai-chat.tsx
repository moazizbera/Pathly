"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeTask, moveTaskToDate, startTask } from "@/app/actions/dashboard";
import type { TaskRecord } from "@/lib/dashboard-data";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  actions?: ChatAction[];
  timestamp: Date;
}

interface ChatAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "warning" | "danger";
}

interface AIChatProps {
  tasks: TaskRecord[];
  profile: {
    fullName: string;
    category: string;
    mainGoal: string;
    availability: string;
  };
  progress: {
    completionRate: number;
    completedTasks: number;
    totalTasks: number;
    remainingMinutes: number;
  };
}

// ─── Intent engine ───────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff === -1) return "yesterday";
  if (diff < 0) return `${Math.abs(diff)}d ago`;
  if (diff <= 6) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function totalMinutes(taskList: TaskRecord[]): number {
  return taskList.reduce((sum, t) => sum + (t.estimated_minutes ?? 25), 0);
}

function parseCategories(categoryStr: string): string[] {
  return categoryStr.split(",").map((c) => c.trim().toLowerCase());
}

function getCategoryTips(categoryStr: string): string {
  const categories = parseCategories(categoryStr);
  const tips: Record<string, string> = {
    student: "🎓 Study in **25m blocks** with 5m breaks. Exams → homework → admin.",
    employee: "💼 Deep work **before** meetings. Batch comms in 2x daily blocks.",
    teacher: "📚 Prep **tomorrow's lesson first**, grade after. Readiness first.",
  };

  if (categories.length === 1) {
    return tips[categories[0]] || "🎯 One task at a time, full focus.";
  }

  // Blend tips for multiple roles
  const blended: string[] = [];
  if (categories.includes("student")) blended.push("**Study blocks** (25m+5m break cycles)");
  if (categories.includes("employee")) blended.push("**Deep work** before meetings");
  if (categories.includes("teacher")) blended.push("**Lesson prep** as top priority");

  return `🎯 Balance: ${blended.join(" • ")}`;
}

type Intent =
  | "greeting"
  | "progress"
  | "overdue"
  | "today_tasks"
  | "tomorrow_tasks"
  | "next_week"
  | "this_week"
  | "suggestion"
  | "high_priority"
  | "workload"
  | "completed_tasks"
  | "in_progress_tasks"
  | "by_subject"
  | "reschedule_overdue"
  | "motivate"
  | "insights"
  | "when_done"
  | "quick_wins"
  | "help"
  | "add_task"
  | "all_tasks"
  | "unknown";

function detectIntent(input: string): Intent {
  const q = input.toLowerCase().trim();
  if (/^(hi|hello|hey|good (morning|afternoon|evening)|howdy|yo|sup)\b/.test(q)) return "greeting";
  if (/motivat|encourage|inspire|cheer|pump me up|push me|keep going/.test(q)) return "motivate";
  if (/insight|analytics|pattern|trend|how.*(work|do|perform)/.test(q)) return "insights";
  if (/when.*(done|finish|clear|complete)|how long|time to completion|eta/.test(q)) return "when_done";
  if (/quick win|easy task|low hanging|shortest|quickest/.test(q)) return "quick_wins";
  if (/progress|rate|percent|how (am i|is it going)|score|stat/.test(q)) return "progress";
  if (/workload|time left|how long|total (time|minutes|hours)|estimate/.test(q)) return "workload";
  if (/overdue|late|missed|past due|behind/.test(q)) return "overdue";
  if (/reschedule overdue|move all overdue|clear overdue/.test(q)) return "reschedule_overdue";
  if (/high.?prior|urgent task|critical/.test(q)) return "high_priority";
  if (/in.?progress|working on|started|current(ly)?/.test(q)) return "in_progress_tasks";
  if (/complet(ed|ion)|what.*(finish|done)|done task/.test(q)) return "completed_tasks";
  if (/by subject|group(ed)?|subject|categor/.test(q)) return "by_subject";
  if (/tomorrow/.test(q)) return "tomorrow_tasks";
  if (/this week|week view|week ahead/.test(q)) return "this_week";
  if (/next week|upcoming/.test(q)) return "next_week";
  if (/today|right now|urgent|this morning/.test(q)) return "today_tasks";
  if (/suggest|recommend|what should|focus|priorit|help me plan|what.*(do|tackle|work)/.test(q)) return "suggestion";
  if (/add|create|new (task|priority)/.test(q)) return "add_task";
  if (/list|all task|show (me|tasks)|what (do i have|tasks)/.test(q)) return "all_tasks";
  if (/help|what can|commands|options/.test(q)) return "help";
  return "unknown";
}

// ─── Response generator ───────────────────────────────────────────────────────

interface GenerateOpts {
  input: string;
  tasks: TaskRecord[];
  profile: AIChatProps["profile"];
  progress: AIChatProps["progress"];
  onAction: (fn: () => Promise<void>) => void;
}

function generateResponse({ input, tasks, profile, progress, onAction }: GenerateOpts): Omit<Message, "id" | "timestamp" | "role"> {
  const intent = detectIntent(input);
  const today = todayStr();
  const tomorrow = tomorrowStr();
  const wrap = (fn: () => Promise<unknown>): (() => Promise<void>) => async () => { await fn(); };

  const active = tasks.filter((t) => t.status !== "completed");
  const completed = tasks.filter((t) => t.status === "completed");
  const overdue = active.filter((t) => t.due_date && t.due_date < today);
  const dueToday = active.filter((t) => t.due_date === today);
  const dueTomorrow = active.filter((t) => t.due_date === tomorrow);
  const inProg = active.filter((t) => t.status === "in_progress");
  const highPriority = active.filter((t) => t.priority === "high");
  const firstName = profile.fullName.split(" ")[0];

  // This week (today → Sunday)
  const endOfWeek = new Date();
  const daysToSunday = 7 - endOfWeek.getDay();
  endOfWeek.setDate(endOfWeek.getDate() + daysToSunday);
  const thisWeekTasks = active.filter(
    (t) => t.due_date && t.due_date >= today && t.due_date <= endOfWeek.toISOString().split("T")[0],
  );

  // Next week Mon→Sun
  const nextMon = new Date();
  const dow = nextMon.getDay();
  nextMon.setDate(nextMon.getDate() + (dow === 0 ? 1 : 8 - dow));
  const nextSun = new Date(nextMon);
  nextSun.setDate(nextMon.getDate() + 6);
  const nextWeekTasks = active.filter(
    (t) => t.due_date && t.due_date >= nextMon.toISOString().split("T")[0] && t.due_date <= nextSun.toISOString().split("T")[0],
  );

  const motivationalLines = [
    `You've already completed **${completed.length}** task${completed.length !== 1 ? "s" : ""}. That's momentum — keep it going! 🔥`,
    `Every task you finish is proof you're moving forward. **${active.length}** to go — one at a time.`,
    `Progress isn't about perfection, it's about direction. You're at **${progress.completionRate}%** — push through.`,
    `The best way to predict your week is to plan it. You're already here — that's half the battle, ${firstName}.`,
    `Break the next task into one tiny step. Start with just **5 minutes** — momentum builds from there.`,
  ];

  switch (intent) {

    // ── Greeting ──────────────────────────────────────────────────────────────
    case "greeting": {
      const categories = parseCategories(profile.category);
      const roleLabel = categories.length > 1 
        ? `${categories[0]} + ${categories.length - 1} more role${categories.length > 2 ? "s" : ""}` 
        : categories[0];
      const urgencyNote = overdue.length > 0
        ? `\n⚠️ **${overdue.length}** overdue task${overdue.length > 1 ? "s" : ""} need your attention.`
        : dueToday.length > 0
          ? `\n🎯 **${dueToday.length}** task${dueToday.length > 1 ? "s" : ""} due today.`
          : `\n✅ No urgent deadlines right now.`;
      return {
        text: `${greetingByHour()}, **${firstName}**! 👋\n\n${roleLabel} • **${progress.completionRate}%** done (${progress.completedTasks}/${progress.totalTasks} tasks)${urgencyNote}\n\nWhat can I help you with?`,
      };
    }

    // ── Progress ──────────────────────────────────────────────────────────────
    case "progress": {
      const totalMin = totalMinutes(active);
      const hrs = Math.floor(totalMin / 60);
      const mins = totalMin % 60;
      const timeLeft = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
      const coaching = progress.completionRate >= 80
        ? "🏆 Outstanding! You're almost at the finish line."
        : progress.completionRate >= 60
          ? "💪 Strong progress — keep up the momentum."
          : progress.completionRate >= 35
            ? "📈 Good start. Focus on completing one more task."
            : "⚡ Let's get moving. Pick one task and start right now.";
      return {
        text: `📊 **Progress Report**\n\n✅ Done: **${progress.completedTasks}** of ${progress.totalTasks} tasks\n📊 Rate: **${progress.completionRate}%**\n⏱ Remaining work: **${timeLeft}**\n⚠️ Overdue: **${overdue.length}**\n🔵 In progress: **${inProg.length}**\n🔴 High priority open: **${highPriority.length}**\n\n${coaching}`,
      };
    }

    // ── Workload estimate ─────────────────────────────────────────────────────
    case "workload": {
      const totalMin = totalMinutes(active);
      const hrs = Math.floor(totalMin / 60);
      const mins = totalMin % 60;
      const timeStr = hrs > 0 ? `**${hrs}h ${mins}m**` : `**${mins} min**`;
      const availMins = parseInt(profile.availability) || 90;
      const days = Math.ceil(totalMin / availMins);
      return {
        text: `⏱ **Workload Estimate**\n\nTotal open tasks: **${active.length}**\nEstimated time: ${timeStr}\nYour daily availability: **${profile.availability}**\n\nAt your current pace, you can clear this backlog in roughly **${days} day${days !== 1 ? "s" : ""}**.\n\n${overdue.length > 0 ? `Start with the **${overdue.length} overdue** items to stop the debt growing.` : "No overdue items — you're managing your backlog well."}`,
      };
    }

    // ── Overdue ───────────────────────────────────────────────────────────────
    case "overdue": {
      if (overdue.length === 0) {
        return { text: `✅ **No overdue tasks**, ${firstName} — you're clean! Great discipline.\n\nWant to see today's tasks instead?` };
      }
      const list = overdue
        .slice(0, 6)
        .map((t) => `• **${t.title}** — ${dayLabel(t.due_date!)} [${t.priority}]${t.status === "in_progress" ? " 🔵" : ""}`)
        .join("\n");
      const actions: ChatAction[] = [
        ...overdue.slice(0, 2).map((t) => ({
          label: `▶ Start "${t.title.slice(0, 20)}..."`,
          variant: "primary" as const,
          onClick: () => onAction(wrap(() => startTask(t.id))),
        })),
        ...overdue.slice(0, 2).map((t) => ({
          label: `📅 Move "${t.title.slice(0, 18)}..." to today`,
          variant: "warning" as const,
          onClick: () => onAction(wrap(() => moveTaskToDate(t.id, today))),
        })),
      ];
      return {
        text: `⚠️ **${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}** — total ${totalMinutes(overdue)} min of work:\n\n${list}${overdue.length > 6 ? `\n…and ${overdue.length - 6} more.` : ""}`,
        actions,
      };
    }

    // ── Reschedule all overdue ────────────────────────────────────────────────
    case "reschedule_overdue": {
      if (overdue.length === 0) {
        return { text: "✅ Nothing overdue to reschedule — you're all clear!" };
      }
      const actions: ChatAction[] = overdue.slice(0, 5).map((t) => ({
        label: `📅 "${t.title.slice(0, 24)}..." → today`,
        variant: "warning" as const,
        onClick: () => onAction(wrap(() => moveTaskToDate(t.id, today))),
      }));
      return {
        text: `📅 **Move all ${overdue.length} overdue tasks to today?**\n\nThis reschedules them so they appear in today's list. Use the buttons below to move them one by one.`,
        actions,
      };
    }

    // ── Today's tasks ─────────────────────────────────────────────────────────
    case "today_tasks": {
      if (dueToday.length === 0 && inProg.length === 0) {
        const actions: ChatAction[] = overdue.slice(0, 2).map((t) => ({
          label: `📅 Pull "${t.title.slice(0, 20)}..." to today`,
          variant: "warning" as const,
          onClick: () => onAction(wrap(() => moveTaskToDate(t.id, today))),
        }));
        return {
          text: `Nothing is scheduled for today yet, ${firstName}.\n\n${overdue.length > 0 ? `You have **${overdue.length}** overdue task${overdue.length > 1 ? "s" : ""} you could pull into today:` : "Use **+ Add priority** below to add something."}`,
          actions: overdue.length > 0 ? actions : undefined,
        };
      }
      const allToday = [...inProg.filter((t) => t.due_date !== today), ...dueToday];
      const list = allToday
        .map((t) => {
          const status = t.status === "in_progress" ? " 🔵 in progress" : t.status === "completed" ? " ✅" : "";
          return `• **${t.title}** [${t.priority}]${status} — ${t.estimated_minutes ?? 25}m`;
        })
        .join("\n");
      const startable = dueToday.filter((t) => t.status !== "in_progress").slice(0, 2);
      const doneables = dueToday.filter((t) => t.status === "in_progress").slice(0, 2);
      const actions: ChatAction[] = [
        ...startable.map((t) => ({
          label: `▶ Start "${t.title.slice(0, 20)}..."`,
          variant: "primary" as const,
          onClick: () => onAction(wrap(() => startTask(t.id))),
        })),
        ...doneables.map((t) => ({
          label: `✓ Done "${t.title.slice(0, 20)}..."`,
          variant: "primary" as const,
          onClick: () => onAction(async () => { const fd = new FormData(); fd.append("taskId", t.id); await completeTask(fd); }),
        })),
      ];
      return {
        text: `🎯 **Today (${allToday.length} task${allToday.length !== 1 ? "s" : ""}, ~${totalMinutes(allToday)} min):**\n\n${list}`,
        actions: actions.length > 0 ? actions : undefined,
      };
    }

    // ── Tomorrow's tasks ──────────────────────────────────────────────────────
    case "tomorrow_tasks": {
      if (dueTomorrow.length === 0) {
        return { text: `Nothing scheduled for tomorrow yet. Your next ${active.length > 0 ? "open" : ""} tasks beyond today are on ${active.find((t) => t.due_date && t.due_date > today)?.due_date ? dayLabel(active.find((t) => t.due_date && t.due_date > today)!.due_date!) : "no set date"}.` };
      }
      const list = dueTomorrow
        .map((t) => `• **${t.title}** [${t.priority}] — ${t.estimated_minutes ?? 25}m`)
        .join("\n");
      return {
        text: `📅 **Tomorrow (${dueTomorrow.length} task${dueTomorrow.length !== 1 ? "s" : ""}, ~${totalMinutes(dueTomorrow)} min):**\n\n${list}\n\nConsider getting a head start on high-priority ones today if you have capacity.`,
      };
    }

    // ── This week ─────────────────────────────────────────────────────────────
    case "this_week": {
      if (thisWeekTasks.length === 0) {
        return { text: `No tasks scheduled for the rest of this week.\n\n${nextWeekTasks.length > 0 ? `You have **${nextWeekTasks.length}** task${nextWeekTasks.length > 1 ? "s" : ""} lined up for next week though.` : ""}` };
      }
      const byDay: Record<string, TaskRecord[]> = {};
      for (const t of thisWeekTasks) {
        const key = t.due_date!;
        byDay[key] = byDay[key] ?? [];
        byDay[key].push(t);
      }
      const sections = Object.entries(byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, dayTasks]) => `**${dayLabel(date)}** — ${dayTasks.map((t) => t.title).join(", ")}`)
        .join("\n");
      return {
        text: `📆 **This week (${thisWeekTasks.length} tasks, ~${totalMinutes(thisWeekTasks)} min):**\n\n${sections}`,
      };
    }

    // ── Next week ─────────────────────────────────────────────────────────────
    case "next_week": {
      if (nextWeekTasks.length === 0) {
        return {
          text: `Nothing scheduled for next week yet.\n\nPress **Ctrl+Shift+A** or tap **✨ Suggest** to get AI-generated priorities for next week. I'll spread them across Mon–Fri automatically.`,
        };
      }
      const list = nextWeekTasks
        .map((t) => `• **${t.title}** — ${dayLabel(t.due_date!)} [${t.priority}]`)
        .join("\n");
      return { text: `📅 **Next week (${nextWeekTasks.length} tasks, ~${totalMinutes(nextWeekTasks)} min):**\n\n${list}\n\nYou can view these in the calendar — hit **Next week →** on the Week & history section.` };
    }

    // ── High priority ─────────────────────────────────────────────────────────
    case "high_priority": {
      if (highPriority.length === 0) {
        return { text: `✅ No high-priority tasks open right now. Your workload is well-balanced.` };
      }
      const list = highPriority
        .slice(0, 6)
        .map((t) => `• **${t.title}**${t.due_date ? ` — due ${dayLabel(t.due_date)}` : ""} ${t.status === "in_progress" ? "🔵" : ""}`)
        .join("\n");
      const actions: ChatAction[] = highPriority.filter((t) => t.status !== "in_progress").slice(0, 2).map((t) => ({
        label: `▶ Start "${t.title.slice(0, 20)}..."`,
        variant: "primary" as const,
        onClick: () => onAction(wrap(() => startTask(t.id))),
      }));
      return {
        text: `🔴 **${highPriority.length} high-priority task${highPriority.length > 1 ? "s" : ""}:**\n\n${list}`,
        actions: actions.length > 0 ? actions : undefined,
      };
    }

    // ── In-progress tasks ─────────────────────────────────────────────────────
    case "in_progress_tasks": {
      if (inProg.length === 0) {
        return { text: `No tasks marked as in-progress right now.\n\nHover over any task and click **▶ Start** to mark it as active — it helps track what you're focused on.` };
      }
      const list = inProg.map((t) => `• **${t.title}** [${t.priority}] — ${t.estimated_minutes ?? 25}m`).join("\n");
      const actions: ChatAction[] = inProg.slice(0, 3).map((t) => ({
        label: `✓ Done "${t.title.slice(0, 22)}..."`,
        variant: "primary" as const,
        onClick: () => onAction(async () => { const fd = new FormData(); fd.append("taskId", t.id); await completeTask(fd); }),
      }));
      return {
        text: `🔵 **${inProg.length} task${inProg.length > 1 ? "s" : ""} in progress:**\n\n${list}\n\nFinish what's started before picking up something new.`,
        actions,
      };
    }

    // ── Completed tasks ───────────────────────────────────────────────────────
    case "completed_tasks": {
      if (completed.length === 0) {
        return { text: `No completed tasks yet. Start with the highest-priority one and build from there!` };
      }
      const list = completed
        .slice(0, 6)
        .map((t) => `• ~~${t.title}~~ ✅`)
        .join("\n");
      return {
        text: `✅ **${completed.length} completed task${completed.length > 1 ? "s" : ""}:**\n\n${list}${completed.length > 6 ? `\n…and ${completed.length - 6} more.` : ""}\n\n🎉 Great work keeping score!`,
      };
    }

    // ── By subject ────────────────────────────────────────────────────────────
    case "by_subject": {
      const subjectMap: Record<string, TaskRecord[]> = { "No subject": [] };
      for (const t of active) {
        const key = t.subject ?? "No subject";
        subjectMap[key] = subjectMap[key] ?? [];
        subjectMap[key].push(t);
      }
      const sections = Object.entries(subjectMap)
        .filter(([, ts]) => ts.length > 0)
        .sort(([, a], [, b]) => b.length - a.length)
        .map(([subj, ts]) => `**${subj}** (${ts.length}) — ${totalMinutes(ts)}m\n${ts.slice(0, 3).map((t) => `  • ${t.title}`).join("\n")}${ts.length > 3 ? `\n  …+${ts.length - 3}` : ""}`)
        .join("\n\n");
      return {
        text: `📚 **Tasks by subject:**\n\n${sections || "No grouped tasks found."}`,
      };
    }

    // ── Motivate ──────────────────────────────────────────────────────────────
    case "motivate": {
      const line = motivationalLines[Math.floor(Math.random() * motivationalLines.length)];
      const nextTask = inProg[0] ?? overdue[0] ?? dueToday[0] ?? highPriority[0] ?? active[0];
      const actions: ChatAction[] = nextTask ? [{
        label: `▶ Let's go — start "${nextTask.title.slice(0, 22)}..."`,
        variant: "primary" as const,
        onClick: () => onAction(wrap(() => startTask(nextTask.id))),
      }] : [];
      return {
        text: `💪 **You've got this, ${firstName}!**\n\n${line}\n\n${nextTask ? `Your next move: **"${nextTask.title}"**` : "You're all clear — great work!"}`,
        actions: actions.length > 0 ? actions : undefined,
      };
    }

    // ── All tasks ─────────────────────────────────────────────────────────────
    case "all_tasks": {
      if (active.length === 0) {
        return { text: `🎉 All tasks complete! Nothing left in your backlog.\n\nReady to plan next week? Press **Ctrl+Shift+A** and I'll suggest priorities.` };
      }
      const list = active
        .slice(0, 8)
        .map((t) => `• **${t.title}**${t.due_date ? ` — ${dayLabel(t.due_date)}` : ""} [${t.priority}]${t.status === "in_progress" ? " 🔵" : ""}`)
        .join("\n");
      return {
        text: `📋 **Open tasks (${active.length}, ~${totalMinutes(active)} min total):**\n\n${list}${active.length > 8 ? `\n\n…and ${active.length - 8} more.` : ""}`,
      };
    }

    // ── Add task ──────────────────────────────────────────────────────────────
    case "add_task":
      return { text: `➕ **To add a task:**\n\n• Tap **+ Add priority** at the bottom of the dashboard\n• Or use **✨ AI Suggest** (Ctrl+Shift+A) to get smart recommendations for next week that you approve in one click\n\nFor quick capture, use the **Idea Space** and convert it to a task later.` };

    // ── Quick wins ────────────────────────────────────────────────────────
    case "quick_wins": {
      const quick = active
        .filter((t) => (t.estimated_minutes ?? 25) <= 15)
        .sort((a, b) => ((a.estimated_minutes ?? 25) - (b.estimated_minutes ?? 25)))
        .slice(0, 4);
      if (quick.length === 0) {
        return { text: `No tasks under 15 min, ${firstName}. Your backlog is well-sized or requires deep work.\n\nTry splitting a larger task into smaller steps.` };
      }
      const list = quick.map((t) => `• **${t.title}** — ${t.estimated_minutes ?? 25}m [${t.priority}]`).join("\n");
      const actions: ChatAction[] = quick.slice(0, 2).map((t) => ({
        label: `▶ Start "${t.title.slice(0, 20)}..."`,
        variant: "primary" as const,
        onClick: () => onAction(wrap(() => startTask(t.id))),
      }));
      return {
        text: `⚡ **${quick.length} quick win${quick.length > 1 ? "s" : ""}** under 15 minutes:\n\n${list}\n\nDo one now to build momentum!`,
        actions,
      };
    }

    // ── When will I be done? ──────────────────────────────────────────────
    case "when_done": {
      const totalMin = totalMinutes(active);
      const availMins = parseInt(profile.availability) || 90;
      const daysNeeded = Math.ceil(totalMin / availMins);
      const completeDate = new Date();
      completeDate.setDate(completeDate.getDate() + daysNeeded);
      const completeDateStr = completeDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
      
      if (daysNeeded === 0) {
        return { text: `🎉 **You're done today!** All open tasks fit in your **${profile.availability}**m availability.` };
      }
      
      if (daysNeeded === 1) {
        return { text: `⚡ **Tomorrow** (${completeDateStr}) — just **${totalMin}m** of work left at your pace.` };
      }
      
      if (daysNeeded <= 7) {
        return { text: `📅 **${completeDateStr}** (${daysNeeded} day${daysNeeded > 1 ? "s" : ""} from now)\n\nAt **${profile.availability}**m/day, you'll clear **${active.length}** open task${active.length > 1 ? "s" : ""} totaling **${totalMin}** minutes.\n\nThat's a sustainable pace — no crunch needed!` };
      }
      
      return { text: `📊 **${daysNeeded} days** at your current pace (**${profile.availability}**m/day).\n\n**${totalMin}** total minutes across **${active.length}** task${active.length > 1 ? "s" : ""}**.\n\nConsider: breaking up big tasks, delegating, or reallocating time.` };
    }

    // ── Insights & achievements ──────────────────────────────────────────
    case "insights": {
      const completed = tasks.filter((t) => t.status === "completed");
      // Simple streak: use completed count as momentum indicator
      const streak = Math.min(completed.length, 10);
      
      const avgTaskTime = completed.length > 0 
        ? Math.round(completed.reduce((sum, t) => sum + (t.estimated_minutes ?? 25), 0) / completed.length)
        : 0;
      
      const subjectStats: Record<string, { count: number; time: number }> = {};
      for (const t of completed) {
        const subj = t.subject ?? "Other";
        subjectStats[subj] = subjectStats[subj] ?? { count: 0, time: 0 };
        subjectStats[subj].count++;
        subjectStats[subj].time += t.estimated_minutes ?? 25;
      }
      const topSubject = Object.entries(subjectStats).sort(([, a], [, b]) => b.count - a.count)[0];
      
      const insights: string[] = [
        `📊 **Completion rate:** **${progress.completionRate}%** today`,
        `✅ **Done:** **${completed.length}** task${completed.length !== 1 ? "s" : ""}`,
        completed.length > 0 ? `⏱ **Avg task time:** **${avgTaskTime}**m` : undefined,
        completed.length > 0 ? `🔥 **${completed.length}-task momentum** — great consistency!` : undefined,
        topSubject ? `📚 **Top focus:** ${topSubject[0]} (**${topSubject[1].count}** tasks, **${topSubject[1].time}**m)` : undefined,
      ].filter(Boolean) as string[];
      
      const tip = getCategoryTips(profile.category);
      
      return {
        text: `📈 **Your insights & patterns:**\n\n${insights.join("\n")}\n\n${tip}`,
      };
    }

    // ── Suggestion ────────────────────────────────────────────────────────────
    case "suggestion": {
      const categories = parseCategories(profile.category);
      
      if (inProg.length > 0) {
        const t = inProg[0];
        return {
          text: `🔵 You're already working on **"${t.title}"** — finish it before switching.\n\nCompleting what you start is the #1 productivity habit.\n\n*Goal: ${profile.mainGoal.slice(0, 100)}${profile.mainGoal.length > 100 ? "…" : ""}*`,
          actions: [{ label: `✓ Mark "${t.title.slice(0, 22)}..." done`, variant: "primary", onClick: () => onAction(async () => { const fd = new FormData(); fd.append("taskId", t.id); await completeTask(fd); }) }],
        };
      }
      
      if (overdue.length > 0) {
        const t = overdue[0];
        return {
          text: `🚨 **Top suggestion:** Clear your overdue backlog first.\n\n**Start with:** "${t.title}" — ${dayLabel(t.due_date!)} overdue, ${t.priority} priority, ${t.estimated_minutes ?? 25}m.\n\nDebt accumulates stress — one down makes the rest easier.`,
          actions: [
            { label: `▶ Start "${t.title.slice(0, 20)}..."`, variant: "primary", onClick: () => onAction(wrap(() => startTask(t.id))) },
            { label: `📅 Move to today`, variant: "warning", onClick: () => onAction(wrap(() => moveTaskToDate(t.id, today))) },
          ],
        };
      }
      
      // Multi-role suggestion: prioritize based on role context
      if (categories.length > 1) {
        // Blend priorities: student prioritizes exams, professional prioritizes meetings/deliverables
        const getBlendedPriority = (t: TaskRecord): number => {
          let score = 0;
          if (t.priority === "high") score += 10;
          if (categories.includes("student") && t.subject?.match(/exam|quiz|test/i)) score += 5;
          if (categories.includes("professional") && t.subject?.match(/meeting|deliverable|project/i)) score += 5;
          if (categories.includes("teacher") && t.subject?.match(/lesson|prep|class/i)) score += 5;
          if (t.due_date === today) score += 3;
          return score;
        };
        
        const bestTask = dueToday.length > 0 
          ? dueToday.sort((a, b) => getBlendedPriority(b) - getBlendedPriority(a))[0]
          : highPriority[0];
        
        if (bestTask) {
          const roleContext = categories.length > 1 
            ? ` (balancing your ${categories.join(" + ")} roles)`
            : "";
          return {
            text: `🎯 **Best next task${roleContext}:** "${bestTask.title}"\n\n${bestTask.due_date ? `Due ${dayLabel(bestTask.due_date)}` : "No deadline"}. **${bestTask.estimated_minutes ?? 25} min**.\n\n*${profile.mainGoal.slice(0, 100)}*`,
            actions: [{ label: `▶ Start "${bestTask.title.slice(0, 22)}..."`, variant: "primary", onClick: () => onAction(wrap(() => startTask(bestTask.id))) }],
          };
        }
      }
      
      if (dueToday.length > 0) {
        const t = dueToday.find((x) => x.priority === "high") ?? dueToday[0];
        return {
          text: `🎯 **Best next task:** "${t.title}"\n\nDue today${t.priority === "high" ? ", high priority" : ""}. Estimated **${t.estimated_minutes ?? 25} min**.\n\n*${profile.mainGoal.slice(0, 100)}*`,
          actions: [{ label: `▶ Start "${t.title.slice(0, 22)}..."`, variant: "primary", onClick: () => onAction(wrap(() => startTask(t.id))) }],
        };
      }
      
      if (highPriority.length > 0) {
        const t = highPriority[0];
        return {
          text: `✅ No urgent deadlines today.\n\n**Suggested focus:** "${t.title}" — high priority, ${t.estimated_minutes ?? 25}m.\n\n${nextWeekTasks.length > 0 ? `You also have **${nextWeekTasks.length}** task${nextWeekTasks.length > 1 ? "s" : ""} coming up next week.` : "Consider planning next week with Ctrl+Shift+A."}`,
          actions: [{ label: `▶ Start "${t.title.slice(0, 22)}..."`, variant: "primary", onClick: () => onAction(wrap(() => startTask(t.id))) }],
        };
      }
      
      return { text: `You're in great shape, ${firstName}! No overdue, no urgent tasks.\n\n🌟 Consider planning ahead — press **Ctrl+Shift+A** and I'll suggest priorities for next week.` };
    }

    // ── Help ──────────────────────────────────────────────────────────────────
    case "help":
      return {
        text: `🤖 **Pathly AI — what I can do:**\n\n**Status & insights**\n• "How am I doing?" — progress report\n• "Show my insights" — achievements & patterns\n• "When will I finish?" — completion prediction\n\n**Planning**\n• "What should I focus on?" — top suggestion\n• "Tasks today" / "Tomorrow" / "This week"\n• "Next week" — upcoming tasks\n• "Quick wins" — tasks under 15 min\n• "High priority" — urgent items\n\n**Details**\n• "Show all tasks" — full list\n• "By subject" — grouped view\n• "What's in progress?" — active tasks\n\n**Action**\n• "Show overdue" — late tasks + quick fix\n• "Move overdue to today" — bulk reschedule\n• "Motivate me" — coaching\n\n**Keyboard:** Ctrl+Shift+A → AI suggest`,
      };

    // ── Unknown ───────────────────────────────────────────────────────────────
    default:
      return {
        text: `I didn't catch that, ${firstName}. Try:\n\n• "What should I focus on?"\n• "Show overdue tasks"\n• "How am I doing?"\n• "Motivate me"\n• "By subject"\n\nType **"help"** to see everything I can do.`,
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function renderMarkdown(text: string) {
  // Very simple bold + newline rendering
  return text.split("\n").map((line, i) => {
    const parts = line.split(/\*\*(.+?)\*\*/g);
    return (
      <span key={i}>
        {parts.map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j} className="font-semibold text-slate-100">
              {part}
            </strong>
          ) : (
            part
          ),
        )}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    );
  });
}

export function AIChat({ tasks, profile, progress }: AIChatProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasUnread = !open && messages.some((m) => m.role === "assistant");

  // Welcome message on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      const welcome = generateResponse({
        input: "hello",
        tasks,
        profile,
        progress,
        onAction: () => {},
      });
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          text: welcome.text,
          actions: welcome.actions,
          timestamp: new Date(),
        },
      ]);
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed || isPending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    setInput("");

    const onAction = (fn: () => Promise<void>) => {
      startTransition(async () => {
        await fn();
        router.refresh();
      });
    };

    const response = generateResponse({ input: trimmed, tasks, profile, progress, onAction });
    const botMsg: Message = {
      id: Date.now().toString() + "b",
      role: "assistant",
      text: response.text,
      actions: response.actions,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const quickPrompts = [
    "What should I focus on?",
    "Show my insights",
    "When will I finish?",
    "Quick wins",
    "How am I doing?",
    "By subject",
  ];

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-cyan-600 shadow-[0_0_24px_rgba(34,211,238,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_36px_rgba(34,211,238,0.7)]"
        title="Open Pathly AI chat"
      >
        <span className="text-xl">✨</span>
        {hasUnread && (
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-rose-400 animate-pulse" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex w-90 max-w-[calc(100vw-24px)] flex-col rounded-3xl border border-slate-700/50 bg-slate-950/95 shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 rounded-t-3xl border-b border-slate-700/40 bg-slate-900/60 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-cyan-600 text-sm shadow-[0_0_12px_rgba(34,211,238,0.4)]">
              ✨
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-100">Pathly AI</p>
              <p className="text-[10px] text-slate-500">Your planning co-pilot</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`rounded-2xl px-3 py-2.5 text-xs leading-5 ${
                      msg.role === "user"
                        ? "rounded-br-sm bg-cyan-500 text-slate-950 font-medium"
                        : "rounded-bl-sm border border-slate-700/40 bg-slate-800/60 text-slate-300"
                    }`}
                  >
                    {renderMarkdown(msg.text)}
                  </div>

                  {/* Action buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="space-y-1.5">
                      {msg.actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={action.onClick}
                          disabled={isPending}
                          className={`w-full rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all disabled:opacity-50 ${
                            action.variant === "warning"
                              ? "border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                              : action.variant === "danger"
                                ? "border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                                : "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="text-[9px] text-slate-600">{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            ))}

            {isPending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-slate-700/40 bg-slate-800/60 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt);
                    setTimeout(() => inputRef.current?.form?.requestSubmit(), 10);
                  }}
                  className="rounded-full border border-slate-700/40 px-2.5 py-1 text-[10px] font-medium text-slate-400 transition-all hover:border-cyan-500/40 hover:text-cyan-400"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 rounded-b-3xl border-t border-slate-700/40 bg-slate-900/60 px-3 py-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your tasks..."
              className="flex-1 rounded-2xl border border-slate-700/40 bg-slate-800/40 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
            />
            <button
              type="submit"
              disabled={!input.trim() || isPending}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-400 disabled:opacity-40"
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}
