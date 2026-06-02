import type { DashboardData } from "@/lib/dashboard-data";
import { planLaneTone } from "@/components/dashboard/plan-lanes";

type RolePlansPanelProps = {
  rolePlans?: DashboardData["rolePlans"];
  roleOverlaps?: DashboardData["roleOverlaps"];
};

export function RolePlansPanel({ rolePlans = [], roleOverlaps = [] }: RolePlansPanelProps) {
  if (rolePlans.length === 0) {
    return null;
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