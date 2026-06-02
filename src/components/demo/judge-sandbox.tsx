"use client";

import { useState } from "react";

type Persona = {
  id: string;
  label: string;
  roles: string;
  focusWindow: string;
  tension: string;
  goal: string;
  genericQueue: string[];
  pathlyQueue: string[];
  nextMove: string;
  reasoning: string[];
  proof: { label: string; value: string }[];
  accent: {
    pill: string;
    border: string;
    bg: string;
    text: string;
  };
};

const personas: Persona[] = [
  {
    id: "student",
    label: "Student sprint",
    roles: "Student",
    focusWindow: "90-minute evening block",
    tension: "Exam pressure is rising faster than homework load.",
    goal: "Finish revision for Friday's systems exam without missing a lab submission.",
    genericQueue: ["Reply to group chat", "Upload lab screenshots", "Read chapter 4", "Revise systems exam"],
    pathlyQueue: ["Revise systems exam", "Upload lab screenshots", "Read chapter 4", "Reply to group chat"],
    nextMove: "Start a 45-minute systems revision block before touching low-stakes admin.",
    reasoning: ["Exam date is closer than the lab deadline.", "The focus window is large enough for deep study.", "Finishing revision first lowers tomorrow's stress."],
    proof: [
      { label: "Decision time cut", value: "from 8 minutes to 30 seconds" },
      { label: "High-stakes task surfaced", value: "before lower-value admin" },
      { label: "Momentum gain", value: "+1 protected focus block tonight" },
    ],
    accent: {
      pill: "badge-cyan",
      border: "border-cyan-500/30",
      bg: "bg-cyan-500/10",
      text: "text-cyan-200",
    },
  },
  {
    id: "employee",
    label: "Employee crunch",
    roles: "Employee",
    focusWindow: "75-minute morning block",
    tension: "A client check-in depends on one deliverable landing first.",
    goal: "Ship the Q2 module before the 2 PM client review and avoid reactive meeting chaos.",
    genericQueue: ["Clear Slack", "Book standup notes", "Draft client summary", "Ship Q2 module"],
    pathlyQueue: ["Ship Q2 module", "Draft client summary", "Book standup notes", "Clear Slack"],
    nextMove: "Finish the Q2 module first because it unlocks the meeting outcome.",
    reasoning: ["The deliverable blocks the client review.", "The task fits the current deep-work window.", "Inbox activity does not change today's outcome."],
    proof: [
      { label: "Critical path exposed", value: "1 blocker identified immediately" },
      { label: "Context switches avoided", value: "3 low-value interruptions deferred" },
      { label: "Meeting readiness", value: "client review unblocked before noon" },
    ],
    accent: {
      pill: "badge-emerald",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      text: "text-emerald-200",
    },
  },
  {
    id: "teacher",
    label: "Teacher prep",
    roles: "Teacher",
    focusWindow: "60-minute early prep block",
    tension: "Tomorrow's class quality matters more than clearing grading backlog tonight.",
    goal: "Prepare tomorrow's lesson flow while keeping grading from snowballing.",
    genericQueue: ["Grade worksheet stack", "Reply to parent email", "Prepare tomorrow lesson", "Update classroom board"],
    pathlyQueue: ["Prepare tomorrow lesson", "Grade worksheet stack", "Reply to parent email", "Update classroom board"],
    nextMove: "Lock tomorrow's lesson sequence before spending energy on backlog cleanup.",
    reasoning: ["Classroom readiness is time-sensitive.", "The prep task has direct learner impact.", "Grading can be split into smaller follow-up blocks later."],
    proof: [
      { label: "Learner impact first", value: "tomorrow's class protected" },
      { label: "Backlog contained", value: "grading moved into smaller chunks" },
      { label: "Plan clarity", value: "one decisive first move shown instantly" },
    ],
    accent: {
      pill: "badge-indigo",
      border: "border-indigo-500/30",
      bg: "bg-indigo-500/10",
      text: "text-indigo-200",
    },
  },
];

