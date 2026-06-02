"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type React from "react";

import { signOut } from "@/app/actions/auth";
import { AddTaskDialog } from "@/components/dashboard/add-task-dialog";
import { AISuggestTasksDialog } from "@/components/dashboard/ai-suggest-tasks-dialog";
import { AgentActionsPanel } from "@/components/dashboard/agent-actions-panel";
import { IdeasPad } from "@/components/dashboard/ideas-pad";
import { RolePlansPanel } from "@/components/dashboard/role-plans-panel";
import { TaskResourcePanel } from "@/components/dashboard/task-resource-panel";
import { TaskListPanel } from "@/components/dashboard/task-list-panel";
import { TaskIntelPanel } from "@/components/dashboard/task-intel-panel";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { WeekCalendar } from "@/components/dashboard/week-calendar";
import { LiveClock } from "@/components/dashboard/live-clock";
import { AIChat } from "@/components/dashboard/ai-chat";
import type { TaskRecord } from "@/lib/dashboard-data";

interface DashboardWrapperProps {
  user: { id: string; email?: string };
  profile: {
    fullName: string;
    category: string;
    mainGoal: string;
    focusPreference: string;
    availability: string;
  };
  progress: any;
  recommendation: any;
  mainObjective: any;
  agenda: any;
  aiRole: any;
  aiBrief: any;
  tasks: TaskRecord[];
  rolePlans: any;
  roleOverlaps: any;
  setupHint?: string;
}

