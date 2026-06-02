export type PlanLane = "Student" | "Employee" | "Teacher" | "shared" | "general";

type SupportedRole = "Student" | "Employee" | "Teacher";

export function rolesToPlanLane(roles?: SupportedRole[]): PlanLane {
  if (!roles || roles.length === 0) {
    return "general";
  }

  if (roles.length > 1) {
    return "shared";
  }

  return roles[0];
}

export function planLaneTitle(lane: PlanLane) {
  if (lane === "shared") {
    return "Shared across roles";
  }

  if (lane === "general") {
    return "General";
  }

  return lane;
}

export function planLaneTone(lane: PlanLane) {
  if (lane === "Student") {
    return {
      border: "border-cyan-500/25",
      bg: "bg-cyan-500/8",
      text: "text-cyan-200",
      pill: "badge-cyan",
      subtlePill: "bg-cyan-500/15 text-cyan-200",
    };
  }

  if (lane === "Employee") {
    return {
      border: "border-emerald-500/25",
      bg: "bg-emerald-500/8",
      text: "text-emerald-200",
      pill: "badge-emerald",
      subtlePill: "bg-emerald-500/15 text-emerald-200",
    };
  }

  if (lane === "Teacher") {
    return {
      border: "border-indigo-500/25",
      bg: "bg-indigo-500/8",
      text: "text-indigo-200",
      pill: "badge-indigo",
      subtlePill: "bg-indigo-500/15 text-indigo-200",
    };
  }

  if (lane === "shared") {
    return {
      border: "border-amber-500/25",
      bg: "bg-amber-500/8",
      text: "text-amber-200",
      pill: "bg-amber-500/15 text-amber-200",
      subtlePill: "bg-amber-500/15 text-amber-200",
    };
  }

  return {
    border: "border-slate-500/25",
    bg: "bg-slate-500/8",
    text: "text-slate-200",
    pill: "bg-slate-700/50 text-slate-200",
    subtlePill: "bg-slate-700/40 text-slate-300",
  };
}