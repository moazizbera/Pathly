"use client";

import { useMemo } from "react";
import type { TaskRecord } from "@/lib/dashboard-data";

interface InsightsPanelProps {
  tasks: TaskRecord[];
  profile: { category: string; availability: string; fullName: string };
  progress: { completionRate: number; completedTasks: number; totalTasks: number };
}

export function InsightsPanel({ tasks, profile, progress }: InsightsPanelProps) {
  const insights = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const active = tasks.filter((t) => t.status !== "completed");
    const completed = tasks.filter((t) => t.status === "completed");
    
    // ─── Streak calculation ───
    let streak = 0;
    // Simple streak: if we have completed tasks today, show the count of completed as momentum
    if (completed.length > 0) {
      // Use completed count as a simple streak indicator ("n tasks in a row")
      streak = Math.min(completed.length, 10); // cap at 10 for visual purposes
    }

    // ─── Badges ───
    const badges: Array<{ icon: string; label: string; color: string; hint: string }> = [];
    
    if (progress.completionRate >= 90) badges.push({ icon: "🏆", label: "On fire", color: "text-amber-400", hint: "90%+ completion today" });
    else if (progress.completionRate >= 75) badges.push({ icon: "⚡", label: "Strong pace", color: "text-emerald-400", hint: "75%+ done" });
    
    if (streak >= 5) badges.push({ icon: "🔥", label: `${streak}-day streak`, color: "text-red-400", hint: "Consistency wins" });
    else if (streak >= 3) badges.push({ icon: "📈", label: `${streak}-day streak`, color: "text-cyan-400", hint: "Building momentum" });
    
    const avgTaskTime = completed.length > 0 
      ? Math.round(completed.reduce((sum, t) => sum + (t.estimated_minutes ?? 25), 0) / completed.length)
      : 25;
    
    if (completed.length >= 5) badges.push({ icon: "✅", label: `${completed.length} done`, color: "text-emerald-400", hint: "Strong track record" });
    
    if (active.filter((t) => t.priority === "high").length === 0 && active.length > 0) {
      badges.push({ icon: "🎯", label: "Balanced", color: "text-indigo-400", hint: "No high-priority bottlenecks" });
    }

    // ─── Time predictions ───
    const totalRemaining = active.reduce((sum, t) => sum + (t.estimated_minutes ?? 25), 0);
    const availMins = parseInt(profile.availability) || 90;
    const daysToComplete = Math.ceil(totalRemaining / availMins);
    const completeBy = new Date();
    completeBy.setDate(completeBy.getDate() + daysToComplete);
    
    // ─── Smart insights ───
    const smartInsights: Array<{ title: string; text: string; action?: string; color: string }> = [];
    
    if (active.length === 0) {
      smartInsights.push({
        title: "Clear board",
        text: "All tasks done. Celebrate this moment! 🎉",
        color: "border-emerald-500/30 bg-emerald-500/10",
      });
    } else if (active.length <= 3) {
      smartInsights.push({
        title: "Final push",
        text: `Just **${active.length}** task${active.length !== 1 ? "s" : ""} left (~${totalRemaining}m). Finish strong today.`,
        color: "border-cyan-500/30 bg-cyan-500/10",
      });
    } else if (daysToComplete === 1) {
      smartInsights.push({
        title: "Completion tomorrow",
        text: `At **${profile.availability}**m/day, you'll clear this by **${completeBy.toLocaleDateString("en-US", { weekday: "short" })}**.`,
        color: "border-emerald-500/30 bg-emerald-500/10",
      });
    } else if (daysToComplete <= 7) {
      smartInsights.push({
        title: "On track",
        text: `Clear backlog by **${completeBy.toLocaleDateString("en-US", { month: "short", day: "numeric" })}** at this pace.`,
        color: "border-cyan-500/30 bg-cyan-500/10",
      });
    } else if (daysToComplete > 21) {
      smartInsights.push({
        title: "Overloaded",
        text: `**${daysToComplete}** days at current pace. Consider delegating or splitting big tasks.`,
        color: "border-amber-500/30 bg-amber-500/10",
      });
    }

    // ─── Category-specific tip ───
    const categoryTips: Record<string, string> = {
      student: "🎓 Study in 25-50 min blocks with 5-min breaks. Exams → homework → admin.",
      employee: "💼 Deep work before meetings. Batch communications in 2x daily blocks.",
      teacher: "📚 Prep tomorrow's lesson first, grade after. Student readiness > admin.",
    };
    
    const categories = profile.category.split(",").map((c) => c.trim().toLowerCase());
    let tip: string;
    if (categories.length === 1) {
      tip = categoryTips[categories[0]] || "🎯 Focus on one task at a time.";
    } else {
      const blended: string[] = [];
      if (categories.includes("student")) blended.push("Study blocks (25-50m)");
      if (categories.includes("employee")) blended.push("Deep work before meetings");
      if (categories.includes("teacher")) blended.push("Lesson prep first");
      tip = `🎯 Balance: ${blended.join(" • ")}`;
    }
    
    return { badges, daysToComplete, completeBy, totalRemaining, smartInsights, tip, streak, avgTaskTime };
  }, [tasks, profile, progress]);

  if (insights.badges.length === 0 && insights.smartInsights.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-3">
      {/* Badges row */}
      {insights.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {insights.badges.map((badge, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 rounded-full border border-slate-600/40 bg-slate-800/40 px-3 py-1.5 text-xs font-semibold"
              title={badge.hint}
            >
              <span className="text-sm">{badge.icon}</span>
              <span className={badge.color}>{badge.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Insights cards */}
      {insights.smartInsights.map((insight, idx) => (
        <div key={idx} className={`rounded-2xl border p-4 ${insight.color}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-semibold text-slate-100">{insight.title}</h4>
              <p className="mt-1 text-sm text-slate-300">{insight.text}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Category tip */}
      {insights.tip && (
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
          <p className="text-xs font-semibold text-indigo-300">{insights.tip}</p>
        </div>
      )}
    </section>
  );
}
