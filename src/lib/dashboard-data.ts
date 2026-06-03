import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { ActiveRole, RoleProfileSnapshot, SupportedRole, TaskLaneValue } from "@/lib/role-context";
import { isSupportedRole, normalizeActiveRole } from "@/lib/role-context";

type ProfileRecord = {
  full_name: string | null;
  category: string | null;
  main_goal: string | null;
  focus_preference: string | null;
  availability: string | null;
  active_role: string | null;
};

type RoleProfileRecord = {
  id: string;
  role: string;
  main_goal: string | null;
  focus_preference: string | null;
  availability: string | null;
};

export type TaskRecord = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  estimated_minutes: number | null;
  priority: string;
  status: string;
  subject: string | null;
  role_profile_id: string | null;
  task_lane: TaskLaneValue | null;
  resolved_role?: SupportedRole | null;
};

export type DashboardData = {
  profile: {
    fullName: string;
    category: string;
    mainGoal: string;
    focusPreference: string;
    availability: string;
    activeRole: ActiveRole;
  };
  accountProfile: {
    fullName: string;
    category: string;
    mainGoal: string;
    focusPreference: string;
    availability: string;
    activeRole: ActiveRole;
  };
  activeRole: ActiveRole;
  availableRoles: SupportedRole[];
  roleProfiles: RoleProfileSnapshot[];
  tasks: TaskRecord[];
  progress: {
    completionRate: number;
    completedTasks: number;
    totalTasks: number;
    completedMinutes: number;
    remainingMinutes: number;
    focusMessage: string;
  };
  groupedTasks: Array<{
    key: "do-now" | "plan-next" | "can-wait";
    label: string;
    description: string;
    tasks: TaskRecord[];
  }>;
  recommendation: {
    title: string;
    reason: string;
    estimatedMinutes: number;
    coachMessage: string;
  };
  mainObjective: {
    title: string;
    detail: string;
  };
  agenda: Array<{
    slot: string;
    title: string;
    minutes: number;
    detail: string;
  }>;
  aiRole: {
    headline: string;
    detail: string;
    bullets: string[];
  };
  aiBrief: {
    headline: string;
    summary: string;
    nextMove: string;
    confidence: number;
    riskAlerts: string[];
    followUps: string[];
  };
  insights: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  playbook: Array<{
    title: string;
    detail: string;
  }>;
  rolePlans: Array<{
    role: SupportedRole;
    tasks: TaskRecord[];
    suggestion: {
      title: string;
      detail: string;
      estimatedMinutes: number;
    };
  }>;
  roleOverlaps: Array<{
    title: string;
    roles: SupportedRole[];
    source: "task" | "suggestion";
  }>;
  setupHint?: string;
};

export type ProfileSnapshot = DashboardData["profile"];

export type ProfilePreview = Pick<DashboardData, "recommendation" | "insights" | "playbook"> & {
  previewTasks: TaskRecord[];
};

type StarterTaskSeed = Omit<TaskRecord, "id" | "role_profile_id" | "task_lane" | "resolved_role">;

