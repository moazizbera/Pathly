import Link from "next/link";

import { isSupabaseConfigured } from "@/lib/supabase/config";

const categories = [
  {
    name: "Student",
    summary: "Balance exams, assignments, and study blocks without the usual panic.",
  },
  {
    name: "Employee",
    summary: "Protect deep work while staying ahead of meetings and deadlines.",
  },
  {
    name: "Teacher",
    summary: "Plan lessons, grading, and communication with less daily overload.",
  },
];

const highlights = [
  {
    title: "Role-aware onboarding",
    text: "Each user signs up, chooses a category, and gets a profile shaped around real responsibilities.",
  },
  {
    title: "Next-step guidance",
    text: "Pathly recommends the right task now instead of dumping another long to-do list on the user.",
  },
  {
    title: "Calm daily view",
    text: "Three clear priorities, one recommended action, and just enough context to move forward.",
  },
];

const workflow = [
  "Sign up and choose your role",
  "Build a profile around goals, deadlines, and weekly rhythm",
  "Get a dashboard with focused priorities and a guided next move",
];

export default function Home() {
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <main className="hero-grid min-h-screen overflow-hidden px-6 py-6 text-foreground sm:px-10 lg:px-14">
      <div className="ambient-orb ambient-orb-cyan" aria-hidden="true" />
      <div className="ambient-orb ambient-orb-indigo" aria-hidden="true" />
      <div className="ambient-orb ambient-orb-emerald" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="animate-fade-in orch-shell sticky top-4 z-20 flex items-center justify-between rounded-full px-5 py-3 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-cyan-600 text-sm font-semibold text-[#0f0f1e] shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              P
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-cyan-300 uppercase">Pathly</p>
              <p className="text-sm text-slate-400">Smart planning for every role</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
              <Link href="/demo">Demo</Link>
              <a href="#roles">Roles</a>
              <a href="#workflow">Workflow</a>
            </nav>
            <span className="status-pill status-pill-ready hidden rounded-full px-3 py-1 text-xs font-semibold md:inline-flex">Ready</span>
            <span className="status-pill hidden rounded-full px-3 py-1 text-xs font-semibold lg:inline-flex">AI-powered</span>
            <span
              className={`hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex ${
                supabaseConfigured
                  ? "badge-emerald"
                  : "badge-cyan"
              }`}
            >
              {supabaseConfigured ? "Live" : "Setup mode"}
            </span>
          </div>
        </header>

        <section className="animate-rise-in grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="glass-card rounded-4xl px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-14">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full badge-cyan px-4 py-2 text-xs font-semibold tracking-[0.24em] uppercase">
              <span className="signal-dot" />
              Design4Future 2026
            </div>
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold tracking-[0.24em] text-cyan-300 uppercase">
                Future-ready execution operating system
              </p>
              <h1 className="font-display max-w-4xl text-5xl leading-[0.93] tracking-tight text-slate-100 sm:text-6xl lg:text-7xl">
                One AI, one objective, zero wasted context-switches.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
                Pathly is the orchestration layer for multi-track execution. Students juggling exams and side projects.
                Developers managing parallel projects across deadlines. Teachers planning while staying responsive.
                <span className="block mt-3 text-cyan-300 font-medium">Your profile shapes the AI. Your AI shapes your day.</span>
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href={supabaseConfigured ? "/signup" : "/login"}
                className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-cyan-500 to-cyan-600 px-6 py-3 text-sm font-semibold text-[#0f0f1e] shadow-[0_0_24px_rgba(34,211,238,0.4)] transition-all duration-200 hover:shadow-[0_0_40px_rgba(34,211,238,0.6)]"
              >
                {supabaseConfigured ? "Get started" : "Sign in"}
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-full border-2 border-cyan-400/60 bg-cyan-500/20 px-6 py-3 text-sm font-semibold text-cyan-200 transition-all hover:border-cyan-300 hover:bg-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
              >
                ✦ Watch 2-min demo
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-300 transition-all hover:border-emerald-400/60 hover:bg-emerald-500/20"
              >
                Open dashboard
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <div className="hover-lift rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-5 backdrop-blur-sm transition-all hover:shadow-[0_0_24px_rgba(34,211,238,0.2)]">
              <p className="text-4xl font-semibold text-cyan-300">∞</p>
              <p className="mt-2 text-sm leading-7 text-slate-400">Subjects &amp; projects tracked in parallel without overlap</p>
              </div>
            <div className="hover-lift rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 backdrop-blur-sm transition-all hover:shadow-[0_0_24px_rgba(16,185,129,0.2)]">
              <p className="text-4xl font-semibold text-emerald-300">1</p>
              <p className="mt-2 text-sm leading-7 text-slate-400">clear next action (AI-chosen) at the center of every day</p>
              </div>
            <div className="hover-lift rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-5 backdrop-blur-sm transition-all hover:shadow-[0_0_24px_rgba(99,102,241,0.2)]">
              <p className="text-4xl font-semibold text-indigo-300">0</p>
              <p className="mt-2 text-sm leading-7 text-slate-400">cognitive load: AI reasoning visible, decisions trusted</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="animate-rise-in-delayed glass-card hover-lift rounded-4xl p-6 sm:p-8 border-cyan-500/20">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">Today in Pathly</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-100">Guided dashboard preview</h2>
                </div>
                <div className="badge-cyan">
                  Live concept
                </div>
              </div>

              <div className="space-y-4 rounded-3xl bg-linear-to-br from-slate-800 to-slate-900 p-5 text-slate-200 border border-cyan-500/20 shadow-[0_0_32px_rgba(34,211,238,0.15)]">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Recommended next step</span>
                  <span>25 min block</span>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-[0.24em] text-cyan-300 uppercase">Development lead profile</p>
                  <h3 className="mt-2 text-xl font-semibold leading-tight text-slate-100">Deliver Q2 module before client check-in</h3>
                </div>
                <p className="text-sm leading-7 text-slate-300">
                  Pathly chose this because it is due today, fits your focus window, and unlocks a meeting outcome.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-4">
                    <p className="text-xs font-semibold tracking-[0.2em] text-cyan-300 uppercase">AI Reasoning</p>
                    <ul className="mt-3 space-y-2 text-sm">
                      <li>📌 Q2 module: Due today</li>
                      <li>⏱️ Fits your 90-min window</li>
                      <li>🔗 Unblocks client review</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                    <p className="text-xs font-semibold tracking-[0.2em] text-emerald-300 uppercase">Your Context</p>
                    <ul className="mt-3 space-y-2 text-sm">
                      <li>🎯 Role: Dev Lead</li>
                      <li>⚡ Projects: Design + API + Docs</li>
                      <li>💡 Today: 2 major moves max</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-rise-in-soft glass-card hover-lift rounded-4xl p-6 sm:p-8 border-emerald-500/20">
              <p className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">Product promise</p>
              <blockquote className="font-display mt-4 text-2xl leading-tight text-slate-100 sm:text-3xl">
                &ldquo;The right plan should change with the person, not force every person into the same plan.&rdquo;
              </blockquote>
            </div>
          </div>
        </section>

        <section className="design-surface animate-rise-in-soft rounded-4xl p-6 sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-semibold tracking-[0.22em] text-cyan-300 uppercase">Design4Future advantage</p>
              <h2 className="mt-3 font-display text-4xl leading-tight text-slate-100 sm:text-5xl">
                Built to feel decisive in 30 seconds. Useful after 30 days.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                The interface is deliberately cinematic, but every visual decision maps to execution clarity: one objective,
                one agenda, one next action.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                <article className="rounded-3xl border border-cyan-500/25 bg-cyan-500/10 p-4">
                  <p className="text-2xl font-semibold text-cyan-300">01</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">Role-aware orchestration, not a generic task dump.</p>
                </article>
                <article className="rounded-3xl border border-emerald-500/25 bg-emerald-500/10 p-4">
                  <p className="text-2xl font-semibold text-emerald-300">02</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">Time-block agenda that respects cognitive limits.</p>
                </article>
                <article className="rounded-3xl border border-indigo-500/25 bg-indigo-500/10 p-4">
                  <p className="text-2xl font-semibold text-indigo-300">03</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">AI rationale visible, so users trust recommendations.</p>
                </article>
              </div>
            </div>

            <div className="timeline-rail rounded-3xl border border-slate-700/40 bg-slate-900/45 p-5 sm:p-6">
              <p className="text-sm font-semibold tracking-[0.2em] text-slate-300 uppercase">Product flow timeline</p>
              <div className="mt-5 space-y-5">
                <div className="timeline-node">
                  <p className="text-xs font-semibold tracking-[0.2em] text-cyan-300 uppercase">Step 01</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-100">Profile captures objective context</h3>
                  <p className="mt-1 text-sm leading-7 text-slate-400">Role, focus style, and main goal become the AI planning frame.</p>
                </div>
                <div className="timeline-node">
                  <p className="text-xs font-semibold tracking-[0.2em] text-emerald-300 uppercase">Step 02</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-100">Agenda appears with priority lanes</h3>
                  <p className="mt-1 text-sm leading-7 text-slate-400">Users see ordered blocks and can mark progress in one tap.</p>
                </div>
                <div className="timeline-node">
                  <p className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">Step 03</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-100">AI panel explains every recommendation</h3>
                  <p className="mt-1 text-sm leading-7 text-slate-400">No black box. Clear reasoning improves trust and adoption.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="roles" className="grid gap-4 lg:grid-cols-3">
          {categories.map((category, index) => {
            const badgeClass = index === 0 ? "badge-emerald" : index === 1 ? "badge-indigo" : "badge-cyan";
            return (
              <article
                key={category.name}
                className="animate-fade-up hover-lift glass-card rounded-4xl p-6 sm:p-7 border-cyan-500/10"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <span className={`inline-flex rounded-full text-xs font-semibold ${badgeClass}`}>
                  {category.name}
                </span>
                <h2 className="mt-5 text-2xl font-semibold text-slate-100">
                  Built for the realities of a {category.name.toLowerCase()}.
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-400">{category.summary}</p>
              </article>
            );
          })}  
        </section>

        <section className="animate-rise-in-soft grid gap-5 lg:grid-cols-3">
          <article className="glass-card rounded-4xl border-l-4 border-l-cyan-400 border-cyan-500/10 bg-linear-to-br from-slate-800/30 to-transparent p-6 sm:p-8">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/20 text-lg">📅</div>
            <h3 className="font-display text-2xl leading-tight text-slate-100">Subject-aware planning</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Tag tasks by subject or project. Pathly groups them into dedicated blocks so Physics, API work, and client prep never compete for the same mental space.
            </p>
            <p className="mt-4 text-xs font-medium text-cyan-300">→ No more context-switch loss between parallel commitments.</p>
          </article>

          <article className="glass-card rounded-4xl border-l-4 border-l-emerald-400 border-emerald-500/10 bg-linear-to-br from-slate-800/30 to-transparent p-6 sm:p-8">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/20 text-lg">🎯</div>
            <h3 className="font-display text-2xl leading-tight text-slate-100">Role-aware AI</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Whether you are a student, employee, or teacher, the AI reads your role, goal, and available time to surface the one move that creates the most downstream value.
            </p>
            <p className="mt-4 text-xs font-medium text-emerald-300">→ Recommendations shaped by who you are, not just what you wrote.</p>
          </article>

          <article className="glass-card rounded-4xl border-l-4 border-l-indigo-400 border-indigo-500/10 bg-linear-to-br from-slate-800/30 to-transparent p-6 sm:p-8">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/20 text-lg">🔍</div>
            <h3 className="font-display text-2xl leading-tight text-slate-100">Decision-transparent</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Every AI recommendation shows its reasoning, confidence score, risk radar, and follow-up guidance. No black box. Decisions you can trust and act on.
            </p>
            <p className="mt-4 text-xs font-medium text-indigo-300">→ AI logic visible means higher trust and faster adoption.</p>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div id="workflow" className="animate-rise-in-delayed glass-card rounded-4xl border-indigo-500/20 p-6 sm:p-8">
            <p className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">Workflow</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-slate-100">
              A tighter flow from sign-up to clarity.
            </h2>
            <div className="mt-8 space-y-4">
              {workflow.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-3xl border border-slate-700/50 bg-slate-800/30 p-4 transition-all hover:border-cyan-500/30 hover:bg-slate-800/50">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-cyan-600 text-sm font-semibold text-[#0f0f1e]">
                  0{index + 1}
                </div>
                <p className="pt-2 text-base leading-7 text-slate-300">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="highlights" className="animate-rise-in-soft glass-card rounded-4xl p-6 sm:p-8 border-emerald-500/20">
            <p className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">Why it stands out</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {highlights.map((item) => (
                <div key={item.title} className="hover-lift rounded-3xl border border-slate-700/50 bg-slate-800/20 p-5 transition-all hover:border-emerald-500/30 hover:bg-slate-800/40">
                  <h3 className="text-lg font-semibold text-slate-100">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="animate-fade-in animate-delay-400 glass-card rounded-4xl p-5 sm:p-6 border-slate-700/30">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-400">Pathly - Design4Future 2026</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/demo" className="text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors">Demo</Link>
              <Link href="/signup" className="text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors">Sign up</Link>
              <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors">Sign in</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
