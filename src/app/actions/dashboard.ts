"use server";

import { revalidatePath } from "next/cache";

import { isValidRoleCategory } from "@/lib/auth/schema";
import { getSupabaseSetupMessage, isSupabaseConfiguredAsync } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type TaskActionState = {
  success?: string;
  error?: string;
};

export type ProfileActionState = {
  success?: string;
  error?: string;
};

function isMissingSubjectColumnError(error: { code?: string; message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() ?? "";
  return message.includes("subject") && (message.includes("schema cache") || message.includes("column"));
}

export async function createTask(
  _previousState: TaskActionState | undefined,
  formData: FormData,
): Promise<TaskActionState | undefined> {
  if (!(await isSupabaseConfiguredAsync())) {
    return { error: getSupabaseSetupMessage() };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const estimatedMinutes = Number(formData.get("estimatedMinutes") ?? 25);
  const priority = String(formData.get("priority") ?? "medium").trim().toLowerCase();
  const subject = String(formData.get("subject") ?? "").trim();

  if (title.length < 3) {
    return { error: "Add a more specific task title." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in to create a task." };
  }

  const taskPayload = {
    user_id: user.id,
    title,
    description: description || null,
    due_date: dueDate || null,
    estimated_minutes: Number.isFinite(estimatedMinutes) ? estimatedMinutes : 25,
    priority: ["high", "medium", "low"].includes(priority) ? priority : "medium",
    status: "todo",
    subject: subject || null,
  };

  let { error } = await supabase.from("tasks").insert(taskPayload);

  if (isMissingSubjectColumnError(error)) {
    ({ error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title,
      description: description || null,
      due_date: dueDate || null,
      estimated_minutes: Number.isFinite(estimatedMinutes) ? estimatedMinutes : 25,
      priority: ["high", "medium", "low"].includes(priority) ? priority : "medium",
      status: "todo",
    }));
  }

  if (error) {
    return {
      error:
        error.code === "42P01"
          ? "Tasks table not found. Run Docs/supabase-schema.sql in Supabase first."
          : error.message,
    };
  }

  revalidatePath("/dashboard");
  return { success: "Task added to your Pathly dashboard." };
}

export async function completeTask(formData: FormData) {
  if (!(await isSupabaseConfiguredAsync())) {
    return;
  }

  const taskId = String(formData.get("taskId") ?? "");

  if (!taskId) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase.from("tasks").update({ status: "completed" }).eq("id", taskId).eq("user_id", user.id);
  revalidatePath("/dashboard");
}

export async function startTask(taskId: string): Promise<void> {
  if (!(await isSupabaseConfiguredAsync()) || !taskId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("tasks")
    .update({ status: "in_progress" })
    .eq("id", taskId)
    .eq("user_id", user.id)
    .neq("status", "completed");

  revalidatePath("/dashboard");
}

export async function updateTask(
  _previousState: TaskActionState | undefined,
  formData: FormData,
): Promise<TaskActionState | undefined> {
  if (!(await isSupabaseConfiguredAsync())) {
    return { error: getSupabaseSetupMessage() };
  }

  const taskId = String(formData.get("taskId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const estimatedMinutes = Number(formData.get("estimatedMinutes") ?? 25);
  const priority = String(formData.get("priority") ?? "medium").trim().toLowerCase();
  const subject = String(formData.get("subject") ?? "").trim();

  if (!taskId) {
    return { error: "Missing task id." };
  }

  if (title.length < 3) {
    return { error: "Add a more specific task title." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in to update a task." };
  }

  const baseUpdate = {
    title,
    description: description || null,
    due_date: dueDate || null,
    estimated_minutes: Number.isFinite(estimatedMinutes) ? estimatedMinutes : 25,
    priority: ["high", "medium", "low"].includes(priority) ? priority : "medium",
  };

  let { error } = await supabase
    .from("tasks")
    .update({
      ...baseUpdate,
      subject: subject || null,
    })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (isMissingSubjectColumnError(error)) {
    ({ error } = await supabase
      .from("tasks")
      .update(baseUpdate)
      .eq("id", taskId)
      .eq("user_id", user.id));
  }

  if (error) {
    return {
      error:
        error.code === "42P01"
          ? "Tasks table not found. Run Docs/supabase-schema.sql in Supabase first."
          : error.message,
    };
  }

  revalidatePath("/dashboard");
  return { success: "Task updated." };
}

export async function deleteTask(taskId: string): Promise<TaskActionState | undefined> {
  if (!(await isSupabaseConfiguredAsync())) {
    return { error: getSupabaseSetupMessage() };
  }

  if (!taskId) {
    return { error: "Missing task id." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in to delete a task." };
  }

  const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", user.id);

  if (error) {
    return {
      error:
        error.code === "42P01"
          ? "Tasks table not found. Run Docs/supabase-schema.sql in Supabase first."
          : error.message,
    };
  }

  revalidatePath("/dashboard");
  return { success: "Task deleted." };
}

export async function moveTaskToDate(taskId: string, dueDate: string | null): Promise<TaskActionState | undefined> {
  if (!(await isSupabaseConfiguredAsync())) {
    return { error: getSupabaseSetupMessage() };
  }

  if (!taskId) {
    return { error: "Missing task id." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in to move a task." };
  }

  const normalizedDueDate = dueDate?.trim() || null;
  const { error } = await supabase
    .from("tasks")
    .update({ due_date: normalizedDueDate })
    .eq("id", taskId)
    .eq("user_id", user.id)
    .neq("status", "completed");

  if (error) {
    return {
      error:
        error.code === "42P01"
          ? "Tasks table not found. Run Docs/supabase-schema.sql in Supabase first."
          : error.message,
    };
  }

  revalidatePath("/dashboard");
  return { success: normalizedDueDate ? "Task moved." : "Task unscheduled." };
}

export async function updateProfile(
  _previousState: ProfileActionState | undefined,
  formData: FormData,
): Promise<ProfileActionState | undefined> {
  if (!(await isSupabaseConfiguredAsync())) {
    return { error: getSupabaseSetupMessage() };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const selectedCategories = formData
    .getAll("categories")
    .map((item) => String(item).trim())
    .filter(Boolean);
  const category =
    selectedCategories.length > 0
      ? selectedCategories.join(",")
      : String(formData.get("category") ?? "").trim();
  const mainGoal = String(formData.get("mainGoal") ?? "").trim();
  const focusPreference = String(formData.get("focusPreference") ?? "").trim();
  const availability = String(formData.get("availability") ?? "").trim();

  if (fullName.length < 2) {
    return { error: "Add a name with at least 2 characters." };
  }

  if (!isValidRoleCategory(category)) {
    return { error: "Choose at least one valid role category." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in to update your profile." };
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      full_name: fullName,
      category,
      main_goal: mainGoal || null,
      focus_preference: focusPreference || "Three meaningful priorities",
      availability: availability || "90 minutes",
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return {
      error:
        error.code === "42P01"
          ? "Profiles table not found. Run Docs/supabase-schema.sql in Supabase first."
          : error.message,
    };
  }

  await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      category,
      main_goal: mainGoal,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: "Profile updated. Pathly will adapt your dashboard to the new context." };
}

export type SuggestedTask = {
  id: string;
  title: string;
  description: string;
  subject?: string;
  estimatedMinutes: number;
  priority: "high" | "medium" | "low";
  reasoning: string;
  roles?: Array<"Student" | "Employee" | "Teacher">;
  lane?: "role" | "general";
};

function parseSuggestionRoles(userCategory?: string): Array<"Student" | "Employee" | "Teacher"> {
  const seen = new Set<string>();

  return (userCategory ?? "Employee")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .flatMap((role) => {
      if (role === "student") return ["Student"] as const;
      if (role === "employee" || role === "professional") return ["Employee"] as const;
      if (role === "teacher") return ["Teacher"] as const;
      return [];
    })
    .filter((role) => {
      if (seen.has(role)) {
        return false;
      }

      seen.add(role);
      return true;
    });
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function extractKeywords(value?: string) {
  return (value ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 4);
}

function getDaySeed(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

function hashContext(parts: string[]) {
  return parts.join("|").split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

function rotateArray<T>(items: T[], offset: number) {
  if (items.length === 0) {
    return items;
  }

  const normalizedOffset = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(normalizedOffset), ...items.slice(0, normalizedOffset)];
}

function inferFocusSubject(existingTasks?: Array<{ title: string; subject?: string }>, mainGoal?: string) {
  const titledSubject = existingTasks?.find((task) => task.subject?.trim())?.subject?.trim();
  if (titledSubject) {
    return titledSubject;
  }

  const goalKeywords = extractKeywords(mainGoal);
  return goalKeywords[0] ? goalKeywords[0].replace(/^./, (char) => char.toUpperCase()) : undefined;
}

function buildContextAwareTemplates(
  goalText?: string,
  existingTasks?: Array<{ title: string; subject?: string }>,
  focusSubject?: string,
) {
  const contextText = [
    goalText ?? "",
    ...(existingTasks ?? []).flatMap((task) => [task.title, task.subject ?? ""]),
  ].join(" ");

  const keywords = new Set(extractKeywords(contextText));
  const templates: SuggestedTask[] = [];

  if (keywords.has("devpost") || keywords.has("hackathon") || keywords.has("submission")) {
    templates.push(
      {
        id: "hackathon-proof",
        title: "Lock the hackathon submission proof points",
        description: "Capture the core build screenshots, judging criteria wins, and outcome evidence for the submission.",
        subject: focusSubject ?? "Hackathon",
        estimatedMinutes: 50,
        priority: "high",
        reasoning: "Hackathon momentum is wasted if the build exists but the submission proof is scattered.",
      },
      {
        id: "hackathon-qa",
        title: "Run a final hackathon demo QA pass",
        description: "Check the main flow, remove rough edges, and confirm the demo sequence is stable before presenting.",
        subject: focusSubject ?? "Hackathon",
        estimatedMinutes: 35,
        priority: "high",
        reasoning: "A clean demo often matters as much as the feature list in a competition setting.",
      },
    );
  }

  if (keywords.has("pitch") || keywords.has("demo") || keywords.has("judges")) {
    templates.push({
      id: "pitch-narrative",
      title: "Refine the 90-second demo narrative",
      description: "Tighten the opening problem, product moat, and live wow moment so the demo lands fast.",
      subject: focusSubject ?? "Demo",
      estimatedMinutes: 30,
      priority: "high",
      reasoning: "When the story is crisp, judges remember the product for the right reasons.",
    });
  }

  if (keywords.has("enterprise") || keywords.has("stakeholder") || keywords.has("client")) {
    templates.push(
      {
        id: "enterprise-alignment",
        title: "Align enterprise stakeholders on next milestone",
        description: "Prepare the decisions, risks, and dependencies that need alignment before the next enterprise checkpoint.",
        subject: focusSubject ?? "Enterprise",
        estimatedMinutes: 40,
        priority: "high",
        reasoning: "Enterprise work stalls fastest when dependencies stay implicit and ownership is unclear.",
      },
      {
        id: "enterprise-risk",
        title: "Surface delivery risks for enterprise work",
        description: "List the blockers, assumptions, and handoffs most likely to threaten the next delivery window.",
        subject: focusSubject ?? "Enterprise",
        estimatedMinutes: 25,
        priority: "medium",
        reasoning: "Calling out delivery risk early is usually more valuable than reacting late.",
      },
    );
  }

  if (keywords.has("develop") || keywords.has("developer") || keywords.has("projects") || keywords.has("build")) {
    templates.push({
      id: "build-focus",
      title: "Protect a deep build block for the highest-risk project",
      description: "Reserve one uninterrupted session to move the most fragile delivery item before smaller tasks expand.",
      subject: focusSubject,
      estimatedMinutes: 75,
      priority: "high",
      reasoning: "Leadership across multiple projects usually breaks down when deep build work gets replaced by coordination.",
    });
  }

  return templates;
}

export async function suggestTasksForNextWeek(
  userCategory?: string,
  mainGoal?: string,
  existingTasks?: Array<{ title: string; subject?: string }>,
): Promise<{ tasks: SuggestedTask[]; error?: string }> {
  // AI logic to suggest tasks for next week based on user context
  const suggestions: SuggestedTask[] = [];
  const goalText = mainGoal?.trim();
  const focusSubject = inferFocusSubject(existingTasks, goalText);
  const goalKeywords = extractKeywords(goalText);
  const contextAwareTemplates = buildContextAwareTemplates(goalText, existingTasks, focusSubject);

  // Category-specific suggestions
  const categoryTemplates: Record<
    string,
    Array<{
      title: string;
      description: string;
      subject?: string;
      estimatedMinutes: number;
      priority: "high" | "medium" | "low";
      reasoning: string;
    }>
  > = {
    student: [
      {
        title: "Review lecture notes from this week",
        description: "Consolidate key concepts before the exam prep starts.",
        subject: "General",
        estimatedMinutes: 45,
        priority: "high",
        reasoning: "Consolidating notes early prevents cramming pressure.",
      },
      {
        title: "Start next assignment early",
        description: "Get a head start on the upcoming project or paper.",
        subject: "General",
        estimatedMinutes: 60,
        priority: "high",
        reasoning: "Early start builds confidence and catches issues early.",
      },
      {
        title: "Plan study schedule for next week",
        description: "Block out focused study hours to stay ahead.",
        estimatedMinutes: 20,
        priority: "medium",
        reasoning: "Planning beats last-minute scrambling.",
      },
      {
        title: "Connect with study group",
        description: "Sync with classmates on upcoming topics.",
        estimatedMinutes: 30,
        priority: "medium",
        reasoning: "Peer learning solidifies understanding.",
      },
    ],
    professional: [
      {
        title: "Prepare for next week's meetings",
        description: "Review agendas and gather needed materials.",
        estimatedMinutes: 40,
        priority: "high",
        reasoning: "Preparation ensures effective meetings.",
      },
      {
        title: "Complete pending deliverables",
        description: "Clear blockers before the week starts.",
        estimatedMinutes: 90,
        priority: "high",
        reasoning: "Starting fresh next week prevents carryover stress.",
      },
      {
        title: "Upskill in relevant area",
        description: "Invest 30 min in a tool or technique that moves the needle.",
        estimatedMinutes: 30,
        priority: "medium",
        reasoning: "Continuous learning keeps you competitive.",
      },
      {
        title: "Check in with mentor or peer",
        description: "Get feedback on recent work or decisions.",
        estimatedMinutes: 30,
        priority: "medium",
        reasoning: "Outside perspective prevents blind spots.",
      },
    ],
    employee: [
      {
        title: "Prepare for next week's meetings",
        description: "Review agendas and gather needed materials.",
        estimatedMinutes: 40,
        priority: "high",
        reasoning: "Preparation ensures effective meetings.",
      },
      {
        title: "Complete pending deliverables",
        description: "Clear blockers before the week starts.",
        estimatedMinutes: 90,
        priority: "high",
        reasoning: "Starting fresh next week prevents carryover stress.",
      },
      {
        title: "Upskill in relevant area",
        description: "Invest 30 min in a tool or technique that moves the needle.",
        estimatedMinutes: 30,
        priority: "medium",
        reasoning: "Continuous learning keeps you competitive.",
      },
      {
        title: "Check in with mentor or peer",
        description: "Get feedback on recent work or decisions.",
        estimatedMinutes: 30,
        priority: "medium",
        reasoning: "Outside perspective prevents blind spots.",
      },
    ],
    teacher: [
      {
        title: "Prepare next week's lesson anchor",
        description: "Outline the key learning objective and materials before admin work expands.",
        subject: "Teaching",
        estimatedMinutes: 50,
        priority: "high",
        reasoning: "Lesson clarity removes stress from the rest of the week.",
      },
      {
        title: "Batch grading for one focused block",
        description: "Group assessment review into one protected session instead of scattered fragments.",
        subject: "Teaching",
        estimatedMinutes: 45,
        priority: "high",
        reasoning: "Batching grading reduces context switching and keeps feedback consistent.",
      },
      {
        title: "Prepare support for the students who need extra help",
        description: "List the learners or classes most likely to need targeted follow-up next week.",
        subject: "Teaching",
        estimatedMinutes: 25,
        priority: "medium",
        reasoning: "Targeted intervention has more impact than reactive catch-up.",
      },
      {
        title: "Refresh tomorrow's classroom materials",
        description: "Check slides, worksheets, or examples so delivery feels lighter on the day.",
        subject: "Teaching",
        estimatedMinutes: 20,
        priority: "medium",
        reasoning: "Small prep now prevents rushed teaching later.",
      },
    ],
    general: [
      {
        title: "Set one weekly focus block",
        description: "Reserve a protected session for the most important work before reactive tasks fill the week.",
        estimatedMinutes: 25,
        priority: "medium",
        reasoning: "A visible focus block helps every role, not just one of them.",
      },
      {
        title: "Review next week's blockers",
        description: "List the one or two things most likely to slow you down and decide how to remove them early.",
        estimatedMinutes: 20,
        priority: "high",
        reasoning: "Cross-role friction is easier to fix before the week becomes crowded.",
      },
      {
        title: "Rebalance your calendar for realistic energy",
        description: "Move or trim low-value commitments so the week still has room for deep work and recovery.",
        estimatedMinutes: 30,
        priority: "medium",
        reasoning: "A realistic calendar supports every role you are balancing.",
      },
    ],
  };

  const selectedRoles = parseSuggestionRoles(userCategory);
  const roleTemplates = (selectedRoles.length > 0 ? selectedRoles : ["Employee"]).flatMap((role) => {
    const key = role.toLowerCase();

    return (categoryTemplates[key] ?? categoryTemplates.professional).map((template, index) => ({
      ...template,
      id: `${key}-${index}`,
      roles: [role] as Array<"Student" | "Employee" | "Teacher">,
      lane: "role" as const,
    }));
  });

  const generalTemplates = categoryTemplates.general.map((template, index) => ({
    ...template,
    id: `general-${index}`,
    lane: "general" as const,
  }));

  const goalDrivenTemplates: SuggestedTask[] = goalText
    ? [
        {
          id: "goal-anchor",
          title: `Make measurable progress on ${goalText}`,
          description: "Protect a focused session that moves the main goal forward before reactive work expands.",
          subject: focusSubject,
          estimatedMinutes: 60,
          priority: "high",
          reasoning: "Your main goal should create next week's first protected block, not become background intent.",
          lane: "general",
        },
        {
          id: "goal-review",
          title: `Review blockers for ${goalText}`,
          description: "List the one or two blockers most likely to slow next week's execution.",
          subject: focusSubject,
          estimatedMinutes: 25,
          priority: "medium",
          reasoning: "Removing blockers early makes the rest of the week feel lighter and more predictable.",
          lane: "general",
        },
      ]
    : [];

  const subjectDrivenTemplates = (existingTasks ?? []).reduce<SuggestedTask[]>((allTasks, task, index) => {
    const subject = task.subject?.trim();
    if (!subject) {
      return allTasks;
    }

    allTasks.push({
      id: `subject-${index}`,
      title: `Advance ${subject} work before backlog builds`,
      description: `Create one focused session for ${subject} so important work does not stay scattered across the week.`,
      subject,
      estimatedMinutes: 45,
      priority: index === 0 ? "high" : "medium",
      reasoning: `${subject} already appears in your task list, so it should receive a deliberate planning block instead of ad-hoc attention.`,
      lane: "general",
    });

    return allTasks;
  }, []);

  const personalizedTemplates = [...generalTemplates, ...roleTemplates].map((template, index) => {
    const titleKeyword = goalKeywords.find((keyword) => !normalizeText(template.title).includes(keyword));
    const subject = template.subject ?? focusSubject;
    const personalizedDescription = goalText
      ? `${template.description} This supports your goal: ${goalText}.`
      : template.description;

    return {
      id: `template-${index}`,
      title:
        titleKeyword && template.priority === "high"
          ? `${template.title} for ${titleKeyword}`
          : template.title,
      description: personalizedDescription,
      subject,
      estimatedMinutes: template.estimatedMinutes,
      priority: template.priority,
      reasoning: goalText ? `${template.reasoning} It aligns with your current goal.` : template.reasoning,
      roles: "roles" in template ? template.roles : undefined,
      lane: template.lane,
    } satisfies SuggestedTask;
  });

  const daySeed = getDaySeed(new Date());
  const contextSeed = hashContext([
    userCategory ?? "employee",
    goalText ?? "",
    ...(existingTasks ?? []).map((task) => `${task.subject ?? ""}:${task.title}`),
  ]);
  const priorityTemplates = [...contextAwareTemplates, ...goalDrivenTemplates, ...subjectDrivenTemplates];
  const rotatedTemplates = [
    ...priorityTemplates,
    ...rotateArray(personalizedTemplates, daySeed + contextSeed),
  ];

  // Filter out duplicates with existing tasks
  const existingTitles = new Set(existingTasks?.map((t) => normalizeText(t.title)) ?? []);
  const seenTitles = new Set<string>();

  for (const template of rotatedTemplates) {
    const normalizedTitle = normalizeText(template.title);
    if (!existingTitles.has(normalizedTitle) && !seenTitles.has(normalizedTitle)) {
      seenTitles.add(normalizedTitle);
      suggestions.push(template);
      continue;
    }

    const existingSuggestion = suggestions.find((item) => normalizeText(item.title) === normalizedTitle);
    if (existingSuggestion && template.roles?.length) {
      existingSuggestion.roles = Array.from(new Set([...(existingSuggestion.roles ?? []), ...template.roles]));
      if ((existingSuggestion.roles?.length ?? 0) > 1) {
        existingSuggestion.lane = "role";
      }
    }
  }

  // Limit to 5 suggestions
  return { tasks: suggestions.slice(0, 5) };
}
