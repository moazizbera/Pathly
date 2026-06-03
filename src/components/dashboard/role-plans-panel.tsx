import type { DashboardData } from "@/lib/dashboard-data";
import { planLaneTone } from "@/components/dashboard/plan-lanes";
import type { ActiveRole } from "@/lib/role-context";

type RolePlansPanelProps = {
  rolePlans?: DashboardData["rolePlans"];
  roleOverlaps?: DashboardData["roleOverlaps"];
  activeRole?: ActiveRole;
};

export function RolePlansPanel({ rolePlans = [], roleOverlaps = [], activeRole = "all" }: RolePlansPanelProps) {
  if (rolePlans.length === 0) {
    return null;
  }

  const isFocusedRoleView = activeRole !== "all" && rolePlans.length === 1;

  if (isFocusedRoleView) {
    const rolePlan = rolePlans[0];
    const tone = planLaneTone(rolePlan.role);

    return (
      <section className={`rounded-3xl border px-5 py-5 ${tone.border} ${tone.bg}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={`text-xs font-semibold tracking-[0.2em] uppercase ${tone.text}`}>{rolePlan.role} plan</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              This view is locked to one role context, so Pathly only shows the tasks, next move, and planning pressure for {rolePlan.role.toLowerCase()} work.
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.pill}`}>
            {rolePlan.tasks.length} focused task{rolePlan.tasks.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-3xl border border-slate-700/40 bg-slate-950/35 p-4">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">Focused next suggestion</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-100">{rolePlan.suggestion.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{rolePlan.suggestion.detail}</p>
            <p className={`mt-3 text-xs font-semibold ${tone.text}`}>{rolePlan.suggestion.estimatedMinutes} min</p>
          </article>

          <article className="rounded-3xl border border-slate-700/40 bg-slate-900/45 p-4">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">How this mode should feel</p>
            <div className="mt-3 space-y-2 text-xs leading-5 text-slate-400">
              <p>Only {rolePlan.role.toLowerCase()}-owned work should stay visible in the task list and calendar.</p>
              <p>General tasks can still exist, but they should stop competing with the focused recommendation in this view.</p>
              <p>Use All Roles when you want aggregate conflicts, overlaps, and total workload again.</p>
            </div>
          </article>
        </div>

        <div className="mt-4 rounded-3xl border border-slate-700/35 bg-slate-900/35 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">Current {rolePlan.role.toLowerCase()} tasks</p>
            <span className={`text-xs font-semibold ${tone.text}`}>{rolePlan.tasks.length} visible</span>
          </div>
          {rolePlan.tasks.length === 0 ? (
            <p className="mt-3 text-xs leading-5 text-slate-500">
              No task is owned by this role yet. The suggestion above is acting as the first anchor for this focused dashboard.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {rolePlan.tasks.map((task) => (
                <div key={`${rolePlan.role}-${task.id}`} className="rounded-2xl border border-slate-700/35 bg-slate-950/30 px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-100">{task.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {task.description ?? "This task is now role-owned first, so Pathly can schedule and rank it without guessing from text."}
                      </p>
                    </div>
                    {task.due_date ? <span className="shrink-0 text-[11px] text-slate-500">{task.due_date}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-700/30 bg-slate-900/40 px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">Role plans</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Each selected role gets its own tasks and a next suggestion. Shared work is flagged below.
          </p>
        </div>
        <span className="rounded-full border border-slate-700/40 bg-slate-800/40 px-3 py-1 text-xs font-semibold text-slate-300">
          {rolePlans.length} active role{rolePlans.length === 1 ? "" : "s"}
        </span>
      </div>

      {roleOverlaps.length > 0 ? (
        <div className={`mt-4 rounded-2xl border px-4 py-3 ${planLaneTone("shared").border} ${planLaneTone("shared").bg}`}>
          <p className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${planLaneTone("shared").text}`}>Overlap detected</p>
          <div className="mt-2 space-y-2">
            {roleOverlaps.map((overlap) => (
              <p key={`${overlap.source}-${overlap.title}`} className="text-xs leading-5 text-amber-100/90">
                <span className={`font-semibold ${planLaneTone("shared").text}`}>{overlap.title}</span>
                {" matches "}
                {overlap.roles.join(" + ")}
                {overlap.source === "suggestion" ? " as a suggestion." : " as an open task."}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {rolePlans.map((rolePlan) => {
          const tone = planLaneTone(rolePlan.role);

          return (
            <article key={rolePlan.role} className={`rounded-3xl border p-4 ${tone.border} ${tone.bg}`}>
              <div className="flex items-center justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.pill}`}>{rolePlan.role}</span>
                <span className={`text-xs font-semibold ${tone.text}`}>{rolePlan.tasks.length} task{rolePlan.tasks.length === 1 ? "" : "s"}</span>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-700/40 bg-slate-950/35 p-4">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">Next suggestion</p>
                <p className="mt-2 text-sm font-semibold text-slate-100">{rolePlan.suggestion.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{rolePlan.suggestion.detail}</p>
                <p className={`mt-2 text-xs font-semibold ${tone.text}`}>{rolePlan.suggestion.estimatedMinutes} min</p>
              </div>

              <div className="mt-4">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">Current tasks</p>
                {rolePlan.tasks.length === 0 ? (
                  <p className="mt-2 text-xs leading-5 text-slate-500">No clear task matched this role yet. Pathly is using the suggestion above as the next anchor.</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {rolePlan.tasks.map((task) => (
                      <div key={`${rolePlan.role}-${task.id}`} className="rounded-2xl border border-slate-700/35 bg-slate-900/45 px-3 py-2.5">
                        <p className="text-xs font-semibold text-slate-100">{task.title}</p>
                        <p className="mt-1 text-[11px] leading-5 text-slate-500">
                          {task.description ?? "Existing task matched to this role by title, subject, or planning context."}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}