export function DashboardWrapper({
  user,
  profile,
  progress,
  recommendation,
  mainObjective,
  agenda,
  aiRole,
  aiBrief,
  tasks,
  rolePlans,
  roleOverlaps,
  setupHint,
}: DashboardWrapperProps) {
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);
  const [showShortcutHint, setShowShortcutHint] = useState(false);
  const [calendarWeekOffset, setCalendarWeekOffset] = useState(0);
  const [calendarSuccessMessage, setCalendarSuccessMessage] = useState<string | null>(null);
  const [highlightedCalendarTaskTitles, setHighlightedCalendarTaskTitles] = useState<string[]>([]);

  // Keyboard shortcut: Ctrl+Shift+A to open AI suggestions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setSuggestDialogOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    // Show shortcut hint on first load
    const hasSeenHint = localStorage.getItem("pathly-shortcut-hint");
    if (!hasSeenHint) {
      setShowShortcutHint(true);
      localStorage.setItem("pathly-shortcut-hint", "true");
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (highlightedCalendarTaskTitles.length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHighlightedCalendarTaskTitles([]);
    }, 6000);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedCalendarTaskTitles]);

  return (
    <>
      <main className="hero-grid min-h-screen px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {/* HEADER */}
          <header className="animate-rise-in rounded-3xl border border-slate-700/30 bg-slate-900/60 px-5 py-4 backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="status-pill status-pill-ready rounded-full px-2.5 py-1 text-xs font-semibold">Ready</span>
              <span className="status-pill rounded-full px-2.5 py-1 text-xs font-semibold">AI-powered</span>
              <span className="status-pill rounded-full px-2.5 py-1 text-xs font-semibold">{profile.category}</span>
              <LiveClock />
              <Link href="/" className="ml-auto text-xs text-slate-500 transition-colors hover:text-slate-300">
                &larr; Home
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-cyan-300 uppercase">Execution cockpit</p>
                <h1 className="mt-1 text-xl font-semibold text-slate-100">{profile.fullName.split(" ")[0]}&apos;s plan</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSuggestDialogOpen(true)}
                  className="group rounded-full border border-cyan-500/35 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.16)] transition-all hover:border-cyan-400/60 hover:bg-cyan-500/18 hover:text-cyan-100"
                  title="Keyboard shortcut: Ctrl+Shift+A"
                >
                  ✨ AI Suggest{" "}
                  <span className="ml-1 inline text-[10px] text-cyan-400/70 group-hover:text-cyan-300">
                    Ctrl+Shift+A
                  </span>
                </button>
                <Link
                  href="/demo"
                  className="rounded-full border border-slate-700/40 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
                >
                  Demo
                </Link>
                <Link
                  href="/profile"
                  className="rounded-full border border-slate-700/40 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
                >
                  Profile
                </Link>
                <form action={signOut}>
                  <button className="rounded-full border border-slate-700/40 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-red-500/30 hover:text-red-300">
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </header>

          {/* ONE-TIME SHORTCUT HINT */}
          {showShortcutHint && (
            <div className="animate-rise-in rounded-3xl border border-cyan-500/30 bg-cyan-500/5 px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-cyan-300">⌨️ Pro tip:</span>
                  <p className="text-sm text-slate-300">
                    Press <span className="rounded bg-slate-800/60 px-1.5 py-0.5 font-mono text-xs font-semibold text-cyan-400">Ctrl+Shift+A</span> anywhere on this page to get AI-suggested tasks
                  </p>
                </div>
                <button
                  onClick={() => setShowShortcutHint(false)}
                  className="shrink-0 text-slate-500 transition-colors hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* AI ROLE BANNER shown once, clear, no repeat */}
          <section className="animate-rise-in-delayed rounded-3xl border border-indigo-500/25 bg-indigo-500/5 px-5 py-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-indigo-500/40 bg-indigo-500/20">
                <span className="text-xs font-bold text-indigo-300">AI</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">{aiRole.headline}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{aiRole.detail}</p>
                <ul className="mt-3 space-y-1.5">
                  {aiRole.bullets.map((b: string) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="mt-0.5 shrink-0 text-indigo-400">&rarr;</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-cyan-500/25 bg-cyan-500/5 px-5 py-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-cyan-300 uppercase">{aiBrief.headline}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{aiBrief.summary}</p>
              </div>
              <div className="rounded-full border border-cyan-500/35 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                Confidence {aiBrief.confidence}%
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-700/40 bg-slate-900/50 px-4 py-3">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Next move</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{aiBrief.nextMove}</p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/8 px-4 py-3">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-amber-300 uppercase">Risk radar</p>
                <ul className="mt-2 space-y-1.5">
                  {aiBrief.riskAlerts.map((alert: string) => (
                    <li key={alert} className="text-xs leading-5 text-amber-100/90">
                      - {alert}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-300 uppercase">Adaptive follow-up</p>
                <ul className="mt-2 space-y-1.5">
                  {aiBrief.followUps.map((item: string) => (
                    <li key={item} className="text-xs leading-5 text-emerald-100/90">
                      - {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <AgentActionsPanel
            identity={user.email ?? profile.fullName}
            profile={profile}
            tasks={tasks}
            agenda={agenda}
            recommendation={recommendation}
          />

          <TaskResourcePanel
            recommendation={recommendation}
            profile={profile}
            tasks={tasks}
          />

          <RolePlansPanel rolePlans={rolePlans} roleOverlaps={roleOverlaps} />

          {/* MAIN OBJECTIVE one clear card, no duplication */}
          <section className="animate-rise-in-soft rounded-3xl border border-cyan-500/30 bg-cyan-500/5 px-5 py-5">
            <p className="text-xs font-semibold tracking-[0.2em] text-cyan-300 uppercase">Main objective</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-100">{mainObjective.title}</h2>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{profile.mainGoal}</p>
            {setupHint ? (
              <p className="mt-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                {setupHint}
              </p>
            ) : null}
          </section>

          {/* AGENDA vertical timeline, full width */}
          <section className="rounded-3xl border border-slate-700/30 bg-slate-900/40 px-5 py-5">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">Today&apos;s agenda</p>
            <div className="timeline-rail mt-4 space-y-3">
              {agenda.map((item: any) => (
                <div key={`${item.slot}-${item.title}`} className="timeline-node">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-cyan-400">{item.slot}</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-100">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500">{item.detail}</p>
                    </div>
                    <span className="mt-0.5 shrink-0 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-300">
                      {item.minutes}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── WEEK CALENDAR ── task view by day + subject */}
          <section className="rounded-3xl border border-slate-700/30 bg-slate-900/40 px-5 py-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">Week &amp; history</p>
              <span className="text-xs text-slate-600">7-day view</span>
            </div>
            {calendarSuccessMessage ? (
              <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-emerald-300 uppercase">Calendar updated</p>
                  <p className="mt-1 text-sm text-emerald-100">{calendarSuccessMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCalendarSuccessMessage(null)}
                  className="rounded-full border border-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-200 transition-colors hover:border-emerald-400/40 hover:text-emerald-100"
                >
                  Dismiss
                </button>
              </div>
            ) : null}
            <WeekCalendar
              tasks={tasks}
              category={profile.category}
              rolePlans={rolePlans}
              weekOffset={calendarWeekOffset}
              onWeekOffsetChange={setCalendarWeekOffset}
              highlightedTaskTitles={highlightedCalendarTaskTitles}
            />
          </section>

          {/* PROGRESS STRIP — ring + bar + stats */}
          <div className="flex items-center gap-4 rounded-3xl border border-slate-700/30 bg-slate-900/40 px-4 py-3">
            {/* Circular ring */}
            <div className="relative shrink-0">
              <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
                <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="4" />
                <circle
                  cx="26"
                  cy="26"
                  r="22"
                  fill="none"
                  stroke={
                    progress.completionRate >= 70
                      ? "#10b981"
                      : progress.completionRate >= 35
                        ? "#f59e0b"
                        : "#22d3ee"
                  }
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - progress.completionRate / 100)}`}
                  style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-slate-200">
                {progress.completionRate}%
              </span>
            </div>

            {/* Bar + labels */}
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-300">Day progress</p>
                <span className="text-xs text-slate-500">
                  {progress.completedTasks}/{progress.totalTasks} tasks
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ "--fill-width": `${progress.completionRate}%` } as React.CSSProperties}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-600">
                {progress.remainingMinutes > 0
                  ? `${progress.remainingMinutes} min remaining`
                  : "All tasks complete"}
                {progress.completedMinutes > 0 ? ` &middot; ${progress.completedMinutes} min cleared` : ""}
              </p>
            </div>
          </div>

          {/* AI PROGRESS PULSE — overdue / today / in-progress alerts */}
          <TaskIntelPanel tasks={tasks} />

          {/* INSIGHTS & ACHIEVEMENTS — streaks, badges, predictions */}
          <InsightsPanel tasks={tasks} profile={profile} progress={progress} />

          {/* OPEN TASKS top 3 visible, "show all" opens modal */}
          <section className="rounded-3xl border border-slate-700/30 bg-slate-900/40 px-5 py-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">Open tasks</p>
              <span className="text-xs text-slate-600">
                {tasks.filter((t) => t.status !== "completed").length} active
              </span>
            </div>
            <TaskListPanel
              tasks={tasks}
              rolePlans={rolePlans}
              profile={{ category: profile.category, mainGoal: profile.mainGoal }}
            />
          </section>

          {/* IDEA SPACE full width, simple */}
          <section className="rounded-3xl border border-slate-700/30 bg-slate-900/40 px-5 py-5">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">Idea space</p>
            <IdeasPad identity={user.email ?? profile.fullName} />
          </section>

          {/* KEYBOARD SHORTCUTS INFO */}
          <section className="rounded-3xl border border-slate-700/30 bg-slate-900/40 px-5 py-5">
            <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">⌨️ Keyboard shortcuts</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <kbd className="rounded bg-slate-700/50 px-2 py-1 font-mono text-xs font-semibold text-cyan-400">
                    Ctrl+Shift+A
                  </kbd>
                  <span className="text-xs text-slate-400">AI suggest tasks</span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <kbd className="rounded bg-slate-700/50 px-2 py-1 font-mono text-xs font-semibold text-cyan-400">
                    Ctrl+K
                  </kbd>
                  <span className="text-xs text-slate-400">Add task (coming soon)</span>
                </div>
              </div>
            </div>
          </section>

          {/* ADD TASK + AI SUGGEST buttons */}
          <div className="grid grid-cols-2 gap-3">
            <AddTaskDialog />
            <button
              onClick={() => setSuggestDialogOpen(true)}
              className="w-full rounded-3xl border border-cyan-500/35 bg-cyan-500/10 px-4 py-4 text-left text-xs font-semibold text-cyan-200 shadow-[0_0_22px_rgba(34,211,238,0.12)] transition-all hover:border-cyan-400/60 hover:bg-cyan-500/16 hover:text-cyan-100"
            >
              <span className="block text-sm font-semibold">✨ AI suggest for next week</span>
              <span className="mt-1 block text-[11px] font-normal text-cyan-400/80">
                Fresh suggestions based on your role, goal, and current tasks. Ctrl+Shift+A
              </span>
            </button>
          </div>

          <footer className="pb-4 text-center">
            <p className="text-xs text-slate-700">Pathly &middot; Design4Future 2026 &middot; AI-orchestrated execution</p>
          </footer>
        </div>
      </main>

      {/* AI SUGGEST TASKS DIALOG */}
      <AISuggestTasksDialog
        open={suggestDialogOpen}
        onClose={() => setSuggestDialogOpen(false)}
        onTasksAdded={({ count, titles }) => {
          setCalendarWeekOffset(1);
          setHighlightedCalendarTaskTitles(titles);
          setCalendarSuccessMessage(
            `${count} ${count === 1 ? "task was" : "tasks were"} added to your next-week calendar.`,
          );
        }}
        userCategory={profile.category}
        mainGoal={profile.mainGoal}
        existingTasks={tasks.map((t) => ({ title: t.title, subject: t.subject ?? undefined }))}
      />

      {/* FLOATING AI CHAT */}
      <AIChat tasks={tasks} profile={profile} progress={progress} />
    </>
  );
}