export function JudgeSandbox() {
  const [activeId, setActiveId] = useState(personas[0].id);

  const activePersona = personas.find((persona) => persona.id === activeId) ?? personas[0];

  return (
    <section className="glass-card rounded-4xl p-6 sm:p-8 border-cyan-500/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.22em] text-cyan-300 uppercase">Judge sandbox</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-100">Switch personas and show the plan adapt live</h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-slate-400">
          This is the fastest proof that Pathly is a decision engine, not a static planner. Click one persona, then point at what changed.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {personas.map((persona) => {
          const isActive = persona.id === activePersona.id;

          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => setActiveId(persona.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                isActive
                  ? `${persona.accent.border} ${persona.accent.bg} ${persona.accent.text} shadow-[0_0_24px_rgba(34,211,238,0.18)]`
                  : "border-slate-700/40 bg-slate-800/40 text-slate-300 hover:border-slate-500/60 hover:text-slate-100"
              }`}
            >
              {persona.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-3xl border border-cyan-500/25 bg-cyan-500/10 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-cyan-300 uppercase">Active persona</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-100">{activePersona.label}</h3>
            <p className="mt-1 text-sm leading-7 text-slate-300">{activePersona.tension}</p>
          </div>
          <div className="rounded-2xl border border-slate-700/40 bg-slate-950/35 px-4 py-3 text-sm text-slate-200">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">Plan shifts to</p>
            <p className="mt-1 font-semibold text-cyan-200">{activePersona.nextMove}</p>
          </div>
        </div>
      </div>

      <div key={activePersona.id} className="mt-8 grid gap-6 animate-fade-up lg:grid-cols-[0.95fr_1.05fr]">
        <div className={`rounded-4xl border p-5 sm:p-6 ${activePersona.accent.border} ${activePersona.accent.bg}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${activePersona.accent.pill}`}>
                {activePersona.roles}
              </span>
              <h3 className="mt-4 text-2xl font-semibold text-slate-100">{activePersona.goal}</h3>
            </div>
            <div className="rounded-3xl border border-slate-700/40 bg-slate-950/40 px-4 py-3 text-right">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">Focus window</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{activePersona.focusWindow}</p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-300">{activePersona.tension}</p>

          <div className="mt-6 rounded-3xl border border-slate-700/40 bg-slate-950/45 p-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Pathly's first move</p>
            <p className="mt-3 text-lg font-semibold text-slate-100">{activePersona.nextMove}</p>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-300">
              {activePersona.reasoning.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {activePersona.proof.map((item) => (
              <article key={item.label} className="rounded-3xl border border-slate-700/40 bg-slate-950/40 p-4">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-100">{item.value}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <article className="rounded-4xl border border-rose-500/25 bg-rose-500/10 p-5 sm:p-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-rose-300 uppercase">Generic planner queue</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">Looks busy, but does not explain what matters first.</p>
            <ol className="mt-4 space-y-2 text-sm text-slate-100">
              {activePersona.genericQueue.map((item, index) => (
                <li key={item}>
                  {index + 1}. {item}
                </li>
              ))}
            </ol>
          </article>

          <article className="rounded-4xl border border-emerald-500/25 bg-emerald-500/10 p-5 sm:p-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-emerald-300 uppercase">Pathly priority lane</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">Same work, reordered around risk, role, and available focus.</p>
            <ol className="mt-4 space-y-2 text-sm text-slate-100">
              {activePersona.pathlyQueue.map((item, index) => (
                <li key={item}>
                  {index + 1}. {item}
                </li>
              ))}
            </ol>
          </article>

          <article className="rounded-4xl border border-cyan-500/25 bg-slate-900/50 p-5 sm:p-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-cyan-300 uppercase">What to say out loud</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              "When I switch across Student, Employee, and Teacher, the recommendation logic changes immediately. That is the core product moat: the same engine adapts to the person instead of forcing the person to adapt to the tool."
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}