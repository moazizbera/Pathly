"use client";

import { useState } from "react";

import { Dialog } from "@/components/ui/dialog";
import type { TaskRecord } from "@/lib/dashboard-data";

export type TaskSupportProfile = {
  category: string;
  mainGoal: string;
};

type TaskResourcePanelProps = {
  recommendation: {
    title: string;
    reason: string;
    estimatedMinutes: number;
    coachMessage: string;
  };
  profile: TaskSupportProfile;
  tasks: TaskRecord[];
};

type ResourceBlueprint = {
  label: string;
  help: string;
  solution: string[];
  resources: string[];
  accent: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function detectBlueprint(taskText: string, category: string): ResourceBlueprint {
  const text = normalize(taskText);
  const roleText = normalize(category);

  if (/devpost|hackathon|submission|judge|demo|pitch/.test(text)) {
    return {
      label: "Demo delivery support",
      help: "Turn the task into a clear submission move: proof, narrative, and demo stability first.",
      solution: [
        "Lock the single strongest problem-solution story before polishing edges.",
        "Capture proof: screenshots, live flow, and 2-3 measurable differentiators.",
        "Run one final demo pass from landing page to dashboard without improvising.",
      ],
      resources: [
        "Submission checklist: problem, solution, proof, stack, and impact.",
        "Pitch frame: problem → why current tools fail → Pathly → live wow moment.",
        "Demo assets: screenshots, one fallback screen, and one 90-second script.",
      ],
      accent: "border-cyan-500/25 bg-cyan-500/8",
    };
  }

  if (/stakeholder|enterprise|client|delivery|milestone|project/.test(text)) {
    return {
      label: "Delivery execution support",
      help: "Reduce ambiguity before doing more work. Alignment and risk visibility matter most here.",
      solution: [
        "Write the exact outcome, owner, and deadline for this delivery step.",
        "List blockers or dependencies that could stop the next milestone.",
        "Send one concise update instead of letting stakeholders infer status.",
      ],
      resources: [
        "Mini brief: objective, dependency, blocker, next owner.",
        "Risk frame: what could slip, what is uncertain, what is already decided.",
        "Comms template: current status, next milestone, ask needed today.",
      ],
      accent: "border-emerald-500/25 bg-emerald-500/8",
    };
  }

  if (/exam|study|revision|assignment|course|quiz/.test(text) || roleText.includes("student")) {
    return {
      label: "Study support",
      help: "Protect one real focus block and define the output before you start.",
      solution: [
        "Choose one topic or chapter instead of vague studying.",
        "Use a 25-50 minute block with one visible output: notes, questions, or solved problems.",
        "End by writing the next study entry point so restarting is easy.",
      ],
      resources: [
        "Study structure: topic goal, recall practice, short review loop.",
        "Quick output options: summary sheet, flashcards, worked examples.",
        "Energy tip: high-effort study first, admin or reading second.",
      ],
      accent: "border-indigo-500/25 bg-indigo-500/8",
    };
  }

  if (/lesson|grading|class|curriculum|student prep/.test(text) || roleText.includes("teacher")) {
    return {
      label: "Teaching support",
      help: "Prioritize classroom readiness before backlog cleanup.",
      solution: [
        "Define what learners must be able to do at the end of the session.",
        "Prepare the opener and the hardest transition first.",
        "Batch grading separately so planning time stays protected.",
      ],
      resources: [
        "Lesson frame: opener, core activity, quick check, close.",
        "Prep checklist: materials, timing, fallback activity.",
        "Grading rule: batch similar items instead of mixing planning and grading.",
      ],
      accent: "border-amber-500/25 bg-amber-500/8",
    };
  }

  if (/write|draft|summary|document|report/.test(text)) {
    return {
      label: "Writing support",
      help: "Get to a rough draft fast. Clarity comes from structure before polish.",
      solution: [
        "Write the headline or conclusion first so the draft has direction.",
        "Outline three sections before filling them in.",
        "Finish the rough draft in one pass, then edit once for clarity.",
      ],
      resources: [
        "Writing frame: purpose, three key points, closing action.",
        "Draft rule: messy first version, cleaner second version.",
        "Quality check: can someone act after reading it once?",
      ],
      accent: "border-rose-500/25 bg-rose-500/8",
    };
  }

  return {
    label: "Execution support",
    help: "Turn this task into a small, finishable move with a clear output and no hidden ambiguity.",
    solution: [
      "Define the exact finished state before starting.",
      "Protect one uninterrupted block sized to the estimate.",
      "If blocked after 10 minutes, write the blocker and switch deliberately rather than drifting.",
    ],
    resources: [
      "Execution checklist: goal, blocker, finish state, next follow-up.",
      "Focus rule: one block, one task, one visible output.",
      "Recovery rule: shrink scope before abandoning momentum.",
    ],
    accent: "border-slate-700/40 bg-slate-800/25",
  };
}

function buildBlueprintForTask(task: Pick<TaskRecord, "title" | "description" | "subject">, profile: TaskSupportProfile) {
  const taskText = `${task.title} ${task.description ?? ""} ${task.subject ?? ""} ${profile.mainGoal}`;
  return detectBlueprint(taskText, profile.category);
}

type TaskHelpButtonProps = {
  task: Pick<TaskRecord, "title" | "description" | "subject" | "estimated_minutes">;
  profile: TaskSupportProfile;
  className?: string;
};

export function TaskHelpButton({ task, profile, className }: TaskHelpButtonProps) {
  const [open, setOpen] = useState(false);
  const blueprint = buildBlueprintForTask(task, profile);

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        title="Help for this task"
        className={className ?? "flex h-5 w-5 items-center justify-center rounded-full border border-cyan-500/35 bg-cyan-500/10 text-[11px] font-semibold text-cyan-200 transition-all hover:border-cyan-400/60 hover:bg-cyan-500/20 hover:text-cyan-100"}
      >
        ?
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Task help & resources">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700/40 bg-slate-900/35 px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-cyan-300 uppercase">Task</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{task.title}</p>
                {task.description ? <p className="mt-1 text-xs leading-5 text-slate-400">{task.description}</p> : null}
              </div>
              <span className="rounded-full border border-slate-600/40 bg-slate-950/40 px-3 py-1 text-[11px] font-semibold text-slate-300">
                {blueprint.label}
              </span>
            </div>
          </div>

          <article className="rounded-2xl border border-slate-700/40 bg-slate-900/35 px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Help</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">{blueprint.help}</p>
          </article>

          <article className="rounded-2xl border border-slate-700/40 bg-slate-900/35 px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Solution</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-300">
              {blueprint.solution.map((step) => (
                <li key={step}>- {step}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-700/40 bg-slate-900/35 px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Resources</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-300">
              {blueprint.resources.map((resource) => (
                <li key={resource}>- {resource}</li>
              ))}
            </ul>
          </article>

          <p className="text-xs text-slate-500">
            Suggested block: {task.estimated_minutes ?? 25} min. Goal context: {profile.mainGoal}
          </p>
        </div>
      </Dialog>
    </>
  );
}

export function TaskResourcePanel({ recommendation, profile, tasks }: TaskResourcePanelProps) {
  const [open, setOpen] = useState(false);
  const matchedTask = tasks.find((task) => normalize(task.title) === normalize(recommendation.title));
  const blueprint = buildBlueprintForTask(
    {
      title: recommendation.title,
      description: matchedTask?.description ?? recommendation.reason,
      subject: matchedTask?.subject ?? null,
    },
    profile,
  );

  return (
    <>
      <section className={`rounded-3xl border px-5 py-4 ${blueprint.accent}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">Task support</p>
            <p className="mt-1 text-sm text-slate-300">
              Need help with <span className="font-semibold text-slate-100">{recommendation.title}</span>?
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-200 transition-all hover:border-cyan-400/60 hover:bg-cyan-500/20 hover:text-cyan-100"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/15 text-sm">
              ?
            </span>
            Help & resources
          </button>
        </div>
      </section>

      <Dialog open={open} onClose={() => setOpen(false)} title="Help & resources">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700/40 bg-slate-900/35 px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-cyan-300 uppercase">Current task</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{recommendation.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{recommendation.reason}</p>
              </div>
              <span className="rounded-full border border-slate-600/40 bg-slate-950/40 px-3 py-1 text-[11px] font-semibold text-slate-300">
                {blueprint.label}
              </span>
            </div>
          </div>

          <article className="rounded-2xl border border-slate-700/40 bg-slate-900/35 px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Help</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">{blueprint.help}</p>
          </article>

          <article className="rounded-2xl border border-slate-700/40 bg-slate-900/35 px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Solution</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-300">
              {blueprint.solution.map((step) => (
                <li key={step}>- {step}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-700/40 bg-slate-900/35 px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Resources</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-300">
              {blueprint.resources.map((resource) => (
                <li key={resource}>- {resource}</li>
              ))}
            </ul>
          </article>

          <p className="text-xs text-slate-500">
            Estimated block: {recommendation.estimatedMinutes} min. Coach note: {recommendation.coachMessage}
          </p>
        </div>
      </Dialog>
    </>
  );
}