function isMissingSubjectColumnError(error: { code?: string; message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() ?? "";
  return message.includes("subject") && (message.includes("schema cache") || message.includes("column"));
}

function isMissingColumnError(error: { code?: string; message?: string } | null | undefined, column: string) {
  const message = error?.message?.toLowerCase() ?? "";
  return message.includes(column.toLowerCase()) && (message.includes("schema cache") || message.includes("column"));
}

function isMissingTableError(error: { code?: string; message?: string } | null | undefined, table: string) {
  const message = error?.message?.toLowerCase() ?? "";
  return error?.code === "42P01" || (message.includes(table.toLowerCase()) && message.includes("does not exist"));
}

const numberWords: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

function inferProjectCount(mainGoal: string): number | undefined {
  const digitMatch = mainGoal.match(/\b(\d+)\s+projects?\b/i);
  if (digitMatch) {
    const parsed = Number.parseInt(digitMatch[1], 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  const wordMatch = mainGoal.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+projects?\b/i);
  if (wordMatch) {
    return numberWords[wordMatch[1].toLowerCase()];
  }

  return undefined;
}

function detectGoalSignals(mainGoal: string) {
  const normalized = mainGoal.toLowerCase();

  return {
    hasDeliveryTrack: /enterprise|client|production|stakeholder|delivery|project|deadline/.test(normalized),
    projectCount: inferProjectCount(mainGoal),
  };
}

function parseProfileCategories(category: string): string[] {
  return category
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasRole(category: string, target: SupportedRole) {
  return parseProfileCategories(category).some((item) => item.toLowerCase() === target.toLowerCase());
}

function buildDerivedRoleProfiles(profile: {
  category: string;
  mainGoal: string;
  focusPreference: string;
  availability: string;
}): RoleProfileSnapshot[] {
  return parseProfileCategories(profile.category)
    .filter(isSupportedRole)
    .map((role) => ({
      id: `derived-${role.toLowerCase()}`,
      role,
      mainGoal: profile.mainGoal,
      focusPreference: profile.focusPreference,
      availability: profile.availability,
      isDerived: true,
    }));
}

function buildRoleProfileMap(roleProfiles: RoleProfileSnapshot[]) {
  return new Map(roleProfiles.map((roleProfile) => [roleProfile.id, roleProfile.role] as const));
}

function buildEffectiveProfile(
  accountProfile: DashboardData["accountProfile"],
  roleProfiles: RoleProfileSnapshot[],
  activeRole: ActiveRole,
): DashboardData["profile"] {
  if (activeRole === "all") {
    return accountProfile;
  }

  const roleProfile = roleProfiles.find((item) => item.role === activeRole);
  if (!roleProfile) {
    return accountProfile;
  }

  return {
    fullName: accountProfile.fullName,
    category: roleProfile.role,
    mainGoal: roleProfile.mainGoal,
    focusPreference: roleProfile.focusPreference,
    availability: roleProfile.availability,
    activeRole,
  };
}

function inferLegacyTaskRoles(task: TaskRecord): SupportedRole[] {
  const matches: SupportedRole[] = [];

  if (roleKeywordBoost(task, "Student") > 0) {
    matches.push("Student");
  }

  if (roleKeywordBoost(task, "Employee") > 0) {
    matches.push("Employee");
  }

  if (roleKeywordBoost(task, "Teacher") > 0) {
    matches.push("Teacher");
  }

  return matches;
}

function resolveTaskRoles(task: TaskRecord, roleProfileMap: Map<string, SupportedRole>, selectedRoles: SupportedRole[]): SupportedRole[] {
  if (task.role_profile_id) {
    const ownedRole = roleProfileMap.get(task.role_profile_id);
    return ownedRole ? [ownedRole] : [];
  }

  if (task.task_lane === "shared") {
    return selectedRoles;
  }

  if (task.task_lane === "general") {
    return [];
  }

  return inferLegacyTaskRoles(task).filter((role) => selectedRoles.includes(role));
}

function filterTasksByActiveRole(
  tasks: TaskRecord[],
  activeRole: ActiveRole,
  roleProfileMap: Map<string, SupportedRole>,
  selectedRoles: SupportedRole[],
) {
  if (activeRole === "all") {
    return tasks;
  }

  return tasks.filter((task) => resolveTaskRoles(task, roleProfileMap, selectedRoles).includes(activeRole));
}

function defaultEmployeeTemplateTasks(): StarterTaskSeed[] {
  return [
    {
      title: "Finish launch review summary",
      description: "Due today and unlocks your 2 PM stakeholder meeting.",
      due_date: isoDatePlus(0),
      estimated_minutes: 25,
      priority: "high",
      status: "todo",
      subject: null,
    },
    {
      title: "Reply to client revision notes",
      description: "Keep the project moving after the summary is out.",
      due_date: isoDatePlus(1),
      estimated_minutes: 20,
      priority: "medium",
      status: "todo",
      subject: null,
    },
    {
      title: "Reset tomorrow's calendar",
      description: "Protect one calm focus block before meetings take over.",
      due_date: isoDatePlus(1),
      estimated_minutes: 15,
      priority: "medium",
      status: "todo",
      subject: null,
    },
  ];
}

function goalAwareEmployeeTasks(mainGoal?: string): StarterTaskSeed[] {
  if (!mainGoal || mainGoal.trim().length < 8) {
    return defaultEmployeeTemplateTasks();
  }

  const signals = detectGoalSignals(mainGoal);
  const projectText = signals.projectCount ? `${signals.projectCount} active projects` : "multiple active projects";

  if (signals.hasDeliveryTrack) {
    return [
      {
        title: "Clear the highest-risk delivery item",
        description: `Focus the first block on the workstream with the most upstream impact across ${projectText}.`,
        due_date: isoDatePlus(0),
        estimated_minutes: 30,
        priority: "high",
        status: "todo",
        subject: null,
      },
      {
        title: "Align stakeholders on next milestone",
        description: "Send a concise status update that prevents last-minute surprises before end of day.",
        due_date: isoDatePlus(1),
        estimated_minutes: 20,
        priority: "medium",
        status: "todo",
        subject: null,
      },
      {
        title: "Reserve tomorrow's deep execution window",
        description: "Protect implementation time before meetings consume the calendar.",
        due_date: isoDatePlus(1),
        estimated_minutes: 15,
        priority: "medium",
        status: "todo",
        subject: null,
      },
    ];
  }

  return defaultEmployeeTemplateTasks();
}

function isoDatePlus(daysAhead: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}

function starterTasksForRole(category: string, mainGoal?: string): StarterTaskSeed[] {
  if (category === "Student") {
    return [
      {
        title: "Review chapter 3 notes",
        description: "Get ready for the exam in two days.",
        due_date: isoDatePlus(2),
        estimated_minutes: 30,
        priority: "high",
        status: "todo",
        subject: null,
      },
      {
        title: "Outline tomorrow's assignment",
        description: "Reduce start-up friction before the evening block.",
        due_date: isoDatePlus(1),
        estimated_minutes: 20,
        priority: "medium",
        status: "todo",
        subject: null,
      },
      {
        title: "Schedule a 45-minute revision block",
        description: "Reserve time before the week gets crowded.",
        due_date: isoDatePlus(3),
        estimated_minutes: 15,
        priority: "medium",
        status: "todo",
        subject: null,
      },
    ];
  }

  if (category === "Teacher") {
    return [
      {
        title: "Prepare tomorrow's lesson opener",
        description: "Short prep that unlocks the rest of class planning.",
        due_date: isoDatePlus(1),
        estimated_minutes: 25,
        priority: "high",
        status: "todo",
        subject: null,
      },
      {
        title: "Grade the first five grading items",
        description: "Shrink the grading backlog with a realistic batch.",
        due_date: isoDatePlus(2),
        estimated_minutes: 35,
        priority: "medium",
        status: "todo",
        subject: null,
      },
      {
        title: "Send tomorrow's prep note to parents",
        description: "Prevent last-minute questions before class begins.",
        due_date: isoDatePlus(1),
        estimated_minutes: 15,
        priority: "low",
        status: "todo",
        subject: null,
      },
    ];
  }

  return goalAwareEmployeeTasks(mainGoal);
}

export function starterTasks(category: string, mainGoal?: string): StarterTaskSeed[] {
  const roles = parseProfileCategories(category);

  if (roles.length <= 1) {
    return starterTasksForRole(roles[0] ?? category, mainGoal);
  }

  const perRoleTasks = roles.map((role) => starterTasksForRole(role, mainGoal));
  const blended: StarterTaskSeed[] = [];
  const seen = new Set<string>();

  for (let index = 0; index < 3; index++) {
    for (const roleTasks of perRoleTasks) {
      const candidate = roleTasks[index];
      if (!candidate) continue;
      const key = candidate.title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      blended.push(candidate);
    }
  }

  return blended.slice(0, 5);
}

function fallbackTasks(category: string, mainGoal?: string): TaskRecord[] {
  return starterTasks(category, mainGoal).map((task, index) => ({
    id: `demo-${category.toLowerCase()}-${index + 1}`,
    ...task,
    role_profile_id: null,
    task_lane: null,
    resolved_role: null,
  }));
}

function shouldUpgradeTemplateTasks(tasks: TaskRecord[], profile: DashboardData["profile"]): boolean {
  if (!hasRole(profile.category, "Employee") || parseProfileCategories(profile.category).length > 1) {
    return false;
  }

  if (tasks.length === 0 || tasks.some((task) => task.status === "completed")) {
    return false;
  }

  const templateTitles = new Set(defaultEmployeeTemplateTasks().map((task) => task.title.toLowerCase()));
  const taskTitles = tasks.map((task) => task.title.toLowerCase());
  const allLookLikeTemplate = taskTitles.every((title) => templateTitles.has(title));

  if (!allLookLikeTemplate) {
    return false;
  }

  const signals = detectGoalSignals(profile.mainGoal);
  return signals.hasDeliveryTrack;
}

function scoreTask(task: TaskRecord) {
  const priorityScore = task.priority === "high" ? 3 : task.priority === "medium" ? 2 : 1;
  const dueScore = task.due_date ? 2 : 0;
  const statusScore = task.status === "todo" ? 2 : 0;
  const effortScore = task.estimated_minutes && task.estimated_minutes <= 30 ? 2 : 1;

  return priorityScore + dueScore + statusScore + effortScore;
}

function roleSignalBoost(task: TaskRecord, category: string): number {
  const roles = parseProfileCategories(category).map((item) => item.toLowerCase());
  if (roles.length <= 1) {
    return 0;
  }

  const text = `${task.title} ${task.description ?? ""} ${task.subject ?? ""}`.toLowerCase();
  let boost = 0;

  if (roles.includes("student") && /(exam|quiz|study|revision|assignment|course)/.test(text)) {
    boost += 2;
  }

  if (roles.includes("employee") && /(meeting|deliverable|project|stakeholder|client|report)/.test(text)) {
    boost += 2;
  }

  if (roles.includes("teacher") && /(lesson|class|grading|student prep|curriculum)/.test(text)) {
    boost += 2;
  }

  return boost;
}

function roleKeywordBoost(task: TaskRecord, role: "Student" | "Employee" | "Teacher") {
  const text = `${task.title} ${task.description ?? ""} ${task.subject ?? ""}`.toLowerCase();

  if (role === "Student") {
    return /(exam|quiz|study|revision|assignment|course|lab|chapter|homework)/.test(text) ? 3 : 0;
  }

  if (role === "Employee") {
    return /(meeting|deliverable|project|stakeholder|client|report|launch|review|module|slack)/.test(text) ? 3 : 0;
  }

  return /(lesson|class|grading|student prep|curriculum|worksheet|parent|classroom)/.test(text) ? 3 : 0;
}

function buildRolePlans(
  accountProfile: DashboardData["accountProfile"],
  tasks: TaskRecord[],
  roleProfiles: RoleProfileSnapshot[],
  activeRole: ActiveRole,
): Pick<DashboardData, "rolePlans" | "roleOverlaps"> {
  const allSelectedRoles = parseProfileCategories(accountProfile.category).filter(isSupportedRole);
  const selectedRoles = activeRole === "all" ? allSelectedRoles : allSelectedRoles.filter((role) => role === activeRole);
  const openTasks = tasks.filter((task) => task.status !== "completed");
  const roleProfileMap = buildRoleProfileMap(roleProfiles);

  if (selectedRoles.length === 0) {
    return { rolePlans: [], roleOverlaps: [] };
  }

  const rolePlans = selectedRoles.map((role) => {
    const matchingTasks = openTasks
      .filter((task) => resolveTaskRoles(task, roleProfileMap, allSelectedRoles).includes(role))
      .sort((left, right) => scoreTask(right) + roleKeywordBoost(right, role) - (scoreTask(left) + roleKeywordBoost(left, role)))
      .slice(0, 3);

    const roleProfile = roleProfiles.find((item) => item.role === role);
    const roleSuggestions = starterTasksForRole(role, roleProfile?.mainGoal ?? accountProfile.mainGoal);
    const seenTitles = new Set(matchingTasks.map((task) => task.title.toLowerCase()));
    const suggestionTask =
      roleSuggestions.find((task) => !seenTitles.has(task.title.toLowerCase())) ?? roleSuggestions[0] ?? matchingTasks[0];

    return {
      role,
      tasks: matchingTasks,
      suggestion: {
        title: suggestionTask?.title ?? `Add a ${role.toLowerCase()} priority`,
        detail:
          suggestionTask?.description ?? `Pathly does not see a clear ${role.toLowerCase()} task yet, so this becomes the next suggestion.`,
        estimatedMinutes: suggestionTask?.estimated_minutes ?? 25,
      },
    };
  });

  const overlaps: DashboardData["roleOverlaps"] = [];
  const seenOverlapKeys = new Set<string>();

  for (const task of openTasks) {
    const roles = resolveTaskRoles(task, roleProfileMap, allSelectedRoles).filter((role) => selectedRoles.includes(role));
    if (roles.length <= 1) {
      continue;
    }

    const key = `task:${task.title.toLowerCase()}`;
    if (seenOverlapKeys.has(key)) {
      continue;
    }

    seenOverlapKeys.add(key);
    overlaps.push({
      title: task.title,
      roles,
      source: "task",
    });
  }

  const suggestionMap = new Map<string, Array<"Student" | "Employee" | "Teacher">>();
  for (const rolePlan of rolePlans) {
    const key = rolePlan.suggestion.title.toLowerCase();
    suggestionMap.set(key, [...(suggestionMap.get(key) ?? []), rolePlan.role]);
  }

  for (const rolePlan of rolePlans) {
    const roles = suggestionMap.get(rolePlan.suggestion.title.toLowerCase()) ?? [];
    if (roles.length <= 1) {
      continue;
    }

    const key = `suggestion:${rolePlan.suggestion.title.toLowerCase()}`;
    if (seenOverlapKeys.has(key)) {
      continue;
    }

    seenOverlapKeys.add(key);
    overlaps.push({
      title: rolePlan.suggestion.title,
      roles,
      source: "suggestion",
    });
  }

  return { rolePlans, roleOverlaps: overlaps };
}

function parseAvailabilityMinutes(availability: string) {
  const match = availability.match(/(\d+)/);
  if (!match) {
    return 90;
  }

  const parsed = Number.parseInt(match[1], 10);
  return Number.isNaN(parsed) ? 90 : parsed;
}

function buildMainObjective(
  profile: DashboardData["profile"],
  recommendation: DashboardData["recommendation"],
): DashboardData["mainObjective"] {
  return {
    title: recommendation.title,
    detail: `Objective anchor: ${profile.mainGoal}`,
  };
}

function buildAgenda(
  profile: DashboardData["profile"],
  tasks: TaskRecord[],
  recommendation: DashboardData["recommendation"],
): DashboardData["agenda"] {
  const openTasks = [...tasks]
    .filter((task) => task.status !== "completed")
    .sort(
      (left, right) =>
        scoreTask(right) + roleSignalBoost(right, profile.category) - (scoreTask(left) + roleSignalBoost(left, profile.category)),
    );

  if (openTasks.length === 0) {
    return [
      {
        slot: "Block 01",
        title: "Add your first priority",
        minutes: 10,
        detail: "As soon as one real task exists, Pathly will build a role-aware agenda.",
      },
    ];
  }

  const availabilityMinutes = parseAvailabilityMinutes(profile.availability);
  let usedMinutes = 0;
  const agenda: DashboardData["agenda"] = [];

  for (const [index, task] of openTasks.entries()) {
    if (index >= 4) {
      break;
    }

    const minutes = task.estimated_minutes ?? 25;
    if (usedMinutes + minutes > availabilityMinutes && agenda.length > 0) {
      break;
    }

    usedMinutes += minutes;
    agenda.push({
      slot: `Block ${String(index + 1).padStart(2, "0")}`,
      title: task.title,
      minutes,
      detail:
        index === 0
          ? `${parseProfileCategories(profile.category).length > 1 ? "Role-balanced priority first." : "Main objective first."} ${recommendation.reason}`
          : task.description ?? "Follow-up work sequenced after the main objective.",
    });
  }

  return agenda;
}

function buildAiRole(
  profile: DashboardData["profile"],
  tasks: TaskRecord[],
  recommendation: DashboardData["recommendation"],
): DashboardData["aiRole"] {
  const signals = detectGoalSignals(profile.mainGoal);
  const openTasks = tasks.filter((task) => task.status !== "completed");
  const topTask = [...openTasks].sort(
    (left, right) =>
      scoreTask(right) + roleSignalBoost(right, profile.category) - (scoreTask(left) + roleSignalBoost(left, profile.category)),
  )[0];
  const projectText = signals.projectCount ? `${signals.projectCount} projects` : "your active projects";
  const roleLabel = parseProfileCategories(profile.category).join(" + ");

  const bullets = [
    `Reads your profile objective and role context (${roleLabel}) to prioritize relevant work, not generic tasks.`,
    `Scores urgency, priority, and effort; current top pick: ${topTask?.title ?? recommendation.title}.`,
    `Builds a time-block agenda inside your capacity (${profile.availability}) so execution stays realistic.`,
  ];

  if (signals.hasDeliveryTrack) {
    bullets.push(`Balances delivery commitments and day-to-day execution across ${projectText} to reduce context-switch loss.`);
  }

  return {
    headline: "AI Orchestration Layer",
    detail: "Pathly AI turns your objective into a practical execution sequence, then continuously re-prioritizes as tasks change.",
    bullets,
  };
}

function buildAiBrief(
  profile: DashboardData["profile"],
  tasks: TaskRecord[],
  recommendation: DashboardData["recommendation"],
  progress: DashboardData["progress"],
): DashboardData["aiBrief"] {
  const today = new Date().toISOString().slice(0, 10);
  const signals = detectGoalSignals(profile.mainGoal);
  const openTasks = tasks
    .filter((task) => task.status !== "completed")
    .sort((left, right) => scoreTask(right) - scoreTask(left));

  const top = openTasks[0];
  const backup = openTasks[1];
  const overdue = openTasks.filter((task) => task.due_date && task.due_date < today);
  const missingEstimates = openTasks.filter((task) => !task.estimated_minutes).length;
  const availabilityMinutes = parseAvailabilityMinutes(profile.availability);
  const projectText = signals.projectCount ? `${signals.projectCount} projects` : "your active projects";

  const confidenceRaw =
    35 +
    (top ? 20 : 0) +
    (openTasks.length > 0 ? 10 : 0) +
    Math.max(0, 20 - overdue.length * 8) +
    Math.max(0, 15 - missingEstimates * 5);
  const confidence = Math.min(98, Math.max(42, confidenceRaw));

  const riskAlerts: string[] = [];

  if (overdue.length > 0) {
    riskAlerts.push(`${overdue.length} task${overdue.length === 1 ? " is" : "s are"} overdue and should be handled before new work.`);
  }

  if (progress.remainingMinutes > availabilityMinutes + 20) {
    riskAlerts.push(
      `Workload is ${progress.remainingMinutes - availabilityMinutes} min above your stated capacity (${profile.availability}); split or defer low-impact tasks.`,
    );
  }

  const subjectSet = new Set(openTasks.map((t) => t.subject).filter(Boolean));
  if (subjectSet.size >= 3) {
    riskAlerts.push(`Tasks span ${subjectSet.size} different subjects. Protect context by grouping same-subject work into dedicated blocks.`);
  }

  if (progress.completedTasks === 0 && openTasks.length > 0) {
    riskAlerts.push("No momentum yet today; finishing one scoped task will unlock a stronger next recommendation.");
  }

  if (riskAlerts.length === 0) {
    riskAlerts.push("No critical risk right now. Keep execution tight and re-check after each completed task.");
  }

  const followUps = [
    top
      ? `If blocked on ${top.title.toLowerCase()}, timebox 12 minutes, capture blocker notes, then switch to ${backup?.title ?? "the next highest-priority task"}.`
      : "Add one real task so the agent can prioritize and adapt your sequence.",
    `After each completion, re-rank by impact and due risk, not by arrival order.`,
    signals.hasDeliveryTrack
      ? `With ${projectText} in play, group tasks by subject or project into dedicated blocks to avoid cross-context switching.`
      : "Reserve a final 10-minute closure block to summarize outcomes and prepare tomorrow's first move.",
  ];

  return {
    headline: "AI Mission Control",
    summary:
      "This panel explains what the agent would do next, why it chose that sequence, and what to change when reality shifts.",
    nextMove: recommendation.title,
    confidence,
    riskAlerts,
    followUps,
  };
}

function buildGroupedTasks(tasks: TaskRecord[]): DashboardData["groupedTasks"] {
  const openTasks = tasks
    .filter((task) => task.status !== "completed")
    .sort((left, right) => scoreTask(right) - scoreTask(left));

  const groupedTasks: DashboardData["groupedTasks"] = [
    {
      key: "do-now",
      label: "Do now",
      description: "The smallest set of tasks most likely to reduce pressure right away.",
      tasks: [],
    },
    {
      key: "plan-next",
      label: "Plan next",
      description: "Important follow-up work that matters, but does not need the first focus block.",
      tasks: [],
    },
    {
      key: "can-wait",
      label: "Can wait",
      description: "Still worth seeing, but safe to leave for later after the critical work moves.",
      tasks: [],
    },
  ];

  openTasks.forEach((task, index) => {
    const targetGroup = index === 0 ? 0 : index <= 2 ? 1 : 2;
    groupedTasks[targetGroup].tasks.push(task);
  });

  return groupedTasks.filter((group) => group.tasks.length > 0);
}

function buildProgress(profile: DashboardData["profile"], tasks: TaskRecord[]): DashboardData["progress"] {
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const openTasks = tasks.filter((task) => task.status !== "completed");
  const totalTasks = tasks.length;
  const completedMinutes = completedTasks.reduce((total, task) => total + (task.estimated_minutes ?? 25), 0);
  const remainingMinutes = openTasks.reduce((total, task) => total + (task.estimated_minutes ?? 25), 0);
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks.length / totalTasks) * 100);

  return {
    completionRate,
    completedTasks: completedTasks.length,
    totalTasks,
    completedMinutes,
    remainingMinutes,
    focusMessage:
      completedTasks.length > 0
        ? `${profile.fullName.split(" ")[0]} has already cleared meaningful work, so Pathly can focus on sequencing the rest.`
        : `No tasks are complete yet, so the first focus block should protect the highest-value move.`,
  };
}

function coachMessage(category: string, topTask: TaskRecord | undefined, mainGoal?: string) {
  if (!topTask) {
    return "Add one real priority and Pathly will start guiding your next move.";
  }

  const roles = parseProfileCategories(category);
  if (roles.length > 1) {
    return `Role Coach: Start with ${topTask.title.toLowerCase()} because it best matches your combined roles (${roles.join(" + ")}), then switch only after completion.`;
  }

  if (hasRole(category, "Student")) {
    return `Student Coach: Start with ${topTask.title.toLowerCase()} while your energy is still fresh, then move into lighter review.`;
  }

  if (hasRole(category, "Teacher")) {
    return `Teacher Coach: Clear ${topTask.title.toLowerCase()} first so the rest of the day stays easier to manage.`;
  }

  if (mainGoal) {
    const signals = detectGoalSignals(mainGoal);
    if (signals.hasDeliveryTrack) {
      return `Role Coach: Start with ${topTask.title.toLowerCase()}, then protect one separate block for lower-priority follow-ups to avoid context loss.`;
    }
  }

  return `Role Coach: Finish ${topTask.title.toLowerCase()} before context switching steals the best part of your focus window.`;
}

function recommendTask(tasks: TaskRecord[], category: string, mainGoal?: string) {
  const openTasks = tasks.filter((task) => task.status !== "completed");
  const sortedTasks = [...openTasks].sort(
    (left, right) => scoreTask(right) + roleSignalBoost(right, category) - (scoreTask(left) + roleSignalBoost(left, category)),
  );
  const topTask = sortedTasks[0];

  if (!topTask) {
    return {
      title: "Create your first task",
      reason: "Pathly can start guiding you as soon as you add one real priority.",
      estimatedMinutes: 10,
      coachMessage: coachMessage(category, undefined, mainGoal),
    };
  }

  return {
    title: topTask.title,
    reason:
      topTask.description ??
      "Pathly picked this because it combines urgency, importance, and a manageable effort window.",
    estimatedMinutes: topTask.estimated_minutes ?? 25,
    coachMessage: coachMessage(category, topTask, mainGoal),
  };
}

function buildInsights(
  profile: DashboardData["profile"],
  tasks: TaskRecord[],
  recommendation: DashboardData["recommendation"],
): DashboardData["insights"] {
  const openTasks = tasks.filter((task) => task.status !== "completed");
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const remainingMinutes = openTasks.reduce((total, task) => total + (task.estimated_minutes ?? 25), 0);
  const signals = detectGoalSignals(profile.mainGoal);

  return [
    {
      label: "Open priorities",
      value: `${openTasks.length}`,
      detail: openTasks.length === 1 ? "One task still needs attention." : `${openTasks.length} tasks still need attention.`,
    },
    {
      label: "Focus load",
      value: `${remainingMinutes} min`,
      detail:
        signals.hasDeliveryTrack
          ? `${profile.availability} available, with ${recommendation.estimatedMinutes} minutes reserved for the next move and a second block for follow-up commitments.`
          : `${profile.availability} available, with ${recommendation.estimatedMinutes} minutes reserved for the next move.`,
    },
    {
      label: "Momentum",
      value: completedTasks.length > 0 ? `${completedTasks.length} done` : "Ready",
      detail:
        completedTasks.length > 0
          ? "Progress already exists today, so Pathly can tighten the plan instead of starting from zero."
          : "No finished tasks yet, which makes the first recommendation especially important.",
    },
  ];
}

function buildPlaybook(profile: DashboardData["profile"]): DashboardData["playbook"] {
  const roles = parseProfileCategories(profile.category);

  if (roles.length > 1) {
    return [
      {
        title: "Start with the highest cross-role impact task",
        detail: `Pathly balances ${roles.join(" + ")} by promoting work that reduces pressure in both contexts first.`,
      },
      {
        title: "Protect separate focus blocks per role",
        detail: `With ${profile.availability} available, alternate dedicated blocks to avoid context-switch fatigue.`,
      },
    ];
  }

  if (hasRole(profile.category, "Student")) {
    return [
      {
        title: "Start with the highest-stakes study block",
        detail: "Use your freshest attention on exam prep or deadline-heavy coursework before lighter review.",
      },
      {
        title: "Turn spare time into revision buffers",
        detail: `With ${profile.availability} available, protect one short session for catch-up before the week compresses.`,
      },
    ];
  }

  if (hasRole(profile.category, "Teacher")) {
    return [
      {
        title: "Prepare tomorrow before admin expands",
        detail: "Pathly keeps lesson-critical work ahead of grading and reactive communication.",
      },
      {
        title: "Batch lighter follow-up after the main prep",
        detail: `Your current style is ${profile.focusPreference.toLowerCase()}, so the dashboard keeps context switching late.`,
      },
    ];
  }

  const signals = detectGoalSignals(profile.mainGoal);


  if (signals.hasDeliveryTrack) {
    return [
      {
        title: "Clear the task that unblocks the next meeting",
        detail: "Prioritize the work that removes upstream pressure before reactive admin fills the day.",
      },
      {
        title: "Protect one dedicated execution window per subject",
        detail: `With ${profile.availability} available, group tasks by subject or project so delivery and day-to-day work stay in separate blocks.`,
      },
    ];
  }

  return [
    {
      title: "Ship the task that unlocks the next meeting",
      detail: "The recommendation favors work that reduces pressure on the rest of the day instead of just clearing inbox noise.",
    },
    {
      title: "Protect one calm execution window",
      detail: `With ${profile.availability} available and ${profile.focusPreference.toLowerCase()}, Pathly keeps one focused block visible.`,
    },
  ];
}

export function buildProfilePreview(profile: ProfileSnapshot, tasks?: TaskRecord[]): ProfilePreview {
  const previewTasks = tasks && tasks.length > 0 ? tasks : fallbackTasks(profile.category, profile.mainGoal);
  const recommendation = recommendTask(previewTasks, profile.category, profile.mainGoal);

  return {
    recommendation,
    insights: buildInsights(profile, previewTasks, recommendation),
    playbook: buildPlaybook(profile),
    previewTasks,
  };
}

export async function getDashboardData(supabase: SupabaseClient, user: User): Promise<DashboardData> {
  let setupHint: string | undefined;

  let { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, category, main_goal, focus_preference, availability, active_role")
    .eq("user_id", user.id)
    .maybeSingle<ProfileRecord>();

  if (isMissingColumnError(profileError, "active_role")) {
    const fallbackProfileQuery = await supabase
      .from("profiles")
      .select("full_name, category, main_goal, focus_preference, availability")
      .eq("user_id", user.id)
      .maybeSingle<Omit<ProfileRecord, "active_role">>();

    profileData = fallbackProfileQuery.data ? { ...fallbackProfileQuery.data, active_role: null } : null;
    profileError = fallbackProfileQuery.error;
  }

  let { data: taskData, error: taskError } = await supabase
    .from("tasks")
    .select("id, title, description, due_date, estimated_minutes, priority, status, subject, role_profile_id, task_lane")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .returns<TaskRecord[]>();

  if (isMissingSubjectColumnError(taskError) || isMissingColumnError(taskError, "role_profile_id") || isMissingColumnError(taskError, "task_lane")) {
    const fallbackTaskQuery = await supabase
      .from("tasks")
      .select("id, title, description, due_date, estimated_minutes, priority, status")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .returns<Array<Omit<TaskRecord, "subject">>>();

    taskData = fallbackTaskQuery.data?.map((task) => ({
      ...task,
      subject: null,
      role_profile_id: null,
      task_lane: null,
    })) as TaskRecord[] | null;
    taskError = fallbackTaskQuery.error;
  }

  const accountProfile = {
    fullName: profileData?.full_name ?? user.user_metadata.full_name ?? user.email?.split("@")[0] ?? "there",
    category: profileData?.category ?? user.user_metadata.category ?? "User",
    mainGoal:
      profileData?.main_goal ?? user.user_metadata.main_goal ?? "Clarify this week's biggest outcome.",
    focusPreference: profileData?.focus_preference ?? "Three meaningful priorities",
    availability: profileData?.availability ?? "90 minutes",
    activeRole: "all" as ActiveRole,
  };

  const derivedRoleProfiles = buildDerivedRoleProfiles(accountProfile);
  const availableRoles = derivedRoleProfiles.map((roleProfile) => roleProfile.role);
  accountProfile.activeRole = normalizeActiveRole(profileData?.active_role, availableRoles);

  let roleProfiles = derivedRoleProfiles;
  const roleProfilesQuery = await supabase
    .from("role_profiles")
    .select("id, role, main_goal, focus_preference, availability")
    .eq("user_id", user.id)
    .order("role", { ascending: true })
    .returns<RoleProfileRecord[]>();

  if (!isMissingTableError(roleProfilesQuery.error, "role_profiles") && !roleProfilesQuery.error) {
    const storedRoleProfiles = (roleProfilesQuery.data ?? [])
      .flatMap((item) =>
        isSupportedRole(item.role)
          ? [
              {
                id: item.id,
                role: item.role,
                mainGoal: item.main_goal ?? accountProfile.mainGoal,
                focusPreference: item.focus_preference ?? accountProfile.focusPreference,
                availability: item.availability ?? accountProfile.availability,
              },
            ]
          : [],
      );

    if (storedRoleProfiles.length > 0) {
      roleProfiles = storedRoleProfiles;
    } else if (availableRoles.length > 0) {
      const seededRoleProfiles = await supabase
        .from("role_profiles")
        .upsert(
          availableRoles.map((role) => ({
            user_id: user.id,
            role,
            main_goal: accountProfile.mainGoal,
            focus_preference: accountProfile.focusPreference,
            availability: accountProfile.availability,
          })),
          { onConflict: "user_id,role" },
        )
        .select("id, role, main_goal, focus_preference, availability")
        .returns<RoleProfileRecord[]>();

      if (!seededRoleProfiles.error && seededRoleProfiles.data) {
        roleProfiles = seededRoleProfiles.data
          .flatMap((item) =>
            isSupportedRole(item.role)
              ? [
                  {
                    id: item.id,
                    role: item.role,
                    mainGoal: item.main_goal ?? accountProfile.mainGoal,
                    focusPreference: item.focus_preference ?? accountProfile.focusPreference,
                    availability: item.availability ?? accountProfile.availability,
                  },
                ]
              : [],
          );
      }
    }
  }

  accountProfile.activeRole = normalizeActiveRole(accountProfile.activeRole, roleProfiles.map((item) => item.role));
  const profile = buildEffectiveProfile(accountProfile, roleProfiles, accountProfile.activeRole);

  if (!profileData && !profileError) {
    await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        full_name: accountProfile.fullName,
        category: accountProfile.category,
        main_goal: accountProfile.mainGoal,
        focus_preference: accountProfile.focusPreference,
        availability: accountProfile.availability,
        active_role: accountProfile.activeRole,
      },
      { onConflict: "user_id" },
    );
  }

  let allTasks = taskData ?? [];

  if (!taskError && allTasks.length === 0) {
    const seededTasks =
      roleProfiles.length > 0
        ? roleProfiles.flatMap((roleProfile) =>
            starterTasksForRole(roleProfile.role, roleProfile.mainGoal).map((task) => ({
              user_id: user.id,
              role_profile_id: roleProfile.id.startsWith("derived-") ? null : roleProfile.id,
              task_lane: "role" as TaskLaneValue,
              ...task,
            })),
          )
        : starterTasks(accountProfile.category, accountProfile.mainGoal).map((task) => ({
            user_id: user.id,
            role_profile_id: null,
            task_lane: "general" as TaskLaneValue,
            ...task,
          }));

    let { data: insertedTasks, error: insertError } = await supabase
      .from("tasks")
      .insert(seededTasks)
      .select("id, title, description, due_date, estimated_minutes, priority, status, subject, role_profile_id, task_lane")
      .returns<TaskRecord[]>();

    if (isMissingSubjectColumnError(insertError) || isMissingColumnError(insertError, "role_profile_id") || isMissingColumnError(insertError, "task_lane")) {
      const fallbackInsert = await supabase
        .from("tasks")
        .insert(seededTasks.map((task) => ({
          user_id: task.user_id,
          title: task.title,
          description: task.description,
          due_date: task.due_date,
          estimated_minutes: task.estimated_minutes,
          priority: task.priority,
          status: task.status,
        })))
        .select("id, title, description, due_date, estimated_minutes, priority, status")
        .returns<Array<Omit<TaskRecord, "subject">>>();

      insertedTasks = fallbackInsert.data?.map((task) => ({
        ...task,
        subject: null,
        role_profile_id: null,
        task_lane: null,
      })) as TaskRecord[] | null;
      insertError = fallbackInsert.error;
    }

    if (!insertError && insertedTasks?.length) {
      allTasks = insertedTasks;
    }
  }

  if (!taskError && shouldUpgradeTemplateTasks(allTasks, profile)) {
    const personalizedTasks = starterTasks(profile.category, profile.mainGoal);

    for (const [index, task] of allTasks.entries()) {
      const replacement = personalizedTasks[index];
      if (!replacement) {
        continue;
      }

      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          title: replacement.title,
          description: replacement.description,
          due_date: replacement.due_date,
          estimated_minutes: replacement.estimated_minutes,
          priority: replacement.priority,
        })
        .eq("id", task.id)
        .eq("user_id", user.id);

      if (!updateError) {
        allTasks[index] = {
          ...task,
          ...replacement,
          id: task.id,
        };
      }
    }
  }

  if ((profileError || taskError) && allTasks.length === 0) {
    setupHint = "Run Docs/supabase-schema.sql in Supabase to unlock saved profiles and tasks.";
    allTasks = fallbackTasks(profile.category, profile.mainGoal);
  }

  const roleProfileMap = buildRoleProfileMap(roleProfiles);
  const tasks = filterTasksByActiveRole(allTasks, accountProfile.activeRole, roleProfileMap, availableRoles).map((task) => ({
    ...task,
    resolved_role: resolveTaskRoles(task, roleProfileMap, availableRoles)[0] ?? null,
  }));

  const preview = buildProfilePreview(profile, tasks);
  const progress = buildProgress(profile, tasks);
  const { rolePlans, roleOverlaps } = buildRolePlans(accountProfile, allTasks, roleProfiles, accountProfile.activeRole);

  return {
    profile,
    accountProfile,
    activeRole: accountProfile.activeRole,
    availableRoles,
    roleProfiles,
    tasks,
    progress,
    groupedTasks: buildGroupedTasks(tasks),
    recommendation: preview.recommendation,
    mainObjective: buildMainObjective(profile, preview.recommendation),
    agenda: buildAgenda(profile, tasks, preview.recommendation),
    aiRole: buildAiRole(profile, tasks, preview.recommendation),
    aiBrief: buildAiBrief(profile, tasks, preview.recommendation, progress),
    insights: preview.insights,
    playbook: preview.playbook,
    rolePlans,
    roleOverlaps,
    setupHint,
  };
}
